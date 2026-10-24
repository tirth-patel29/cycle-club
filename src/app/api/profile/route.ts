import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { riderProfileSchema } from '@/lib/validations/registration';
import { RiderProfile } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  let profile: RiderProfile | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('rider_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      profile = data as RiderProfile;
    }
  } catch {
    // Fall back to in-memory store
  }

  if (!profile) {
    profile = (await db.getRiderProfile(user.id)) || null;
  }

  // Also fetch user's event registrations
  let registrations: any[] = [];
  try {
    const fetched = await db.getRegistrations({ riderId: user.id });
    if (Array.isArray(fetched)) {
      registrations = fetched;
    }
  } catch (err) {
    console.error('Failed to get registrations for rider:', err);
    registrations = [];
  }

  return NextResponse.json({
    user: {
      id: user.id,
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
  };

  let savedProfile: RiderProfile;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('rider_profiles')
      .upsert({
        id: user.id,
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.warn('Supabase profile upsert error, falling back to local store:', error.message);
      savedProfile = await db.upsertRiderProfile(user.id, payload);
    } else {
      savedProfile = data as RiderProfile;
      await db.upsertRiderProfile(user.id, payload);
    }
  } catch {
    savedProfile = await db.upsertRiderProfile(user.id, payload);
  }

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    profile: savedProfile,
  });
}
