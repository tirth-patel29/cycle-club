import { cookies } from 'next/headers';

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role?: string;
}

const SESSION_COOKIE_NAME = 'acc_session_token';

const INSECURE_DEFAULT_SECRET = 'anand-cycling-club-secret-key-2026-gujarat';

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.trim() === '' || secret === INSECURE_DEFAULT_SECRET) {
      throw new Error(
        '[Security Configuration Error] In production, SESSION_SECRET must be explicitly set to a strong, random 32+ character string.'
      );
    }
    return secret;
  }
  // In development/test, fallback only if not provided
  return secret || INSECURE_DEFAULT_SECRET;
}

export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function ensureUuid(seed: string): string {
  if (!seed) return '00000000-0000-4000-a000-000000000001';
  if (isValidUuid(seed)) return seed;

  // Convert any string identifier to an RFC 4122 v4 compliant UUID
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  const raw = `${part1}${part2}${part3}${part4}`;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-4${raw.slice(13, 16)}-a${raw.slice(17, 20)}-${raw.slice(20, 32)}`;
}

// Simple, reliable base64url JSON token with HMAC signature
async function sign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Buffer.from(signature).toString('base64url');
}

async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    Buffer.from(signature, 'base64url'),
    enc.encode(data)
  );
}

export async function createSessionToken(session: UserSession): Promise<string> {
  const secret = getSessionSecret();
  const payload = JSON.stringify({
    ...session,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  const data = Buffer.from(payload).toString('base64url');
  const signature = await sign(data, secret);
  return `${data}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const secret = getSessionSecret();
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const isValid = await verify(data, signature, secret);
    if (!isValid) return null;

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(session: UserSession) {
  try {
    const cookieStore = await cookies();
    const token = await createSessionToken(session);
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
  } catch {
    // Non-request context (unit tests / CLI)
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    const cookiesToClear = [
      SESSION_COOKIE_NAME,
      '__Secure-neon-auth.session_token',
      'neon-auth.session_token',
      '__Secure-neon-auth.session_data',
      'neon-auth.session_data',
      '__Secure-neon-auth.session_challenge',
      'neon-auth.session_challenge',
      'better-auth.session_token',
      '__Secure-better-auth.session_token'
    ];
    for (const name of cookiesToClear) {
      cookieStore.delete(name);
    }
  } catch {
    // Non-request context
  }
}
