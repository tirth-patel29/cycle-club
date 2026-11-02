import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(dbUrl);

async function checkRiderIds() {
  console.log('--- Auditing Registrations rider_id vs rider_profiles.id ---');

  const regs = await sql`SELECT id, public_reference, rider_id, full_name, email FROM public.registrations`;
  console.log(`Found ${regs.length} registrations:\n`);

  let nullCount = 0;
  let matchCount = 0;
  let orphaned = [];

  for (const r of regs) {
    if (!r.rider_id) {
      console.log(`[Reg ${r.public_reference}] rider_id is NULL (Guest Registration) for ${r.full_name} (${r.email})`);
      nullCount++;
      continue;
    }

    const profiles = await sql`SELECT id, full_name, email FROM public.rider_profiles WHERE id = ${r.rider_id}`;
    if (profiles.length > 0) {
      console.log(`[Reg ${r.public_reference}] rider_id ${r.rider_id} matches profile: ${profiles[0].full_name} (${profiles[0].email})`);
      matchCount++;
    } else {
      console.warn(`[Reg ${r.public_reference}] rider_id ${r.rider_id} DOES NOT EXIST in rider_profiles!`);
      orphaned.push({ regId: r.id, ref: r.public_reference, riderId: r.rider_id });
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total Registrations: ${regs.length}`);
  console.log(`Registrations with matching rider_profiles.id: ${matchCount}`);
  console.log(`Registrations with NULL rider_id (Guest): ${nullCount}`);
  console.log(`Orphaned rider_id references: ${orphaned.length}`);

  // Also check column data types
  const cols = await sql`
    SELECT table_name, column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND ((table_name = 'registrations' AND column_name = 'rider_id') 
        OR (table_name = 'rider_profiles' AND column_name = 'id'));
  `;
  console.log('\nColumn Types:');
  for (const c of cols) {
    console.log(`  ${c.table_name}.${c.column_name}: data_type=${c.data_type}, udt_name=${c.udt_name}, nullable=${c.is_nullable}`);
  }

  return { total: regs.length, matchCount, nullCount, orphanedCount: orphaned.length, orphaned };
}

checkRiderIds().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});

