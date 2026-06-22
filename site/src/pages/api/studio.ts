import type { APIRoute } from 'astro';
import { setSettings } from '../../lib/db';
import { STUDIO_FIELDS } from '../../lib/studio';
import { env } from '../../lib/env';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return json({ error: 'Invalid body.' }, 400);

  // Only accept known studio keys.
  const values: Record<string, string> = {};
  for (const field of STUDIO_FIELDS) {
    if (field.key in body) values[field.key] = String((body as any)[field.key] ?? '');
  }

  await setSettings(env.DB, values);
  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
