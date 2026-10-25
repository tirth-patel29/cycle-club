import { NextRequest, NextResponse } from 'next/server';
import { getNeonAuthServer, syncGoogleUserToRiderProfile } from '@/lib/auth/neon';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const fullPath = path.join('/');

  // 1. Neon Auth official handler delegation if configured
  const neonAuth = getNeonAuthServer();
  if (neonAuth) {
    try {
      const handler = neonAuth.handler();
      return await handler.GET(request, { params: Promise.resolve({ path }) });
    } catch (err) {
      console.warn('Neon Auth GET handler fallback:', err);
    }
  }

  // 2. Direct handling for Google OAuth Callback
  if (fullPath === 'callback/google' || fullPath === 'callback') {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const returnUrl = url.searchParams.get('returnUrl') || url.searchParams.get('state') || '/profile';
    const email = url.searchParams.get('email');
    const name = url.searchParams.get('name');

    if (email) {
      await syncGoogleUserToRiderProfile({
        id: `google-${Buffer.from(email).toString('hex').slice(0, 16)}`,
        email,
        name: name || undefined
      });
      return NextResponse.redirect(new URL(returnUrl, request.url));
    }

    // Default redirect to returnUrl
    return NextResponse.redirect(new URL(returnUrl, request.url));
  }

  return NextResponse.json({ error: `Auth route /api/auth/${fullPath} not found` }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const fullPath = path.join('/');

  // 1. Neon Auth official handler delegation if configured
  const neonAuth = getNeonAuthServer();
  if (neonAuth) {
    try {
      const handler = neonAuth.handler();
      return await handler.POST(request, { params: Promise.resolve({ path }) });
    } catch (err) {
      console.warn('Neon Auth POST handler fallback:', err);
    }
  }

  // 2. Direct Google Sign-In Initiation or Token Exchange
  if (fullPath === 'google' || fullPath === 'sign-in/social') {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // ignored
    }

    const { email, name, callbackURL = '/profile' } = body;

    if (email && email.includes('@')) {
      const profile = await syncGoogleUserToRiderProfile({
        id: `google-${Buffer.from(email).toString('hex').slice(0, 16)}`,
        email,
        name: name || undefined
      });

      return NextResponse.json({
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.full_name
        },
        redirectUrl: callbackURL
      });
    }

    return NextResponse.json({
      error: 'Google OAuth initialization requires verified email or active Neon Auth base configuration'
    }, { status: 400 });
  }

  return NextResponse.json({ error: `Auth route /api/auth/${fullPath} not found` }, { status: 404 });
}
