import assert from 'assert';
import pg from 'pg';
import { db } from '../src/lib/db';
import { syncGoogleUserToRiderProfile } from '../src/lib/auth/neon';
import { isAdminUser } from '../src/lib/supabase/server';
import { ensureUuid } from '../src/lib/auth';

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ASeXmfdZ42PK@ep-billowing-sunset-az44yy0j-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runNeonTestSuite() {
  console.log(`\n================ NEON AUTH + GOOGLE + EVENT CREATION TEST SUITE ================`);
  const pool = new pg.Pool({ connectionString });

  try {
    // -------------------------------------------------------------------------
    // 1. Rider Profile Google Login & Persistence
    // -------------------------------------------------------------------------
    console.log(`\n[Suite 1: Neon Auth Google Profile Persistence]`);

    const testGoogleEmail = `test.google.rider.${Date.now()}@gmail.com`;
    const testGoogleId = `google-oauth-${Date.now()}`;
    let createdProfileId = '';

    await test('first-time Google login creates rider profile with defaults', async () => {
      const profile = await syncGoogleUserToRiderProfile({
        id: testGoogleId,
        email: testGoogleEmail,
        name: 'Pratik Patel (Google)'
      });

      assert.ok(profile, 'Profile must be created');
      assert.strictEqual(profile.email, testGoogleEmail);
      assert.strictEqual(profile.full_name, 'Pratik Patel (Google)');
      assert.strictEqual(profile.bicycle_type, 'Road');
      createdProfileId = profile.id;

      // Verify in Neon PostgreSQL
      const dbRes = await pool.query('SELECT * FROM rider_profiles WHERE id = $1', [createdProfileId]);
      assert.strictEqual(dbRes.rows.length, 1);
      assert.strictEqual(dbRes.rows[0].auth_user_id, testGoogleId);
      assert.strictEqual(dbRes.rows[0].email, testGoogleEmail);
    });

    await test('concurrent or subsequent Google login preserves rider customized fields', async () => {
      // Rider updates their bicycle specs and mobile number
      await db.upsertRiderProfile(createdProfileId, {
        bicycle_type: 'Gravel Cycle',
        bicycle_brand: 'Canyon',
        bicycle_model: 'Grizl 7',
        mobile_number: '9825199999',
        tshirt_size: 'XL',
        age: 32,
        gender: 'Male'
      });

      // Subsequent Google login happens
      const returningProfile = await syncGoogleUserToRiderProfile({
        id: testGoogleId,
        email: testGoogleEmail,
        name: 'Pratik Patel (Google)'
      });

      // User-edited fields MUST NOT be overwritten by Google login
      assert.strictEqual(returningProfile.bicycle_type, 'Gravel Cycle');
      assert.strictEqual(returningProfile.bicycle_brand, 'Canyon');
      assert.strictEqual(returningProfile.bicycle_model, 'Grizl 7');
      assert.strictEqual(returningProfile.mobile_number, '9825199999');
      assert.strictEqual(returningProfile.tshirt_size, 'XL');
      assert.strictEqual(returningProfile.age, 32);
    });

    await test('enforces canonical 5 bicycle types in database and rejects invalid types', async () => {
      const validTypes = ['Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'];
      for (const bType of validTypes) {
        await db.upsertRiderProfile(createdProfileId, { bicycle_type: bType });
        const p = await db.getRiderProfile(createdProfileId);
        assert.strictEqual(p?.bicycle_type, bType);
      }

      // Check direct DB constraint rejects invalid type
      let threw = false;
      try {
        await pool.query(
          "UPDATE rider_profiles SET bicycle_type = 'E-Scooter' WHERE id = $1",
          [createdProfileId]
        );
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, true, 'Database check constraint must reject invalid bicycle types');
    });

    // -------------------------------------------------------------------------
    // 2. Admin Authorization & Protection
    // -------------------------------------------------------------------------
    console.log(`\n[Suite 2: Admin Security & Role Authorization]`);

    await test('regular Google rider cannot access admin privileges', async () => {
      const normalRiderId = ensureUuid(testGoogleId);
      const res = await pool.query(
        "SELECT role FROM admin_roles WHERE user_id = $1 AND role IN ('admin', 'event_manager')",
        [normalRiderId]
      );
      assert.strictEqual(res.rows.length, 0, 'New Google user must have zero admin roles');
    });

    await test('official admin accounts have verified administrator status', async () => {
      const tirthId = ensureUuid('admin-tirthhpatel29@gmail.com');
      const res = await pool.query(
        "SELECT role FROM admin_roles WHERE user_id = $1 AND role = 'admin'",
        [tirthId]
      );
      assert.strictEqual(res.rows.length, 1, 'Tirth superadmin must have admin role');
    });

    // -------------------------------------------------------------------------
    // 3. Admin Event Creation & Management
    // -------------------------------------------------------------------------
    console.log(`\n[Suite 3: Admin Event Creation & Neon Database Persistence]`);

    const testSlug = `automated-test-ride-${Date.now()}`;
    let createdEventId = '';

    await test('successfully inserts valid event into Neon PostgreSQL events table', async () => {
      const eventData = {
        title: 'Anand Sunset Century Stage',
        slug: testSlug,
        description: 'Automated test endurance ride through Charotar countryside.',
        cover_image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=80',
        venue: 'Anand Town Hall',
        location_description: 'Starting from Town Hall, Anand',
        starts_at: '2026-12-25T06:00:00Z',
        ends_at: '2026-12-25T11:00:00Z',
        distance_km: 100,
        elevation_gain_m: 150,
        difficulty: 'Endurance / Brevet',
        registration_fee_paise: 59900, // ₹599
        currency: 'INR',
        status: 'published',
        registration_opens_at: '2026-10-01T00:00:00Z',
        registration_closes_at: '2026-12-24T18:00:00Z'
      };

      const event = await db.createEvent(eventData);
      assert.ok(event, 'Event must be created');
      assert.strictEqual(event.slug, testSlug);
      assert.strictEqual(event.distance_km, 100);
      assert.strictEqual(event.registration_fee_paise, 59900);
      createdEventId = event.id;

      // Verify in Neon PostgreSQL table
      const dbRes = await pool.query('SELECT * FROM events WHERE id::text = $1', [createdEventId]);
      assert.strictEqual(dbRes.rows.length, 1);
      assert.strictEqual(dbRes.rows[0].slug, testSlug);
      assert.strictEqual(Number(dbRes.rows[0].distance_km), 100);
    });

    await test('duplicate slug creation is rejected with constraint error', async () => {
      let threw = false;
      try {
        await db.createEvent({
          title: 'Duplicate Slug Ride',
          slug: testSlug, // Reusing identical slug
          description: 'Duplicate',
          venue: 'Town Hall',
          starts_at: '2026-12-25T06:00:00Z',
          ends_at: '2026-12-25T11:00:00Z',
          distance_km: 50,
          elevation_gain_m: 50,
          difficulty: 'Moderate',
          registration_fee_paise: 29900,
          currency: 'INR',
          status: 'published',
          registration_opens_at: '2026-10-01T00:00:00Z',
          registration_closes_at: '2026-12-24T18:00:00Z'
        });
      } catch (err) {
        threw = true;
        assert.ok(err.message.includes('already exists'), 'Error message must specify duplicate slug');
      }
      assert.strictEqual(threw, true, 'Must reject duplicate event slug');
    });

    await test('updates event status from published to cancelled in Neon PostgreSQL', async () => {
      const updated = await db.updateEvent(createdEventId, { status: 'cancelled' });
      assert.ok(updated);
      assert.strictEqual(updated.status, 'cancelled');

      const dbRes = await pool.query('SELECT status FROM events WHERE id::text = $1', [createdEventId]);
      assert.strictEqual(dbRes.rows[0].status, 'cancelled');
    });

    await test('free event saves zero registration fee (0 paise)', async () => {
      const freeSlug = `free-test-ride-${Date.now()}`;
      const freeEvent = await db.createEvent({
        title: 'Community Morning Joyride',
        slug: freeSlug,
        description: 'Free community cycling gathering.',
        venue: 'Borsad Crossroads',
        starts_at: '2026-12-28T06:30:00Z',
        ends_at: '2026-12-28T08:30:00Z',
        distance_km: 20,
        elevation_gain_m: 20,
        difficulty: 'Easy / Leisure',
        registration_fee_paise: 0,
        currency: 'INR',
        status: 'published',
        registration_opens_at: '2026-10-01T00:00:00Z',
        registration_closes_at: '2026-12-27T18:00:00Z'
      });

      assert.strictEqual(freeEvent.registration_fee_paise, 0);

      const dbRes = await pool.query('SELECT registration_fee_paise FROM events WHERE id::text = $1', [freeEvent.id]);
      assert.strictEqual(Number(dbRes.rows[0].registration_fee_paise), 0);
    });

    // -------------------------------------------------------------------------
    // 4. Public Event Listing & Filtering
    // -------------------------------------------------------------------------
    console.log(`\n[Suite 4: Event Listing & Draft Privacy]`);

    await test('public listing returns published events from Neon DB', async () => {
      const publicEvents = await db.getEvents(false);
      assert.ok(publicEvents.length > 0);
      assert.ok(publicEvents.every(e => e.status === 'published'));
    });

    await test('draft events are excluded from public listing', async () => {
      const draftSlug = `draft-ride-${Date.now()}`;
      const draftEvent = await db.createEvent({
        title: 'Secret Upcoming Ultra',
        slug: draftSlug,
        description: 'Draft ultra.',
        venue: 'Anand Express Highway',
        starts_at: '2026-12-30T05:00:00Z',
        ends_at: '2026-12-30T15:00:00Z',
        distance_km: 200,
        elevation_gain_m: 300,
        difficulty: 'Endurance / Brevet',
        registration_fee_paise: 99900,
        currency: 'INR',
        status: 'draft',
        registration_opens_at: '2026-10-01T00:00:00Z',
        registration_closes_at: '2026-12-29T18:00:00Z'
      });

      const publicList = await db.getEvents(false);
      assert.strictEqual(publicList.some(e => e.id === draftEvent.id), false, 'Draft event must not appear publicly');

      const adminList = await db.getEvents(true);
      assert.strictEqual(adminList.some(e => e.id === draftEvent.id), true, 'Draft event must appear in admin view');
    });

    // -------------------------------------------------------------------------
    // 5. Payment Safety & Simulation
    // -------------------------------------------------------------------------
    console.log(`\n[Suite 5: Demo Payments & Razorpay Deactivation]`);

    await test('confirms Razorpay remains strictly disabled and payments are simulated', () => {
      assert.strictEqual(process.env.PAYMENT_PROVIDER || 'demo', 'demo');
      assert.strictEqual(process.env.RAZORPAY_KEY_ID || undefined, undefined);
    });

  } finally {
    await pool.end();
  }

  console.log(`\n================ Summary ================`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);
  console.log(`=========================================\n`);

  if (failed > 0) process.exit(1);
}

runNeonTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
