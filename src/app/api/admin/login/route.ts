import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie, ensureUuid } from '@/lib/auth';

// Strict Admin Credentials
const ADMIN_ACCOUNTS: Record<string, string> = {
  'tirthhpatel29@gmail.com': 'tirth#2957',
  'admin@anandcyclingclub.in': 'tirth#2957',
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

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  // Authoritative admin verification: otherwise failed
  const expectedPassword = ADMIN_ACCOUNTS[email];
  if (!expectedPassword || password !== expectedPassword) {
    return NextResponse.json(
      { error: 'Invalid admin credentials. Access denied.' },
      { status: 401 }
    );
  }

  const adminName = email.includes('tirth') ? 'Tirth Patel (Super Admin)' : 'Club Operations Admin';

  await setSessionCookie({
    userId: ensureUuid(`admin-${email}`),
    email,
    fullName: adminName,
    role: 'admin'
  });

  return NextResponse.json({
    success: true,
    message: `Welcome back, ${adminName}!`,
    user: {
      email,
      name: adminName,
      role: 'admin'
    }
  });
}
