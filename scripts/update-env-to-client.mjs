import * as fs from 'fs';

const envPath = '.env.local';
let content = fs.readFileSync(envPath, 'utf8');

const newDbUrl = 'postgresql://neondb_owner:npg_fxo2sQakWN6u@ep-solitary-lake-a1jan4dv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const newAuthUrl = 'https://ep-solitary-lake-a1jan4dv.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth';

// Update DATABASE_URL
content = content.replace(/DATABASE_URL=[^\r\n]+/, `DATABASE_URL="${newDbUrl}"`);

// Update NEON_AUTH_BASE_URL
content = content.replace(/NEON_AUTH_BASE_URL=[^\r\n]+/, `NEON_AUTH_BASE_URL="${newAuthUrl}"`);

fs.writeFileSync(envPath, content, 'utf8');
console.log('[Env Switcher] Successfully updated .env.local to point to client project snowy-dew-71862631.');

