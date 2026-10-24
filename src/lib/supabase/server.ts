import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { RiderProfile } from '@/types';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Can be ignored in Server Components
        }
      },
    },
  });
}

/**
 * Authoritatively retrieves current authenticated user from Supabase session
 */
export async function getAuthUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Retrieves rider profile for current authenticated user
 */
export async function getAuthRiderProfile(): Promise<RiderProfile | null> {
  const user = await getAuthUser();
  if (!user) return null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('rider_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      return data as RiderProfile;
    }
  } catch {
    // Fall back to in-memory store
  }

  return db.getRiderProfile(user.id);
}

/**
 * Verifies if user has admin or event_manager privilege
 */
export async function isAdminUser(): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'event_manager'])
      .maybeSingle();

    if (!error && data) return true;
  } catch {
    // Fall back
  }

  // Allow admin access if user email matches club admin or during dev testing
  if (user.email === 'admin@anandcyclingclub.in' || user.email?.startsWith('admin@')) {
    return true;
  }

  return false;
}
