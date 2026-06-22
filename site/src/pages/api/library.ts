import type { APIRoute } from 'astro';
import { env } from '../../lib/env';

export const prerender = false;

// Lists everything in the R2 bucket so the admin can re-pick an
// already-uploaded image instead of re-uploading it.
export const GET: APIRoute = async () => {
  const listed = await env.MEDIA.list({ limit: 1000 });
  const images = listed.objects
    .sort((a, b) => (a.uploaded < b.uploaded ? 1 : -1))
    .map((o) => ({ key: o.key, url: `/img/${o.key}`, size: o.size }));

  return new Response(JSON.stringify({ images }), {
    headers: { 'content-type': 'application/json' },
  });
};
