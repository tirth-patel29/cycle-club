import { NextResponse } from 'next/server';
import { getAuthUser, getAuthRiderProfile } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }

  const profile = await getAuthRiderProfile();
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || 'Rider'
    },
    profile
  });
}
