import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { riderProfileSchema } from '@/lib/validations/registration';
import { RiderProfile } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  // Fast direct parallel lookup via Neon PostgreSQL / db service
  const [profile, registrations] = await Promise.all([
    (async () => {
      let p = await db.getRiderProfile(user.id);
      if (!p && user.email) {
        p = await db.getRiderProfile(user.email);
      }
      return p;
    })(),
    (async () => {
      try {
        const fetched = await db.getRegistrations({ riderId: user.id });
        return Array.isArray(fetched) ? fetched : [];
      } catch (err) {
        console.error('Failed to get registrations for rider:', err);
        return [];
      }
    })()
  ]);

  return NextResponse.json({
    user: {
      id: profile?.id || user.id,
      email: user.email,
    },
    profile,
    registrations,
  });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = riderProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const payload: Partial<RiderProfile> = {
    full_name: parsed.data.full_name,
    mobile_number: parsed.data.mobile_number,
    bicycle_type: parsed.data.bicycle_type,
    age: parsed.data.age,
    gender: parsed.data.gender,
    bicycle_brand: parsed.data.bicycle_brand || undefined,
    bicycle_model: parsed.data.bicycle_model || undefined,
    tshirt_size: parsed.data.tshirt_size || 'None',
    emergency_contact_name: parsed.data.emergency_contact_name || undefined,
    emergency_contact_phone: parsed.data.emergency_contact_phone || undefined,
    blood_group: parsed.data.blood_group || undefined,
    residential_address: parsed.data.residential_address || undefined,
    email: user.email,
    auth_user_id: user.id
  };

  let savedProfile: RiderProfile;

  try {
    savedProfile = await db.upsertRiderProfile(user.id, payload);
  } catch (err) {
    console.warn('Profile upsert fallback:', err);
    savedProfile = await db.upsertRiderProfile(user.id, payload);
  }

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    profile: savedProfile,
  });
}
