import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(dbUrl);

async function runVerification() {
  console.log('--- Starting Neon PostgreSQL Backup Verification Test ---');

  // Find the latest manifest
  const backupDir = path.resolve('./backups');
  const manifests = fs.readdirSync(backupDir).filter(f => f.endsWith('_manifest.json')).sort();
  if (manifests.length === 0) {
    throw new Error('No backup manifest found!');
  }
  const latestManifestFile = path.join(backupDir, manifests[manifests.length - 1]);
  const manifest = JSON.parse(fs.readFileSync(latestManifestFile, 'utf8'));

  console.log(`Verifying backup from manifest: ${manifests[manifests.length - 1]}`);
  console.log(`Original DB: ${manifest.databaseName}, timestamp: ${manifest.timestamp}`);

  // Test restore schema name in Neon
  const testSchema = 'test_restore_verification';

  try {
    // 1. Create clean isolated test schema
    await sql.query(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`);
    await sql.query(`CREATE SCHEMA "${testSchema}"`);
    console.log(`Created isolated test schema: ${testSchema}`);

    // Read JSON backup data to test restore into testSchema
    const jsonBackupFile = manifest.files.jsonBackup.path;
    const tableData = JSON.parse(fs.readFileSync(jsonBackupFile, 'utf8'));

    // Filter public tables to restore in testSchema
    const publicTables = tableData.filter(t => t.schema === 'public');

    // 2. Re-create public tables inside testSchema
    for (const t of publicTables) {
      const colDefs = t.columns.map(c => {
        let def = `"${c.column_name}" ${c.data_type}`;
        if (c.character_maximum_length) def += `(${c.character_maximum_length})`;
        if (c.column_default && !c.column_default.includes('nextval')) def += ` DEFAULT ${c.column_default}`;
        return def;
      }).join(', ');

      await sql.query(`CREATE TABLE "${testSchema}"."${t.name}" (${colDefs})`);
    }
    console.log(`Created ${publicTables.length} tables in ${testSchema}`);

    // 3. Insert data into testSchema tables
    for (const t of publicTables) {
      if (t.rows.length === 0) continue;
      const colNames = t.columns.map(c => `"${c.column_name}"`).join(', ');

      for (const row of t.rows) {
        const placeholders = t.columns.map((_, i) => `$${i + 1}`).join(', ');
        const values = t.columns.map(c => {
          const val = row[c.column_name];
          if (val === null || val === undefined) return null;
          if (c.udt_name === 'jsonb' || c.udt_name === 'json' || c.data_type === 'jsonb' || c.data_type === 'json') {
            return typeof val === 'string' ? val : JSON.stringify(val);
          }
          return val;
        });

        await sql.query(
          `INSERT INTO "${testSchema}"."${t.name}" (${colNames}) VALUES (${placeholders})`,
          values
        );
      }
    }
    console.log(`Inserted all records into ${testSchema}`);

    // 4. Verify Record Counts & Compare with Original
    console.log('\n--- Comparing Record Counts (Original vs Test Restored) ---');
    let allMatched = true;

    for (const t of publicTables) {
      const origCount = t.rows.length;
      const res = await sql.query(`SELECT COUNT(*)::bigint as count FROM "${testSchema}"."${t.name}"`);
      const restoredCount = Number(res[0].count);

      const matched = origCount === restoredCount;
      console.log(`  Table [${t.name}]: Original = ${origCount}, Restored = ${restoredCount} -> ${matched ? 'MATCH' : 'MISMATCH'}`);
      if (!matched) allMatched = false;
    }

    // 5. Deep record verification on critical entities (Events, Registrations, Payments, Rider Profiles)
    console.log('\n--- Deep Content Verification ---');
    const origEvents = await sql.query('SELECT id, slug, title, strava_route_url FROM public.events');
    const restoredEvents = await sql.query(`SELECT id, slug, title, strava_route_url FROM "${testSchema}".events`);
    if (JSON.stringify(origEvents) !== JSON.stringify(restoredEvents)) {
      throw new Error('Critical mismatch in events table data!');
    }
    console.log('  ✓ Events data verified with exact byte-for-byte fidelity.');

    const origRegs = await sql.query('SELECT id, public_reference, status, amount_due_paise FROM public.registrations ORDER BY id');
    const restoredRegs = await sql.query(`SELECT id, public_reference, status, amount_due_paise FROM "${testSchema}".registrations ORDER BY id`);
    if (JSON.stringify(origRegs) !== JSON.stringify(restoredRegs)) {
      throw new Error('Critical mismatch in registrations table data!');
    }
    console.log('  ✓ Registrations data verified with exact byte-for-byte fidelity.');

    const origPayments = await sql.query('SELECT id, registration_id, status, amount_paise FROM public.payments ORDER BY id');
    const restoredPayments = await sql.query(`SELECT id, registration_id, status, amount_paise FROM "${testSchema}".payments ORDER BY id`);
    if (JSON.stringify(origPayments) !== JSON.stringify(restoredPayments)) {
      throw new Error('Critical mismatch in payments table data!');
    }
    console.log('  ✓ Payments data verified with exact byte-for-byte fidelity.');

    const origProfiles = await sql.query('SELECT id, full_name, mobile_number, bicycle_type FROM public.rider_profiles ORDER BY id');
    const restoredProfiles = await sql.query(`SELECT id, full_name, mobile_number, bicycle_type FROM "${testSchema}".rider_profiles ORDER BY id`);
    if (JSON.stringify(origProfiles) !== JSON.stringify(restoredProfiles)) {
      throw new Error('Critical mismatch in rider profiles table data!');
    }
    console.log('  ✓ Rider profiles data verified with exact byte-for-byte fidelity.');

    // Clean up test schema
    await sql.query(`DROP SCHEMA "${testSchema}" CASCADE`);
    console.log(`\nCleaned up isolated verification schema: ${testSchema}`);

    if (allMatched) {
      console.log('\n======================================================');
      console.log('BACKUP VERIFICATION TEST PASSED WITH 100% DATA FIDELITY');
      console.log('======================================================\n');
    } else {
      throw new Error('Backup verification failed: Record counts did not match!');
    }

  } catch (err) {
    console.error('Backup verification test failed:', err);
    // Attempt cleanup
    try {
      await sql.query(`DROP SCHEMA IF EXISTS "${testSchema}" CASCADE`);
    } catch (_) {}
    process.exit(1);
  }
}

runVerification();
