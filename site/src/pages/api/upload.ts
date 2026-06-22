import type { APIRoute } from 'astro';
import { slugify } from '../../lib/db';
import { env } from '../../lib/env';

export const prerender = false;

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const file = form.get('file');
  const slug = slugify(String(form.get('slug') ?? 'misc')) || 'misc';

  if (!(file instanceof File)) return json({ error: 'No file uploaded.' }, 400);
  if (!ALLOWED.has(file.type)) return json({ error: `Unsupported type: ${file.type}` }, 400);
  if (file.size > MAX_BYTES) return json({ error: 'File too large (max 15MB).' }, 400);

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const key = `${slug}/${Date.now()}-${safeName}.${ext}`;

  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });

  return json({ ok: true, url: `/img/${key}` });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
