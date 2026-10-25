import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { RiderProfile } from '@/types';
import { getSession, ensureUuid } from '@/lib/auth';

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
 * Authoritatively retrieves current authenticated user from session cookie or Supabase session
 */
export async function getAuthUser() {
  // 1. Check local session cookie (works directly with Neon DB without external Supabase project)
  try {
    const session = await getSession();
    if (session) {
      return {
        id: ensureUuid(session.userId),
        email: session.email,
        user_metadata: {
          full_name: session.fullName,
          role: session.role
        }
      } as any;
    }
  } catch {
    // Continue to Supabase check
  }

  // 2. Check Supabase session if configured with real project
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) return user;
    } catch {
      // Ignored
    }
  }

  return null;
}

/**
 * Retrieves rider profile for current authenticated user
 */
export async function getAuthRiderProfile(): Promise<RiderProfile | null> {
  const user = await getAuthUser();
  if (!user) return null;

  // Retrieve from Neon DB / database service
  try {
    const profile = await db.getRiderProfile(user.id);
    if (profile) return profile;
  } catch {
    // Fall back
  }

  // Return a sensible default based on authenticated user session if profile row not yet upserted
  return {
    id: user.id,
    full_name: user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Rider'),
    email: user.email || 'rider@example.in',
    mobile_number: '9825012345',
    bicycle_type: 'Road',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Verifies if user has admin or event_manager privilege
 */
export async function isAdminUser(): Promise<boolean> {
  const user = await getAuthUser();
  if (!user) return false;

  if (user.user_metadata?.role === 'admin' || user.user_metadata?.role === 'event_manager') {
    return true;
  }

  // Check database admin roles table
  try {
    const pool = (db as any).getPool ? (db as any).getPool() : null;
    if (pool) {
      const res = await pool.query(
        "SELECT role FROM admin_roles WHERE user_id::text = $1 AND role IN ('admin', 'event_manager')",
        [user.id]
      );
      if (res.rows.length > 0) return true;
    }
  } catch {
    // Fall back
  }

  // Explicit authorized admin accounts only
  if (user.email === 'admin@anandcyclingclub.in' || user.email === 'tirthhpatel29@gmail.com') {
    return true;
  }

  return false;
}
