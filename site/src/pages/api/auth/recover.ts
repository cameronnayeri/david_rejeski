import type { APIRoute } from 'astro';
import { hashPassword } from '../../../lib/auth';
import { env } from '../../../lib/env';

export const prerender = false;

// Email-free password recovery. Requires the RECOVERY_KEY secret
// (set in the Cloudflare dashboard). Resets an existing admin's
// password, or creates a new admin if the email is unknown — which
// also makes this the way to add David as a second user.
export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const key = String(form.get('recovery_key') ?? '');
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');

  if (!env.RECOVERY_KEY || key !== env.RECOVERY_KEY) {
    return json({ error: 'Invalid recovery key.' }, 403);
  }
  if (!email || password.length < 8) {
    return json({ error: 'Email required and password must be at least 8 characters.' }, 400);
  }

  const hash = await hashPassword(password);
  await env.DB.prepare(
    `INSERT INTO users (email, password_hash) VALUES (?, ?)
     ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash`,
  )
    .bind(email, hash)
    .run();

  return json({ ok: true });
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
