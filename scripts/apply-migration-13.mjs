import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function applyMigration() {
  console.log('Applying Migration 13: Add XS to jersey_size and tshirt_size check constraints...');

  // Update registrations constraint
  await sql`ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_jersey_size_check`;
  await sql`
    ALTER TABLE public.registrations
    ADD CONSTRAINT registrations_jersey_size_check
    CHECK (jersey_size = ANY (ARRAY['XS'::text, 'S'::text, 'M'::text, 'L'::text, 'XL'::text, '2XL'::text, 'None'::text]))
  `;

  // Update rider_profiles constraint
  await sql`ALTER TABLE public.rider_profiles DROP CONSTRAINT IF EXISTS rider_profiles_tshirt_size_check`;
  await sql`
    ALTER TABLE public.rider_profiles
    ADD CONSTRAINT rider_profiles_tshirt_size_check
    CHECK (tshirt_size = ANY (ARRAY['XS'::text, 'S'::text, 'M'::text, 'L'::text, 'XL'::text, '2XL'::text, 'None'::text]))
  `;

  console.log('Migration 13 applied successfully!');

  // Verify constraints
  const res = await sql`
    SELECT conname, pg_get_constraintdef(oid) as def
    FROM pg_constraint
    WHERE conrelid IN ('public.registrations'::regclass, 'public.rider_profiles'::regclass)
      AND conname IN ('registrations_jersey_size_check', 'rider_profiles_tshirt_size_check')
  `;
  console.log('Verified updated constraints:');
  console.log(res);
}

applyMigration().catch(err => {
  console.error('Migration 13 failed:', err);
  process.exit(1);
});
