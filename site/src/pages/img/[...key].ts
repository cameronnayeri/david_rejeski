import type { APIRoute } from 'astro';
import { env } from '../../lib/env';

export const prerender = false;

// Serves images and videos straight from R2. Public (excluded from auth in
// middleware because it lives outside /admin and /api). Honors Range
// requests, which browsers (Safari especially) need to play and seek video.
export const GET: APIRoute = async ({ params, request }) => {
  const key = params.key;
  if (!key) return new Response('Not found', { status: 404 });

  const range = request.headers.get('range');
  const object = await env.MEDIA.get(key, range ? { range: request.headers } : undefined);
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  const r = object.range as { offset?: number; length?: number; suffix?: number } | undefined;
  if (range && r && 'body' in object) {
    const offset = r.suffix !== undefined ? object.size - r.suffix : r.offset ?? 0;
    const length = r.suffix !== undefined ? r.suffix : r.length ?? object.size - offset;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set('content-length', String(length));
    return new Response(object.body, { status: 206, headers });
  }

  headers.set('content-length', String(object.size));
  return new Response('body' in object ? object.body : null, { headers });
};
