import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const srcUrl = process.env.DATABASE_URL;
const destUrl = process.env.DESTINATION_DATABASE_URL;

if (!srcUrl || !destUrl) {
  console.error('ERROR: Both DATABASE_URL and DESTINATION_DATABASE_URL must be set.');
  process.exit(1);
}

const sqlSrc = neon(srcUrl);
const sqlDest = neon(destUrl);

async function runDestinationMigration() {
  console.log('--- Starting Production Migration to Client Neon Database ---');

  // Verify identity of destination
  const destInfo = await sqlDest`SELECT current_database() as db, current_user as usr, version() as ver`;
  console.log(`Connected to Destination: Database="${destInfo[0].db}", User="${destInfo[0].usr}"`);

  // Verify identity of source
  const srcInfo = await sqlSrc`SELECT current_database() as db, current_user as usr`;
  console.log(`Connected to Source: Database="${srcInfo[0].db}", User="${srcInfo[0].usr}"`);

  // 1. Find latest fresh backup JSON
  const backupDir = path.resolve('./backups');
  const manifests = fs.readdirSync(backupDir).filter(f => f.endsWith('_manifest.json')).sort();
  const latestManifestFile = path.join(backupDir, manifests[manifests.length - 1]);
  const manifest = JSON.parse(fs.readFileSync(latestManifestFile, 'utf8'));
  console.log(`Using Backup Source: ${manifests[manifests.length - 1]} (${manifest.timestamp})`);

  const jsonBackupFile = manifest.files.jsonBackup.path;
  const backupTables = JSON.parse(fs.readFileSync(jsonBackupFile, 'utf8'));

  // 2. Extensions & Auth Schema Shim
  console.log('\n[1/6] Creating extensions and auth shim on destination...');
  await sqlDest`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sqlDest`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;
  await sqlDest`CREATE SCHEMA IF NOT EXISTS auth`;

  await sqlDest`
    CREATE TABLE IF NOT EXISTS auth.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE,
      raw_user_meta_data JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sqlDest`
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$ LANGUAGE sql STABLE;
  `;

  // 3. Populate auth.users from backup
  const authUsersTable = backupTables.find(t => t.schema === 'auth' && t.name === 'users');
  if (authUsersTable && authUsersTable.rows.length > 0) {
    console.log(`Migrating ${authUsersTable.rows.length} records into auth.users...`);
    for (const u of authUsersTable.rows) {
      await sqlDest`
        INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
        VALUES (${u.id}, ${u.email}, ${typeof u.raw_user_meta_data === 'string' ? u.raw_user_meta_data : JSON.stringify(u.raw_user_meta_data)}, ${u.created_at}, ${u.updated_at})
        ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
      `;
    }
  }

  // 4. Create Public Tables
  console.log('\n[2/6] Creating public application tables...');
  await sqlDest`
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      display_name TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    )
  `;

  await sqlDest`
    CREATE TABLE IF NOT EXISTS public.admin_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'event_manager', 'rider')),
      assigned_by UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      UNIQUE(user_id, role)
    )
  `;
  // Ensure foreign key constraint is dropped on admin_roles per migration 6
  await sqlDest`ALTER TABLE public.admin_roles DROP CONSTRAINT IF EXISTS admin_roles_user_id_fkey`;
  await sqlDest`ALTER TABLE public.admin_roles DROP CONSTRAINT IF EXISTS admin_roles_assigned_by_fkey`;

  await sqlDest`
    CREATE TABLE IF NOT EXISTS public.events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      cover_image_url TEXT,
      venue TEXT NOT NULL,
      location_description TEXT,
      starts_at TIMESTAMPTZ NOT NULL,
      ends_at TIMESTAMPTZ NOT NULL,
      distance_km NUMERIC NOT NULL CHECK (distance_km > 0),
      elevation_gain_m NUMERIC NOT NULL DEFAULT 0,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy / Leisure', 'Moderate', 'Challenging', 'Endurance / Brevet')),
      registration_fee_paise BIGINT NOT NULL CHECK (registration_fee_paise >= 0),
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
      registration_opens_at TIMESTAMPTZ NOT NULL,
      registration_closes_at TIMESTAMPTZ NOT NULL,
      published_at TIMESTAMPTZ,
      max_capacity INTEGER CHECK (max_capacity IS NULL OR max_capacity > 0),
      sponsors JSONB DEFAULT '[]'::jsonb,
      inclusions JSONB DEFAULT '[]'::jsonb,
      reporting_time TEXT,
      strava_route_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    )
  `;

  await sqlDest`
    CREATE TABLE IF NOT EXISTS public.registrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      public_reference TEXT UNIQUE NOT NULL,
      rider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
      full_name TEXT NOT NULL,
      mobile_number TEXT NOT NULL CHECK (length(mobile_number) >= 10),
      email TEXT,
      age INTEGER NOT NULL CHECK (age >= 12 AND age <= 100),
      gender TEXT NOT NULL,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      jersey_size TEXT CHECK (jersey_size IN ('S', 'M', 'L', 'XL', '2XL', 'None')),
      bicycle_type TEXT CHECK (bicycle_type IN ('Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle')),
      bicycle_brand TEXT,
      bicycle_model TEXT,
      terms_accepted_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending_payment', 'confirmed', 'cancelled')),
      amount_due_paise BIGINT NOT NULL CHECK (amount_due_paise >= 0),
      currency TEXT NOT NULL DEFAULT 'INR',
      idempotency_key UUID UNIQUE NOT NULL,
      blood_group TEXT,
      residential_address TEXT,
      seat_reserved_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    )
  `;

  await sqlDest`
    CREATE TABLE IF NOT EXISTS public.payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
      provider TEXT NOT NULL CHECK (provider IN ('demo', 'razorpay')),
      provider_payment_reference TEXT,
      amount_paise BIGINT NOT NULL CHECK (amount_paise >= 0),
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL CHECK (status IN ('initiated', 'succeeded', 'failed', 'refunded')),
      idempotency_key UUID UNIQUE NOT NULL,
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      razorpay_signature TEXT,
      failure_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    )
  `;

  await sqlDest`
    CREATE TABLE IF NOT EXISTS public.rider_profiles (
      id UUID PRIMARY KEY,
      full_name TEXT NOT NULL,
      mobile_number TEXT NOT NULL CHECK (length(mobile_number) >= 10),
      bicycle_type TEXT NOT NULL CHECK (bicycle_type IN ('Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle')),
      age INTEGER CHECK (age >= 12 AND age <= 100),
      gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
      bicycle_brand TEXT,
      bicycle_model TEXT,
      tshirt_size TEXT CHECK (tshirt_size IN ('S', 'M', 'L', 'XL', '2XL', 'None')),
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      blood_group TEXT,
      residential_address TEXT,
      auth_user_id TEXT,
      email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    )
  `;

  await sqlDest`
    CREATE TABLE IF NOT EXISTS public.email_deliveries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
      recipient_email TEXT NOT NULL,
      email_type TEXT NOT NULL,
      resend_email_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
      error_message TEXT,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
      UNIQUE(registration_id, email_type)
    )
  `;

  await sqlDest`
    CREATE TABLE IF NOT EXISTS public.audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      metadata JSONB,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
    )
  `;

  // 5. Populate Data in Dependency Order
  console.log('\n[3/6] Populating application data from backup...');
  const publicTablesToMigrate = [
    'events',
    'rider_profiles',
    'admin_roles',
    'registrations',
    'payments',
    'email_deliveries',
    'audit_logs'
  ];

  for (const tableName of publicTablesToMigrate) {
    const tData = backupTables.find(t => t.schema === 'public' && t.name === tableName);
    if (!tData || tData.rows.length === 0) {
      console.log(`  Skipping ${tableName} (0 rows)`);
      continue;
    }

    const colNames = tData.columns.map(c => `"${c.column_name}"`).join(', ');
    console.log(`  Migrating ${tData.rows.length} rows into public.${tableName}...`);

    for (const row of tData.rows) {
      const placeholders = tData.columns.map((_, i) => `$${i + 1}`).join(', ');
      const values = tData.columns.map(c => {
        const val = row[c.column_name];
        if (val === null || val === undefined) return null;
        if (c.udt_name === 'jsonb' || c.udt_name === 'json' || c.data_type === 'jsonb' || c.data_type === 'json') {
          return typeof val === 'string' ? val : JSON.stringify(val);
        }
        return val;
      });

      await sqlDest.query(
        `INSERT INTO public."${tableName}" (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values
      );
    }
  }

  // 6. Base Indexes
  console.log('\n[4/6] Creating standard indexes...');
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_events_status_starts_at ON public.events(status, starts_at)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_registrations_public_reference ON public.registrations(public_reference)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_registrations_idempotency_key ON public.registrations(idempotency_key)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_registrations_mobile ON public.registrations(mobile_number)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_registrations_rider_id ON public.registrations(rider_id)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_registrations_event_status_reserved ON public.registrations(event_id, status, seat_reserved_until)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_registrations_status_reserved ON public.registrations(status, seat_reserved_until)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON public.payments(registration_id)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_rider_profiles_mobile ON public.rider_profiles(mobile_number)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_rider_profiles_bicycle_type ON public.rider_profiles(bicycle_type)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC)`;
  await sqlDest`CREATE INDEX IF NOT EXISTS idx_email_deliveries_reg ON public.email_deliveries(registration_id, email_type)`;

  // 7. Apply Migration 20261102000011_safe_schema_refinement.sql
  console.log('\n[5/6] Applying migration 20261102000011_safe_schema_refinement.sql...');
  await sqlDest`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_registrations_rider_profile' 
          AND table_name = 'registrations'
          AND table_schema = 'public'
      ) THEN
        ALTER TABLE public.registrations
          ADD CONSTRAINT fk_registrations_rider_profile
          FOREIGN KEY (rider_id) 
          REFERENCES public.rider_profiles(id) 
          ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  await sqlDest`
    CREATE INDEX IF NOT EXISTS idx_registrations_rider_created 
      ON public.registrations(rider_id, created_at DESC)
  `;

  await sqlDest`
    CREATE INDEX IF NOT EXISTS idx_payments_reg_status 
      ON public.payments(registration_id, status)
  `;
  console.log('  ✓ Safe schema refinement applied.');

  // 8. Row Count & Integrity Comparison
  console.log('\n[6/6] Verifying Source vs Destination Integrity...');
  const tablesToVerify = [
    'events',
    'registrations',
    'payments',
    'rider_profiles',
    'admin_roles',
    'audit_logs',
    'email_deliveries'
  ];

  let allMatch = true;
  const comparison = {};

  for (const t of tablesToVerify) {
    const srcCountRes = await sqlSrc.query(`SELECT COUNT(*)::bigint as cnt FROM public."${t}"`);
    const destCountRes = await sqlDest.query(`SELECT COUNT(*)::bigint as cnt FROM public."${t}"`);

    const srcCnt = Number(srcCountRes[0].cnt);
    const destCnt = Number(destCountRes[0].cnt);
    const matched = srcCnt === destCnt;

    comparison[t] = { source: srcCnt, destination: destCnt, matched };
    console.log(`  Table [${t}]: Source = ${srcCnt}, Destination = ${destCnt} -> ${matched ? 'MATCH' : 'MISMATCH'}`);
    if (!matched) allMatch = false;
  }

  // Deep checks
  const srcEvents = await sqlSrc`SELECT id, slug, title, strava_route_url FROM public.events`;
  const destEvents = await sqlDest`SELECT id, slug, title, strava_route_url FROM public.events`;
  if (JSON.stringify(srcEvents) !== JSON.stringify(destEvents)) throw new Error('Events data mismatch!');

  const srcRegs = await sqlSrc`SELECT id, public_reference, status, amount_due_paise FROM public.registrations ORDER BY id`;
  const destRegs = await sqlDest`SELECT id, public_reference, status, amount_due_paise FROM public.registrations ORDER BY id`;
  if (JSON.stringify(srcRegs) !== JSON.stringify(destRegs)) throw new Error('Registrations data mismatch!');

  const srcPayments = await sqlSrc`SELECT id, registration_id, status, amount_paise FROM public.payments ORDER BY id`;
  const destPayments = await sqlDest`SELECT id, registration_id, status, amount_paise FROM public.payments ORDER BY id`;
  if (JSON.stringify(srcPayments) !== JSON.stringify(destPayments)) throw new Error('Payments data mismatch!');

  console.log('\n======================================================');
  console.log(`MIGRATION COMPLETED: ${allMatch ? 'SUCCESS (100% MATCH)' : 'FAILED'}`);
  console.log('======================================================\n');
  return comparison;
}

runDestinationMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
