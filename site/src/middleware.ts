import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, verifySession } from './lib/auth';
import { env } from './lib/env';

// Routes reachable without a session.
const PUBLIC_PREFIXES = [
  '/api/auth/login',
  '/api/auth/setup',
  '/api/auth/recover',
];
const PUBLIC_EXACT = new Set(['/admin', '/admin/', '/admin/setup', '/admin/recover']);

function isProtected(pathname: string): boolean {
  const guarded = pathname.startsWith('/admin') || pathname.startsWith('/api');
  if (!guarded) return false;
  if (PUBLIC_EXACT.has(pathname)) return false;
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return false;
  return true;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const secret = env.SESSION_SECRET ?? '';
  const token = context.cookies.get(COOKIE_NAME)?.value;
  const user = secret ? await verifySession(secret, token) : null;

  if (user) context.locals.user = user;

  if (isProtected(pathname) && !user) {
    if (pathname.startsWith('/api')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    return context.redirect('/admin');
  }

  return next();
});
