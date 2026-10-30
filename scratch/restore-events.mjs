import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const slugs = ['amul-heritage-city-ride-2026','charotar-green-brevet-100k','mahi-river-sunset-leisure-ride-25k','charotar-community-morning-loop-15k'];
const res = await pool.query(`UPDATE events SET status='published' WHERE slug = ANY($1) RETURNING slug, status`, [slugs]);
console.log('Updated events:', res.rows);
await pool.end();
