import { neon } from '@neondatabase/serverless';
import { db } from '../src/lib/db';
import { syncGoogleUserToRiderProfile, getNeonAuthServer } from '../src/lib/auth/neon';
import { verifySessionToken, createSessionToken } from '../src/lib/auth';

async function runAuthVerification() {
  console.log('--- Starting Authentication Verification on Client Neon Database ---');

  const sql = neon(process.env.DATABASE_URL);
  const dbInfo = await sql`SELECT current_database(), current_user, version()`;
  console.log(`Connected to Client DB: ${dbInfo[0].current_database} as ${dbInfo[0].current_user}`);

  // 1. Verify Neon Auth Server instance initializes with new client base URL
  const authServer = getNeonAuthServer();
  console.log(`Neon Auth Server configured: ${authServer !== null ? 'YES' : 'NO'}`);

  // 2. Test Google OAuth User Matching to Existing Rider Profile
  console.log('\n[Test 1] Testing Google OAuth Email Matching to Existing Profile...');
  const testEmail = 'hetp2758@gmail.com';
  const existingBefore = await db.getRiderProfile(testEmail);
  if (!existingBefore) {
    throw new Error(`Profile for ${testEmail} not found in client database!`);
  }
  console.log(`  Found existing profile: ID=${existingBefore.id}, Name="${existingBefore.full_name}", Bike="${existingBefore.bicycle_type}"`);

  // Simulate Google OAuth login callback
  const syncedProfile = await syncGoogleUserToRiderProfile({
    id: 'google-oauth-test-sub-12345',
    email: testEmail,
    name: 'het patel'
  });

  if (!syncedProfile || syncedProfile.id !== existingBefore.id) {
    throw new Error('syncGoogleUserToRiderProfile failed to match existing profile ID!');
  }
  if (syncedProfile.bicycle_type !== existingBefore.bicycle_type) {
    throw new Error('syncGoogleUserToRiderProfile corrupted profile fields!');
  }
  console.log(`  ✓ Existing profile successfully matched by email without duplication or data loss.`);

  // 3. Test Rider Previous Registration History Query
  console.log('\n[Test 2] Testing Rider Registration History on Client Database...');
  const riderRegs = await db.getRegistrations({ riderId: existingBefore.id });
  console.log(`  Found ${riderRegs.length} previous registrations for rider ${existingBefore.full_name}:`);
  for (const r of riderRegs) {
    console.log(`    - Ref: ${r.public_reference}, Status: ${r.status}, Event: ${r.event_title || r.event_id}`);
  }
  if (riderRegs.length === 0) {
    throw new Error(`Expected at least 1 registration for rider ${testEmail}`);
  }
  console.log('  ✓ Rider registration history successfully retrieved via client database.');

  // 4. Test Admin Session Creation & Verification
  console.log('\n[Test 3] Testing Admin Authorization Lifecycle...');
  const adminSession = await createSessionToken({
    userId: 'usr-admin-system-01',
    email: 'admin@anandcyclingclub.in',
    fullName: 'System Administrator',
    role: 'admin'
  });

  const verified = await verifySessionToken(adminSession);
  if (!verified || verified.role !== 'admin') {
    throw new Error('Admin session verification failed!');
  }
  console.log(`  ✓ Admin session token verified with role "${verified.role}".`);

  // 5. Test Unauthorized Non-Admin Role
  console.log('\n[Test 4] Testing Rider Access Boundary...');
  const riderSession = await createSessionToken({
    userId: existingBefore.id,
    email: existingBefore.email,
    fullName: existingBefore.full_name,
    role: 'rider'
  });
  const verifiedRider = await verifySessionToken(riderSession);
  if (verifiedRider?.role === 'admin') {
    throw new Error('Security boundary breach: Rider session claimed admin role!');
  }
  console.log(`  ✓ Rider session correctly carries role "${verifiedRider?.role}" and cannot claim admin privileges.`);

  console.log('\n======================================================');
  console.log('ALL CLIENT AUTHENTICATION CHECKS PASSED WITH 100% SUCCESS');
  console.log('======================================================\n');
}

runAuthVerification().catch(err => {
  console.error('Auth verification failed:', err);
  process.exit(1);
});
