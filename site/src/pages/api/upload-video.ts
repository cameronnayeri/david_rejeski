import type { APIRoute } from 'astro';
import { slugify } from '../../lib/db';
import { env } from '../../lib/env';

export const prerender = false;

// Videos are too big for a single Worker request (~100MB cap), so the
// browser sends them in chunks via an R2 multipart upload:
//   POST ?action=create            { name, type, size, slug } → { key, uploadId }
//   PUT  ?action=part&key&uploadId&part=N   <raw chunk bytes>  → { partNumber, etag }
//   POST ?action=complete&key&uploadId  { parts }              → { url }
//   POST ?action=abort&key&uploadId
const ALLOWED = new Set(['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']);
const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_PART = 20 * 1024 * 1024;

export const POST: APIRoute = async ({ request, url }) => {
  const action = url.searchParams.get('action');

  if (action === 'create') {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const type = String(body.type ?? '');
    const size = Number(body.size ?? 0);
    const name = String(body.name ?? 'video');
    if (!ALLOWED.has(type)) return json({ error: `Unsupported video type: ${type || 'unknown'}. Use MP4, MOV or WebM.` }, 400);
    if (size > MAX_BYTES) return json({ error: 'Video too large (max 2GB).' }, 400);

    const slug = slugify(String(body.slug ?? 'misc')) || 'misc';
    const ext = (name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeName = slugify(name.replace(/\.[^.]+$/, '')) || 'video';
    const key = `${slug}/${Date.now()}-${safeName}.${ext}`;

    const upload = await env.MEDIA.createMultipartUpload(key, { httpMetadata: { contentType: type } });
    return json({ key: upload.key, uploadId: upload.uploadId });
  }

  const key = url.searchParams.get('key');
  const uploadId = url.searchParams.get('uploadId');
  if (!key || !uploadId) return json({ error: 'Missing key or uploadId.' }, 400);
  const upload = env.MEDIA.resumeMultipartUpload(key, uploadId);

  if (action === 'complete') {
    const body = (await request.json().catch(() => ({}))) as { parts?: R2UploadedPart[] };
    if (!Array.isArray(body.parts) || !body.parts.length) return json({ error: 'No parts.' }, 400);
    await upload.complete(body.parts);
    return json({ ok: true, url: `/img/${key}` });
  }

  if (action === 'abort') {
    await upload.abort();
    return json({ ok: true });
  }

  return json({ error: 'Unknown action.' }, 400);
};

export const PUT: APIRoute = async ({ request, url }) => {
  const key = url.searchParams.get('key');
  const uploadId = url.searchParams.get('uploadId');
  const part = Number(url.searchParams.get('part'));
  if (!key || !uploadId || !Number.isInteger(part) || part < 1) return json({ error: 'Bad part request.' }, 400);

  const chunk = await request.arrayBuffer();
  if (!chunk.byteLength || chunk.byteLength > MAX_PART) return json({ error: 'Bad chunk size.' }, 400);

  const uploaded = await env.MEDIA.resumeMultipartUpload(key, uploadId).uploadPart(part, chunk);
  return json({ partNumber: uploaded.partNumber, etag: uploaded.etag });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
