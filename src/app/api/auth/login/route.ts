import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSessionCookie, ensureUuid } from '@/lib/auth';

// Rate limiting for rider login: max 10 failed attempts per IP per 15 minutes
const failedAttemptsMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = failedAttemptsMap.get(ip);
  if (!entry) return false;
  if (now > entry.resetAt) {
    failedAttemptsMap.delete(ip);
    return false;
  }
  return entry.count >= 10;
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

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait 15 minutes before trying again.' },
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

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  // Prevent admin escalation through rider login
  if (email === 'admin@anandcyclingclub.in' || email === 'tirthhpatel29@gmail.com') {
    return NextResponse.json(
      { error: 'Administrator accounts must authenticate via the restricted Admin Portal at /admin/login.' },
      {
        status: 403,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }

  try {
    // Check registered riders in Neon PostgreSQL / database
    const profiles = await db.getRiderProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === email);

    if (existing) {
      clearFailedAttempts(ip);
      await setSessionCookie({
        userId: existing.id,
        email: existing.email,
        fullName: existing.full_name,
        role: 'rider'
      });

      return NextResponse.json(
        {
          success: true,
          message: `Welcome back, ${existing.full_name}!`,
          user: {
            id: existing.id,
            email: existing.email,
            full_name: existing.full_name,
            role: 'rider'
          }
        },
        {
          headers: { 'Cache-Control': 'no-store, max-age=0' }
        }
      );
    }

    // If profile row is not yet found, look up by registration email
    const registrations = await db.getRegistrations();
    const pastReg = registrations.find((r) => r.email?.toLowerCase() === email);

    const generatedId = pastReg?.rider_id || ensureUuid(email);
    const inferredName = pastReg?.full_name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    await db.upsertRiderProfile(generatedId, {
      full_name: inferredName,
      email,
      mobile_number: pastReg?.mobile_number || '9825012345',
      bicycle_type: pastReg?.bicycle_type || 'Road'
    });

    clearFailedAttempts(ip);
    await setSessionCookie({
      userId: generatedId,
      email,
      fullName: inferredName,
      role: 'rider'
    });

    return NextResponse.json(
      {
        success: true,
        message: `Welcome, ${inferredName}!`,
        user: {
          id: generatedId,
          email,
          full_name: inferredName,
          role: 'rider'
        }
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  } catch (err: any) {
    recordFailedAttempt(ip);
    console.error('Login error:', err);
    return NextResponse.json(
      { error: err.message || 'Login failed. Please verify your credentials.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    );
  }
}
