import type { APIRoute } from 'astro';
import { deleteProject, getProject, updateProject } from '../../../lib/db';
import { parseInput, uniqueSlug } from './index';
import { env } from '../../../lib/env';

export const prerender = false;

export const PUT: APIRoute = async ({ params, request }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id.' }, 400);

  const existing = await getProject(env.DB, id);
  if (!existing) return json({ error: 'Not found.' }, 404);

  const body = await request.json().catch(() => null);
  const parsed = parseInput(body);
  if ('error' in parsed) return json({ error: parsed.error }, 400);

  parsed.value.slug = await uniqueSlug(env.DB, parsed.value.slug, id);
  await updateProject(env.DB, id, parsed.value);
  return json({ ok: true, id });
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return json({ error: 'Bad id.' }, 400);
  await deleteProject(env.DB, id);
  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
