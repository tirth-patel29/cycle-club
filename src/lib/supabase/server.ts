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

import { getNeonAuthServer, syncGoogleUserToRiderProfile } from '@/lib/auth/neon';

/**
 * Authoritatively retrieves current authenticated user from session cookie, Neon Auth session, or Supabase session
 */
export async function getAuthUser() {
  const cookieStore = await cookies();

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
    // Continue
  }

  // 2. Check Neon Auth session cookie (Google login / Better-Auth)
  try {
    const neonToken =
      cookieStore.get('__Secure-neon-auth.session_token')?.value ||
      cookieStore.get('neon-auth.session_token')?.value ||
      cookieStore.get('better-auth.session_token')?.value ||
      cookieStore.get('__Secure-better-auth.session_token')?.value;

    if (neonToken) {
      const neonUser = await db.getNeonAuthUser(neonToken);
      if (neonUser?.email) {
        // Ensure profile exists in rider_profiles
        let profile = await db.getRiderProfile(neonUser.id);
        if (!profile && neonUser.email) {
          profile = await db.getRiderProfile(neonUser.email);
        }
        if (!profile) {
          profile = await syncGoogleUserToRiderProfile(neonUser);
        }

        const resolvedId = profile ? profile.id : ensureUuid(neonUser.id);
        const fullName = profile?.full_name || neonUser.name || neonUser.email.split('@')[0];

        return {
          id: resolvedId,
          email: neonUser.email,
          user_metadata: {
            full_name: fullName,
            role: 'rider',
            image: neonUser.image
          }
        } as any;
      }
    }
  } catch (err) {
    console.warn('Neon auth getAuthUser check error:', err);
  }

  // 3. Check official Neon Auth getSession
  try {
    const neonAuth = getNeonAuthServer();
    if (neonAuth) {
      const sessionRes = await neonAuth.getSession();
      const u = sessionRes?.data?.user;
      if (u?.email) {
        let profile = await db.getRiderProfile(u.id);
        if (!profile && u.email) {
          profile = await db.getRiderProfile(u.email);
        }
        if (!profile) {
          profile = await syncGoogleUserToRiderProfile({
            id: u.id,
            email: u.email,
            name: u.name || undefined,
            picture: (u as any).image || undefined
          });
        }

        const resolvedId = profile ? profile.id : ensureUuid(u.id);
        const fullName = profile?.full_name || u.name || u.email.split('@')[0];

        return {
          id: resolvedId,
          email: u.email,
          user_metadata: {
            full_name: fullName,
            role: 'rider',
            image: (u as any).image
          }
        } as any;
      }
    }
  } catch {
    // Continue to Supabase check
  }

  // 4. Check Supabase session if configured with real project
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
    let profile = await db.getRiderProfile(user.id);
    if (!profile && user.email) {
      profile = await db.getRiderProfile(user.email);
    }
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

  // Check configured admin emails from environment or fallback list
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@anandcyclingclub.in,tirthhpatel29@gmail.com')
    .toLowerCase()
    .split(',')
    .map(e => e.trim());

  if (user.email && adminEmails.includes(user.email.toLowerCase())) {
    return true;
  }

  return false;
}
