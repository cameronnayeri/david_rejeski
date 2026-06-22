import bcrypt from 'bcryptjs';

export const COOKIE_NAME = 'dr_session';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── Stateless signed-cookie sessions (HMAC-SHA256, no storage) ──

interface SessionPayload {
  uid: number;
  email: string;
  exp: number; // unix seconds
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSession(
  secret: string,
  uid: number,
  email: string,
): Promise<string> {
  const payload: SessionPayload = {
    uid,
    email,
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
  };
  const data = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${b64urlEncode(new Uint8Array(sig))}`;
}

export async function verifySession(
  secret: string,
  token: string | undefined,
): Promise<{ id: number; email: string } | null> {
  if (!token) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  try {
    const key = await hmacKey(secret);
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlDecode(sig),
      new TextEncoder().encode(data),
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(data))) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: payload.uid, email: payload.email };
  } catch {
    return null;
  }
}
