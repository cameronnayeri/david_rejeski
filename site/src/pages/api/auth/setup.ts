import type { APIRoute } from 'astro';
import { COOKIE_NAME, COOKIE_MAX_AGE, createSession, hashPassword } from '../../../lib/auth';
import { countUsers } from '../../../lib/db';
import { env } from '../../../lib/env';

export const prerender = false;

// Creates the very first admin. Disabled once any user exists.
export const POST: APIRoute = async ({ request, cookies }) => {
  if ((await countUsers(env.DB)) > 0) {
    return json({ error: 'Setup already completed.' }, 403);
  }

  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');

  if (!email || password.length < 8) {
    return json({ error: 'Email required and password must be at least 8 characters.' }, 400);
  }

  const hash = await hashPassword(password);
  const res = await env.DB.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .bind(email, hash)
    .run();

  const token = await createSession(env.SESSION_SECRET, res.meta.last_row_id as number, email);
  cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });

  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
