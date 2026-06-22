import type { APIRoute } from 'astro';
import { createSketch } from '../../../lib/db';
import { env } from '../../../lib/env';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const title = String((body as any)?.title ?? '').trim();
  const image = String((body as any)?.image ?? '').trim();
  if (!title) return json({ error: 'Title is required.' }, 400);

  const id = await createSketch(env.DB, { title, image });
  return json({ ok: true, id });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
