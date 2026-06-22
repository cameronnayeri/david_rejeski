import type { APIRoute } from 'astro';
import { COOKIE_NAME, COOKIE_MAX_AGE, createSession, verifyPassword } from '../../../lib/auth';
import { env } from '../../../lib/env';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');

  const user = await env.DB.prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: number; email: string; password_hash: string }>();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return new Response(JSON.stringify({ error: 'Invalid email or password.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const token = await createSession(env.SESSION_SECRET, user.id, user.email);
  cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
};
