import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleUserToRiderProfile, getNeonAuthServer } from '@/lib/auth/neon';
import { createSessionToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const returnUrl = requestUrl.searchParams.get('returnUrl') || requestUrl.searchParams.get('state') || '/profile';
  const emailParam = requestUrl.searchParams.get('email');
  const nameParam = requestUrl.searchParams.get('name');
  const idParam = requestUrl.searchParams.get('id');

  let authenticatedUser: { id: string; email: string; name?: string; picture?: string } | null = null;

  // 1. Check Neon Auth getSession
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
      console.warn('Neon auth getSession error:', err);
    }
  }

  // 2. Extract Neon Auth session token cookie if getSession didn't resolve
  if (!authenticatedUser) {
    try {
      const sessionToken = request.cookies.get('__Secure-neon-auth.session_token')?.value ||
                           request.cookies.get('neon-auth.session_token')?.value ||
                           null;
      const dbUser = await db.getNeonAuthUser(sessionToken);
      if (dbUser?.email) {
        authenticatedUser = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name || undefined,
          picture: dbUser.image || undefined
        };
      }
    } catch (err) {
      console.warn('Direct database session check error:', err);
    }
  }

  // 3. Check direct query parameters
  if (!authenticatedUser && emailParam && emailParam.includes('@')) {
    authenticatedUser = {
      id: idParam || `google-${Buffer.from(emailParam).toString('hex').slice(0, 16)}`,
      email: emailParam,
      name: nameParam || undefined
    };
  }

  // 4. Set destination and build redirect response
  const destination = returnUrl.startsWith('/') ? returnUrl : '/profile';
  const response = NextResponse.redirect(new URL(destination, request.url));

  // 5. If user resolved, synchronize profile and persist in PostgreSQL
  if (authenticatedUser) {
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
  }

  return response;
}
