import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

function ensureUuid(seed) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  const raw = `${part1}${part2}${part3}${part4}`;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-4${raw.slice(13, 16)}-a${raw.slice(17, 20)}-${raw.slice(20, 32)}`;
}

async function seedAdmin() {
  const pool = new pg.Pool({ connectionString });
  try {
    const tirthId = ensureUuid('admin-tirthhpatel29@gmail.com');
    const adminId = ensureUuid('admin-admin@anandcyclingclub.in');

    await pool.query(`
      INSERT INTO admin_roles (user_id, role)
      VALUES ($1, 'admin'), ($2, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    `, [tirthId, adminId]);

    const res = await pool.query('SELECT * FROM admin_roles');
    console.log('✓ Seeding complete. ADMIN ROLES IN NEON:', res.rows);
  } catch (err) {
    console.error('Error seeding admin roles:', err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
