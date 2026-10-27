import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleUserToRiderProfile, getNeonAuthServer, NEON_AUTH_DEFAULT_BASE_URL } from '@/lib/auth/neon';
import { createSessionToken } from '@/lib/auth';
import { db } from '@/lib/db';

function sanitizeReturnUrl(urlStr: string | null): string {
  if (!urlStr) return '/profile';
  if (urlStr.startsWith('/') && !urlStr.startsWith('//') && !urlStr.startsWith('/\\')) {
    return urlStr;
  }
  return '/profile';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const rawReturnUrl = requestUrl.searchParams.get('returnUrl') || requestUrl.searchParams.get('state') || '/profile';
  const destination = sanitizeReturnUrl(rawReturnUrl);

  // Check for OAuth error passed by provider
  const oauthError = requestUrl.searchParams.get('error') || requestUrl.searchParams.get('error_description');
  if (oauthError) {
    console.warn('OAuth provider returned error:', oauthError);
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(oauthError)}`, request.url));
  }

  const verifier = requestUrl.searchParams.get('neon_auth_session_verifier');
  const baseUrl = process.env.NEON_AUTH_BASE_URL || NEON_AUTH_DEFAULT_BASE_URL;

  let authenticatedUser: { id: string; email: string; name?: string; picture?: string } | null = null;
  const cookiesToForward: string[] = [];

  // 1. Perform Better Auth / Neon Auth session verifier token exchange if present
  if (verifier) {
    try {
      const exchangeUrl = new URL(`${baseUrl}/get-session`);
      exchangeUrl.searchParams.set('neon_auth_session_verifier', verifier);

      const exchangeRes = await fetch(exchangeUrl.toString(), {
        method: 'GET',
        headers: {
          'Origin': request.nextUrl.origin,
          ...(request.headers.get('cookie') ? { 'Cookie': request.headers.get('cookie')! } : {}),
          ...(request.headers.get('user-agent') ? { 'User-Agent': request.headers.get('user-agent')! } : {})
        }
      });

      if (exchangeRes.ok) {
        const data = await exchangeRes.json().catch(() => null);
        if (data?.user?.email) {
          authenticatedUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || undefined,
            picture: data.user.image || undefined
          };
        }

        // Collect cookies issued during exchange
        const setCookieHeaders = (exchangeRes.headers as any).getSetCookie
          ? (exchangeRes.headers as any).getSetCookie()
          : [exchangeRes.headers.get('set-cookie')].filter(Boolean);

        for (const cookieStr of setCookieHeaders) {
          cookiesToForward.push(cookieStr);
        }
      }
    } catch (exchangeErr) {
      console.warn('OAuth verifier exchange error:', exchangeErr);
    }
  }

  // 2. Check Neon Auth getSession
  if (!authenticatedUser) {
    const neonAuth = getNeonAuthServer();
    if (neonAuth) {
      try {
        const session = await neonAuth.getSession();
        if (session?.data?.user?.email) {
          authenticatedUser = {
            id: session.data.user.id,
            email: session.data.user.email,
            name: session.data.user.name || undefined,
            picture: (session.data.user as any).image || undefined
          };
        }
      } catch (err) {
        console.warn('Neon auth getSession error in callback:', err);
      }
    }
  }

  // 3. Extract Neon Auth session token cookie from request or database
  if (!authenticatedUser) {
    try {
      const sessionToken = request.cookies.get('__Secure-neon-auth.session_token')?.value ||
                           request.cookies.get('neon-auth.session_token')?.value ||
                           request.cookies.get('better-auth.session_token')?.value ||
                           request.cookies.get('__Secure-better-auth.session_token')?.value ||
                           null;

      if (sessionToken) {
        const dbUser = await db.getNeonAuthUser(sessionToken);
        if (dbUser?.email) {
          authenticatedUser = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name || undefined,
            picture: dbUser.image || undefined
          };
        }
      }
    } catch (err) {
      console.warn('Direct database session check error in callback:', err);
    }
  }

  // 4. Check direct query parameters fallback (if present in callback)
  const emailParam = requestUrl.searchParams.get('email');
  const nameParam = requestUrl.searchParams.get('name');
  const idParam = requestUrl.searchParams.get('id');
  if (!authenticatedUser && emailParam && emailParam.includes('@')) {
    authenticatedUser = {
      id: idParam || `google-${Buffer.from(emailParam).toString('hex').slice(0, 16)}`,
      email: emailParam,
      name: nameParam || undefined
    };
  }

  // If after all checks we still couldn't resolve the user, redirect to login with an error message
  if (!authenticatedUser) {
    console.warn('Google authentication callback could not resolve authenticated user.');
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('Google sign-in could not be verified. Please try again.')}&returnUrl=${encodeURIComponent(destination)}`, request.url)
    );
  }

  // Build clean destination redirect without OAuth query parameters
  const response = NextResponse.redirect(new URL(destination, request.url));

  // Forward any session cookies from Neon Auth exchange
  for (const cookieStr of cookiesToForward) {
    // Ensure SameSite=Lax and clean path
    const sanitized = cookieStr
      .replace(/SameSite=None/gi, 'SameSite=Lax')
      .replace(/;\s*Partitioned/gi, '');
    response.headers.append('Set-Cookie', sanitized);
  }

  // Synchronize profile with PostgreSQL and set authoritative acc_session_token cookie
  try {
    const profile = await syncGoogleUserToRiderProfile(authenticatedUser);
    const token = await createSessionToken({
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: 'rider'
    });

    response.cookies.set('acc_session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });
  } catch (err) {
    console.error('Callback sync profile error:', err);
  }

  return response;
}
