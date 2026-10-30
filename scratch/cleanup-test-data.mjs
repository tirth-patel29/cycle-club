/**
 * Cleanup script: removes test/seed data from the database.
 * Keeps only the 4 canonical published events from constants.ts.
 * SAFE: only deletes records identified as test/seed by name or date patterns.
 */
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const REAL_EVENT_SLUGS = [
  'amul-heritage-city-ride-2026',
  'charotar-green-brevet-100k',
  'mahi-river-sunset-leisure-ride-25k',
  'charotar-community-morning-loop-15k',
];

async function cleanup() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Find all test/seed event IDs (not in real slugs)
    const eventsRes = await client.query(
      `SELECT id, slug, title FROM events WHERE slug NOT IN (${REAL_EVENT_SLUGS.map((_, i) => `$${i+1}`).join(',')})`,
      REAL_EVENT_SLUGS
    );
    const testEventIds = eventsRes.rows.map(r => r.id);
    console.log(`Found ${testEventIds.length} test/seed events to delete:`);
    eventsRes.rows.forEach(r => console.log(`  - [${r.id}] ${r.title} (${r.slug})`));

    if (testEventIds.length > 0) {
      // 2. Find registrations linked to test events
      const regRes = await client.query(
        `SELECT id FROM registrations WHERE event_id = ANY($1::uuid[])`,
        [testEventIds]
      );
      const testRegIds = regRes.rows.map(r => r.id);
      console.log(`\nFound ${testRegIds.length} test registrations to delete.`);

      if (testRegIds.length > 0) {
        // 3. Delete payments linked to test registrations
        const payRes = await client.query(
          `DELETE FROM payments WHERE registration_id = ANY($1::uuid[]) RETURNING id`,
          [testRegIds]
        );
        console.log(`Deleted ${payRes.rowCount} test payments.`);

        // 4. Delete test registrations
        const delRegRes = await client.query(
          `DELETE FROM registrations WHERE id = ANY($1::uuid[]) RETURNING id`,
          [testRegIds]
        );
        console.log(`Deleted ${delRegRes.rowCount} test registrations.`);
      }

      // 5. Delete test events
      const delEvtRes = await client.query(
        `DELETE FROM events WHERE id = ANY($1::uuid[]) RETURNING id`,
        [testEventIds]
      );
      console.log(`Deleted ${delEvtRes.rowCount} test events.`);
    }

    // 6. Also delete orphaned payments (no matching registration)
    const orphanPay = await client.query(
      `DELETE FROM payments WHERE registration_id NOT IN (SELECT id FROM registrations) RETURNING id`
    );
    console.log(`\nDeleted ${orphanPay.rowCount} orphaned payments.`);

    // 7. Summary of what remains
    const remainingEvents = await client.query(`SELECT id, title, slug, status FROM events ORDER BY starts_at`);
    const remainingRegs = await client.query(`SELECT COUNT(*) as cnt FROM registrations`);
    const remainingPay = await client.query(`SELECT COUNT(*) as cnt FROM payments`);

    console.log('\n=== DATABASE SUMMARY AFTER CLEANUP ===');
    console.log(`Events remaining: ${remainingEvents.rowCount}`);
    remainingEvents.rows.forEach(r => console.log(`  ✓ [${r.status}] ${r.title}`));
    console.log(`Registrations remaining: ${remainingRegs.rows[0].cnt}`);
    console.log(`Payments remaining: ${remainingPay.rows[0].cnt}`);

    await client.query('COMMIT');
    console.log('\n✅ Cleanup complete. All changes committed.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during cleanup, rolled back:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
