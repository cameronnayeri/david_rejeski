import type { APIRoute } from 'astro';
import { deleteSketch, getSketch, updateSketch } from '../../../lib/db';
import { env } from '../../../lib/env';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id.' }, 400);
  if (!(await getSketch(env.DB, id))) return json({ error: 'Not found.' }, 404);

  const body = await request.json().catch(() => null);
  const title = String((body as any)?.title ?? '').trim();
  const image = String((body as any)?.image ?? '').trim();
  if (!title) return json({ error: 'Title is required.' }, 400);

  await updateSketch(env.DB, id, { title, image });
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id.' }, 400);
  await deleteSketch(env.DB, id);
  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
