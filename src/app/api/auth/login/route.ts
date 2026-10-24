import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { setSessionCookie, ensureUuid } from '@/lib/auth';

const PRELOADED_RIDERS: Record<string, { id: string; fullName: string; role?: string }> = {
  'rajesh.patel@example.in': {
    id: 'e0000000-0000-4000-a000-000000000001',
    fullName: 'Rajeshbhai Patel',
    role: 'rider'
  },
  'ananya.sharma@example.in': {
    id: 'e0000000-0000-4000-a000-000000000002',
    fullName: 'Ananya Sharma',
    role: 'rider'
  },
  'admin@anandcyclingclub.in': {
    id: 'a0000000-0000-4000-a000-000000000001',
    fullName: 'Club Operations Admin',
    role: 'admin'
  }
};

export async function POST(request: NextRequest) {
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

  // 1. Check preloaded demo riders or admin
  if (PRELOADED_RIDERS[email]) {
    const rider = PRELOADED_RIDERS[email];
    await setSessionCookie({
      userId: rider.id,
      email,
      fullName: rider.fullName,
      role: rider.role
    });

    return NextResponse.json({
      success: true,
      message: `Welcome back, ${rider.fullName}!`,
      user: {
        id: rider.id,
        email,
        full_name: rider.fullName,
        role: rider.role
      }
    });
  }

  // 2. Check registered riders in Neon PostgreSQL / database
  try {
    const profiles = await db.getRiderProfiles();
    const existing = profiles.find((p) => p.email.toLowerCase() === email);

    if (existing) {
      await setSessionCookie({
        userId: existing.id,
        email: existing.email,
        fullName: existing.full_name,
        role: 'rider'
      });

      return NextResponse.json({
        success: true,
        message: `Welcome back, ${existing.full_name}!`,
        user: {
          id: existing.id,
          email: existing.email,
          full_name: existing.full_name,
          role: 'rider'
        }
      });
    }

    // 3. Fallback for new credentials during development or if profile row is pending
    const generatedId = ensureUuid(email);
    const inferredName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    await db.upsertRiderProfile(generatedId, {
      full_name: inferredName,
      email,
      mobile_number: '9825012345',
      bicycle_type: 'Road'
    });

    await setSessionCookie({
      userId: generatedId,
      email,
      fullName: inferredName,
      role: 'rider'
    });

    return NextResponse.json({
      success: true,
      message: `Welcome, ${inferredName}!`,
      user: {
        id: generatedId,
        email,
        full_name: inferredName,
        role: 'rider'
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: err.message || 'Login failed. Please verify your credentials.' },
      { status: 500 }
    );
  }
}
