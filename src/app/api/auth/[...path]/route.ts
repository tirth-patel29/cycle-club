import { NextRequest, NextResponse } from 'next/server';
import { getNeonAuthServer, syncGoogleUserToRiderProfile, NEON_AUTH_DEFAULT_BASE_URL } from '@/lib/auth/neon';

function sanitizeReturnUrl(urlStr: string | null): string {
  if (!urlStr) return '/profile';
  if (urlStr.startsWith('/') && !urlStr.startsWith('//') && !urlStr.startsWith('/\\')) {
    return urlStr;
  }
  return '/profile';
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const fullPath = path.join('/');

  // 1. Direct handling for Google OAuth Callback
  if (fullPath === 'callback/google' || fullPath === 'callback') {
    const url = new URL(request.url);
    const rawReturnUrl = url.searchParams.get('returnUrl') || url.searchParams.get('state');
    const returnUrl = sanitizeReturnUrl(rawReturnUrl);
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

  // 2. Delegate to Neon Auth handler
  const neonAuth = getNeonAuthServer();
  if (neonAuth) {
    try {
      const handler = neonAuth.handler();
      return await handler.GET(request, { params: Promise.resolve({ path }) });
    } catch (err) {
      console.warn('Neon Auth GET handler fallback:', err);
    }
  }

  return NextResponse.json({ error: `Auth route /api/auth/${fullPath} not found` }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path || [];
  const fullPath = path.join('/');

  // 1. Direct Google Sign-In Initiation via Neon Auth
  if (fullPath === 'sign-in/social' || fullPath === 'social/sign-in' || fullPath === 'google') {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // ignored
    }

    const baseUrl = process.env.NEON_AUTH_BASE_URL || NEON_AUTH_DEFAULT_BASE_URL;
    const origin = request.headers.get('origin') || request.nextUrl.origin || 'http://localhost:3000';
    const callbackURL = body.callbackURL || `${origin}/auth/callback?returnUrl=${encodeURIComponent(body.returnUrl || '/profile')}`;

    try {
      // Direct call to Neon Auth social sign-in endpoint
      const neonRes = await fetch(`${baseUrl}/sign-in/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('cookie') ? { 'Cookie': request.headers.get('cookie')! } : {})
        },
        body: JSON.stringify({
          provider: 'google',
          callbackURL
        })
      });

      const data = await neonRes.json();
      const response = NextResponse.json(data, { status: neonRes.status });

      // Forward any cookies set by Neon Auth
      const setCookieHeaders = (neonRes.headers as any).getSetCookie ? (neonRes.headers as any).getSetCookie() : [];
      if (setCookieHeaders && setCookieHeaders.length > 0) {
        for (const cookieStr of setCookieHeaders) {
          response.headers.append('Set-Cookie', cookieStr);
        }
      } else {
        const rawSetCookie = neonRes.headers.get('set-cookie');
        if (rawSetCookie) {
          response.headers.set('Set-Cookie', rawSetCookie);
        }
      }

      return response;
    } catch (err: any) {
      console.error('Neon Auth social sign-in error:', err);
      return NextResponse.json({ error: 'Failed to initiate Google sign-in: ' + err.message }, { status: 500 });
    }
  }

  // 2. Neon Auth official handler delegation if configured
  const neonAuth = getNeonAuthServer();
  if (neonAuth) {
    try {
      const handler = neonAuth.handler();
      return await handler.POST(request, { params: Promise.resolve({ path }) });
    } catch (err) {
      console.warn('Neon Auth POST handler fallback:', err);
    }
  }

  return NextResponse.json({ error: `Auth route /api/auth/${fullPath} not found` }, { status: 404 });
}
