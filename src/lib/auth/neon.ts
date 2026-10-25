import { createNeonAuth } from '@neondatabase/auth/next/server';
import { db } from '@/lib/db';
import { setSessionCookie, ensureUuid, getSession } from '@/lib/auth';

/**
 * Returns the official Neon Auth server instance if NEON_AUTH_BASE_URL is configured
 */
export function getNeonAuthServer() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET || process.env.SESSION_SECRET || 'anand-cycling-club-secret-key-2026-gujarat';

  if (!baseUrl || baseUrl.includes('placeholder')) {
    return null;
  }

  try {
    return createNeonAuth({
      baseUrl,
      cookies: {
        secret: secret.padEnd(32, '0'),
        sessionDataTtl: 300
      }
    });
  } catch (err) {
    console.warn('Neon Auth initialization warning:', err);
    return null;
  }
}

/**
 * Handles post-Google login rider profile synchronization in Neon PostgreSQL
 * - Identifies user by stable Neon Auth ID or verified email
 * - Creates profile if first-time user with sensible defaults (Road bicycle)
 * - Preserves existing saved profile fields on returning logins
 * - Creates authoritative session token
 */
export async function syncGoogleUserToRiderProfile(userData: {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}) {
  const email = userData.email.toLowerCase().trim();
  const authUserId = userData.id;
  const fullName = userData.name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const profileUuid = ensureUuid(authUserId || email);
  // Look up existing profile by authUserId, profileUuid, or email
  const existing = (await db.getRiderProfile(authUserId)) || (await db.getRiderProfile(profileUuid)) || (await db.getRiderProfile(email));

  if (existing) {
    // Ensure auth_user_id is linked if missing, but preserve all user-edited profile details
    if (!existing.auth_user_id) {
      await db.upsertRiderProfile(existing.id, { auth_user_id: authUserId });
    }

    await setSessionCookie({
      userId: existing.id,
      email: existing.email,
      fullName: existing.full_name,
      role: 'rider'
    });

    return existing;
  }

  // New rider: Initialize profile with defaults
  const profile = await db.upsertRiderProfile(profileUuid, {
    auth_user_id: authUserId,
    email,
    full_name: fullName,
    mobile_number: '9825000000',
    bicycle_type: 'Road'
  });

  // Authoritatively set session cookie
  await setSessionCookie({
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: 'rider'
  });

  return profile;
}
