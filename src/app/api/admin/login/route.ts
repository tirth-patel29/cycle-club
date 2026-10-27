import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { setSessionCookie, ensureUuid } from '@/lib/auth';

// Rate limiting for admin login: max 5 failed attempts per IP per 15 minutes
const failedAttemptsMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = failedAttemptsMap.get(ip);
  if (!entry) return false;
  if (now > entry.resetAt) {
    failedAttemptsMap.delete(ip);
    return false;
  }
  return entry.count >= 5;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = failedAttemptsMap.get(ip);
  if (!entry || now > entry.resetAt) {
    failedAttemptsMap.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(ip: string) {
  failedAttemptsMap.delete(ip);
}

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Configurable admin authorized emails
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'tirthhpatel29@gmail.com,admin@anandcyclingclub.in')
  .toLowerCase()
  .split(',')
  .map(e => e.trim());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tirth#2957';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many failed login attempts. Please wait 15 minutes before trying again.' },
      {
        status: 429,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = (body.password || '').trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  // Check email in authorized admin list
  const isAuthorizedEmail = ADMIN_EMAILS.includes(email);
  const isPasswordValid = safeCompare(password, ADMIN_PASSWORD);

  if (!isAuthorizedEmail || !isPasswordValid) {
    recordFailedAttempt(ip);
    return NextResponse.json(
      { error: 'Invalid admin credentials. Access denied.' },
      {
        status: 401,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }

  // Login successful
  clearFailedAttempts(ip);

  const adminName = email.includes('tirth') ? 'Tirth Patel (Super Admin)' : 'Club Operations Admin';

  await setSessionCookie({
    userId: ensureUuid(`admin-${email}`),
    email,
    fullName: adminName,
    role: 'admin'
  });

  return NextResponse.json(
    {
      success: true,
      message: `Welcome back, ${adminName}!`,
      user: {
        email,
        name: adminName,
        role: 'admin'
      }
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
}
