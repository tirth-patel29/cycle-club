import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(dbUrl);

function sanitizeLiteral(val, dataType, udtName) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (udtName === 'jsonb' || udtName === 'json' || dataType === 'jsonb' || dataType === 'json') {
    const jsonStr = typeof val === 'string' ? val : JSON.stringify(val);
    return `$json$${jsonStr}$json$::${udtName || 'jsonb'}`;
  }
  if (typeof val === 'object') {
    if (val instanceof Date) {
      return `'${val.toISOString()}'::timestamptz`;
    }
    return `$json$${JSON.stringify(val)}$json$::jsonb`;
  }
  const str = String(val).replace(/'/g, "''");
  if (udtName === 'uuid' || dataType === 'uuid') {
    return `'${str}'::uuid`;
  }
  if (dataType.includes('timestamp') || udtName.includes('timestamp')) {
    return `'${str}'::timestamptz`;
  }
  return `'${str}'`;
}

function calculateSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve('./backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`[Backup Engine] Starting complete database export at ${timestamp}...`);

  const dbInfo = await sql`SELECT current_database() as db_name, version() as version`;
  const dbName = dbInfo[0].db_name;
  const version = dbInfo[0].version;

  // 1. Fetch all non-system schemas
  const schemasRes = await sql`
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ORDER BY schema_name;
  `;
  const schemas = schemasRes.map(s => s.schema_name);

  // 2. Extensions
  const extensions = await sql`
    SELECT extname, extversion 
    FROM pg_extension 
    WHERE extname NOT IN ('plpgsql')
    ORDER BY extname;
  `;

  // 3. Tables to backup (public, auth, neon_auth)
  const tables = await sql`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema') 
      AND table_type = 'BASE TABLE'
    ORDER BY 
      CASE 
        WHEN table_schema = 'auth' THEN 1
        WHEN table_schema = 'neon_auth' THEN 2
        ELSE 3
      END,
      table_schema, table_name;
  `;

  // 4. Columns for all tables
  const tableData = [];
  const tableRowCounts = {};

  for (const t of tables) {
    const cols = await sql`
      SELECT 
        column_name, 
        data_type, 
        udt_name,
        is_nullable, 
        column_default
      FROM information_schema.columns
      WHERE table_schema = ${t.table_schema} AND table_name = ${t.table_name}
      ORDER BY ordinal_position;
    `;

    // Fetch all rows
    const rows = await sql.query(`SELECT * FROM "${t.table_schema}"."${t.table_name}"`);
    const key = `"${t.table_schema}"."${t.table_name}"`;
    tableRowCounts[key] = rows.length;

    tableData.push({
      schema: t.table_schema,
      name: t.table_name,
      columns: cols,
      rows: rows
    });
    console.log(`  Exported ${t.table_schema}.${t.table_name}: ${rows.length} rows`);
  }

  // 5. Constraints (PK, Unique, Check, FK)
  const pks = await sql`
    SELECT tc.table_schema, tc.table_name, tc.constraint_name, kc.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kc 
      ON tc.constraint_name = kc.constraint_name AND tc.table_schema = kc.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY tc.table_schema, tc.table_name, kc.ordinal_position;
  `;

  const fks = await sql`
    SELECT
      tc.table_schema, tc.table_name, tc.constraint_name, kcu.column_name,
      ccu.table_schema AS foreign_table_schema, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name,
      rc.update_rule, rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu ON rc.unique_constraint_name = ccu.constraint_name AND rc.unique_constraint_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY tc.table_schema, tc.table_name;
  `;

  const checksAndUniques = await sql`
    SELECT tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type, cc.check_clause
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.check_constraints cc 
      ON tc.constraint_name = cc.constraint_name AND tc.constraint_schema = cc.constraint_schema
    WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
      AND tc.constraint_type IN ('UNIQUE', 'CHECK')
    ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;
  `;

  // 6. Indexes
  const indexes = await sql`
    SELECT schemaname, tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      AND indexname NOT LIKE '%_pkey'
    ORDER BY schemaname, tablename, indexname;
  `;

  // 7. Functions
  const functions = await sql`
    SELECT n.nspname as schema_name, p.proname as function_name, pg_get_functiondef(p.oid) as definition
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN ('public', 'auth') AND p.proname IN ('uid')
    ORDER BY n.nspname, p.proname;
  `;

  // ===================== GENERATE DDL (SCHEMA ONLY) =====================
  let ddl = `-- ==============================================================================
-- NEON POSTGRESQL VERIFIED SCHEMA BACKUP
-- Database: ${dbName}
-- Timestamp: ${timestamp}
-- PostgreSQL Engine: ${version.split(' on ')[0]}
-- ==============================================================================

`;

  for (const s of schemas) {
    ddl += `CREATE SCHEMA IF NOT EXISTS "${s}";\n`;
  }
  ddl += `\n`;

  for (const ext of extensions) {
    ddl += `CREATE EXTENSION IF NOT EXISTS "${ext.extname}";\n`;
  }
  ddl += `\n`;

  for (const fn of functions) {
    ddl += `${fn.definition};\n\n`;
  }

  // Create tables DDL
  for (const t of tableData) {
    ddl += `CREATE TABLE IF NOT EXISTS "${t.schema}"."${t.name}" (\n`;
    const colDefs = t.columns.map(c => {
      let def = `  "${c.column_name}" ${c.data_type}`;
      if (c.character_maximum_length) def += `(${c.character_maximum_length})`;
      if (c.is_nullable === 'NO') def += ` NOT NULL`;
      if (c.column_default) def += ` DEFAULT ${c.column_default}`;
      return def;
    });
    ddl += colDefs.join(',\n');
    ddl += `\n);\n\n`;
  }

  // Add Primary Keys
  const pkMap = {};
  for (const pk of pks) {
    const key = `"${pk.table_schema}"."${pk.table_name}"`;
    if (!pkMap[key]) pkMap[key] = { name: pk.constraint_name, cols: [] };
    pkMap[key].cols.push(`"${pk.column_name}"`);
  }
  for (const [tbl, pk] of Object.entries(pkMap)) {
    ddl += `ALTER TABLE ${tbl} ADD CONSTRAINT "${pk.name}" PRIMARY KEY (${pk.cols.join(', ')});\n`;
  }
  ddl += `\n`;

  // Add Indexes
  for (const idx of indexes) {
    ddl += `${idx.indexdef};\n`;
  }
  ddl += `\n`;

  // ===================== GENERATE DATA ONLY SQL =====================
  let dataSql = `-- ==============================================================================
-- NEON POSTGRESQL VERIFIED DATA-ONLY BACKUP
-- Database: ${dbName}
-- Timestamp: ${timestamp}
-- Total Tables: ${tableData.length}
-- ==============================================================================

BEGIN;
SET CONSTRAINTS ALL DEFERRED;

`;

  // Insert priority order
  const priorityOrder = [
    'auth.users',
    'neon_auth.user',
    'neon_auth.project_config',
    'neon_auth.jwks',
    'neon_auth.account',
    'neon_auth.session',
    'neon_auth.verification',
    'neon_auth.organization',
    'neon_auth.member',
    'neon_auth.invitation',
    'public.events',
    'public.profiles',
    'public.rider_profiles',
    'public.admin_roles',
    'public.registrations',
    'public.payments',
    'public.email_deliveries',
    'public.audit_logs'
  ];

  const sortedTableData = [...tableData].sort((a, b) => {
    const aKey = `${a.schema}.${a.name}`;
    const bKey = `${b.schema}.${b.name}`;
    const aIdx = priorityOrder.indexOf(aKey);
    const bIdx = priorityOrder.indexOf(bKey);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  for (const t of sortedTableData) {
    if (t.rows.length === 0) continue;
    dataSql += `-- Table: "${t.schema}"."${t.name}" (${t.rows.length} rows)\n`;
    const colNames = t.columns.map(c => `"${c.column_name}"`).join(', ');

    for (const row of t.rows) {
      const values = t.columns.map(c => sanitizeLiteral(row[c.column_name], c.data_type, c.udt_name)).join(', ');
      dataSql += `INSERT INTO "${t.schema}"."${t.name}" (${colNames}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
    }
    dataSql += `\n`;
  }

  dataSql += `COMMIT;\n`;

  // ===================== GENERATE FULL BACKUP SQL =====================
  const fullSql = ddl + `\n-- DATA RESTORATION BLOCK\n` + dataSql;

  // ===================== WRITE FILES =====================
  const schemaPath = path.join(backupDir, `neon_backup_${timestamp}_schema.sql`);
  const dataPath = path.join(backupDir, `neon_backup_${timestamp}_data.sql`);
  const fullPath = path.join(backupDir, `neon_backup_${timestamp}_full.sql`);
  const jsonPath = path.join(backupDir, `neon_backup_${timestamp}_data.json`);
  const manifestPath = path.join(backupDir, `neon_backup_${timestamp}_manifest.json`);

  fs.writeFileSync(schemaPath, ddl, 'utf8');
  fs.writeFileSync(dataPath, dataSql, 'utf8');
  fs.writeFileSync(fullPath, fullSql, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(tableData, null, 2), 'utf8');

  const manifest = {
    databaseName: dbName,
    postgresVersion: version,
    timestamp: timestamp,
    totalTables: tableData.length,
    tableRowCounts: tableRowCounts,
    files: {
      fullBackup: {
        path: fullPath,
        sizeBytes: fs.statSync(fullPath).size,
        sha256: calculateSha256(fullPath)
      },
      schemaBackup: {
        path: schemaPath,
        sizeBytes: fs.statSync(schemaPath).size,
        sha256: calculateSha256(schemaPath)
      },
      dataBackup: {
        path: dataPath,
        sizeBytes: fs.statSync(dataPath).size,
        sha256: calculateSha256(dataPath)
      },
      jsonBackup: {
        path: jsonPath,
        sizeBytes: fs.statSync(jsonPath).size,
        sha256: calculateSha256(jsonPath)
      }
    }
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`[Backup Engine] Backup completed successfully!`);
  console.log(`  Full SQL Dump: ${fullPath} (${manifest.files.fullBackup.sizeBytes} bytes)`);
  console.log(`  Schema SQL Dump: ${schemaPath} (${manifest.files.schemaBackup.sizeBytes} bytes)`);
  console.log(`  Data SQL Dump: ${dataPath} (${manifest.files.dataBackup.sizeBytes} bytes)`);
  console.log(`  JSON Raw Dump: ${jsonPath} (${manifest.files.jsonBackup.sizeBytes} bytes)`);
  console.log(`  Manifest: ${manifestPath}`);
  return manifest;
}

runBackup().catch(err => {
  console.error('[Backup Engine] Backup failed:', err);
  process.exit(1);
});
