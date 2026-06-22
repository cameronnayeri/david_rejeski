import type { APIRoute } from 'astro';
import { listProjects, listSketches } from '../../../lib/db';
import { env } from '../../../lib/env';

export const prerender = false;

// Deletes an R2 object — but only if no project or sketch still references it.
export const DELETE: APIRoute = async ({ params }) => {
  const key = params.key;
  if (!key) return json({ error: 'Missing key.' }, 400);

  const url = `/img/${key}`;
  const [projects, sketches] = await Promise.all([listProjects(env.DB), listSketches(env.DB)]);
  const inUse =
    projects.some((p) => p.images.includes(url)) || sketches.some((s) => s.image === url);

  if (inUse) {
    return json({ error: 'This image is still in use and cannot be deleted.' }, 409);
  }

  await env.MEDIA.delete(key);
  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
