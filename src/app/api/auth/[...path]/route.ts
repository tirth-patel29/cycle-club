import { NextRequest, NextResponse } from 'next/server';
import { getNeonAuthServer, syncGoogleUserToRiderProfile, NEON_AUTH_DEFAULT_BASE_URL } from '@/lib/auth/neon';
import { db } from '@/lib/db';
import { getSession, ensureUuid } from '@/lib/auth';

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
      const res = await handler.GET(request, { params: Promise.resolve({ path }) });
      if (res && res.status !== 404) {
        return res;
      }
    } catch (err) {
      console.warn('Neon Auth GET handler fallback:', err);
    }
  }

  // 3. Fallback for /api/auth/get-session or /api/auth/session
  if (fullPath === 'get-session' || fullPath === 'session') {
    try {
      const session = await getSession();
      if (session) {
        return NextResponse.json({
          session: {
            id: ensureUuid(session.userId),
            userId: ensureUuid(session.userId),
            expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
          },
          user: {
            id: ensureUuid(session.userId),
            email: session.email,
            name: session.fullName
          }
        });
      }

      const neonToken = request.cookies.get('__Secure-neon-auth.session_token')?.value ||
                         request.cookies.get('neon-auth.session_token')?.value ||
                         request.cookies.get('better-auth.session_token')?.value ||
                         request.cookies.get('__Secure-better-auth.session_token')?.value;

      if (neonToken) {
        const dbUser = await db.getNeonAuthUser(neonToken);
        if (dbUser?.email) {
          return NextResponse.json({
            session: {
              id: dbUser.id,
              userId: dbUser.id,
              expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
            },
            user: {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              image: dbUser.image
            }
          });
        }
      }
    } catch (err) {
      console.warn('get-session fallback error:', err);
    }

    return NextResponse.json(null);
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
          'Origin': origin,
          ...(request.headers.get('cookie') ? { 'Cookie': request.headers.get('cookie')! } : {})
        },
        body: JSON.stringify({
          provider: 'google',
          callbackURL
        })
      });

      const data = await neonRes.json();
      const response = NextResponse.json(data, { status: neonRes.status });

      // Forward any cookies set by Neon Auth, standardizing SameSite and compatibility
      const setCookieHeaders = (neonRes.headers as any).getSetCookie
        ? (neonRes.headers as any).getSetCookie()
        : [neonRes.headers.get('set-cookie')].filter(Boolean);

      for (const cookieStr of setCookieHeaders) {
        if (!cookieStr) continue;
        const sanitized = cookieStr
          .replace(/SameSite=None/gi, 'SameSite=Lax')
          .replace(/;\s*Partitioned/gi, '');

        response.headers.append('Set-Cookie', sanitized);

        // If on non-HTTPS, also emit non-Secure prefixed cookie
        if (sanitized.includes('__Secure-neon-auth.') && !origin.startsWith('https://')) {
          const nonSecure = sanitized.replace('__Secure-neon-auth.', 'neon-auth.').replace(/;\s*Secure/gi, '');
          response.headers.append('Set-Cookie', nonSecure);
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
