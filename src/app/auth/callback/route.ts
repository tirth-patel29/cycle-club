import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleUserToRiderProfile, getNeonAuthServer } from '@/lib/auth/neon';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const returnUrl = requestUrl.searchParams.get('returnUrl') || requestUrl.searchParams.get('state') || '/profile';
  const email = requestUrl.searchParams.get('email');
  const name = requestUrl.searchParams.get('name');
  const id = requestUrl.searchParams.get('id');

  // 1. Check if Neon Auth server is active and has a session
  const neonAuth = getNeonAuthServer();
  if (neonAuth) {
    try {
      const session = await neonAuth.getSession();
      if (session?.data?.user) {
        await syncGoogleUserToRiderProfile({
          id: session.data.user.id,
          email: session.data.user.email,
          name: session.data.user.name || undefined
        });
      }
    } catch (err) {
      console.warn('Neon auth callback getSession:', err);
    }
  }

  // 2. If direct callback params provided (e.g. from Google OAuth redirect)
  if (email) {
    await syncGoogleUserToRiderProfile({
      id: id || `google-${Buffer.from(email).toString('hex').slice(0, 16)}`,
      email,
      name: name || undefined
    });
  }

  // Safe redirect back to original page or profile
  const destination = returnUrl.startsWith('/') ? returnUrl : '/profile';
  return NextResponse.redirect(new URL(destination, request.url));
}
