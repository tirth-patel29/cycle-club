import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('ERROR: DATABASE_URL is not set.');
  process.exit(1);
}

const sql = neon(dbUrl);

async function runAudit() {
  console.log('--- Starting Neon PostgreSQL Database Audit ---');

  const audit = {
    timestamp: new Date().toISOString(),
    databaseName: null,
    serverVersion: null,
    schemas: [],
    tables: [],
    views: [],
    materializedViews: [],
    extensions: [],
    enums: [],
    sequences: [],
    foreignKeys: [],
    indexes: [],
    constraints: [],
    triggers: [],
    functions: [],
    rlsPolicies: [],
    tableCounts: {},
    neonAuthTables: []
  };

  try {
    // 1. Current DB & Version
    const dbInfo = await sql`SELECT current_database() as db_name, version() as version`;
    audit.databaseName = dbInfo[0].db_name;
    audit.serverVersion = dbInfo[0].version;

    // 2. Schemas
    const schemas = await sql`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
      ORDER BY schema_name;
    `;
    audit.schemas = schemas.map(s => s.schema_name);

    // 3. Extensions
    const extensions = await sql`
      SELECT extname, extversion, extnamespace::regnamespace::text as schema
      FROM pg_extension
      ORDER BY extname;
    `;
    audit.extensions = extensions;

    // 4. Custom Types / Enums
    const enums = await sql`
      SELECT t.typname as enum_name, n.nspname as schema_name, array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      GROUP BY t.typname, n.nspname
      ORDER BY schema_name, enum_name;
    `;
    audit.enums = enums;

    // 5. Tables & Views
    const tables = await sql`
      SELECT 
        table_schema, 
        table_name, 
        table_type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `;

    for (const t of tables) {
      if (t.table_type === 'BASE TABLE') {
        audit.tables.push({ schema: t.table_schema, name: t.table_name });
      } else if (t.table_type === 'VIEW') {
        audit.views.push({ schema: t.table_schema, name: t.table_name });
      }
    }

    // Materialized Views
    const matViews = await sql`
      SELECT schemaname, matviewname 
      FROM pg_matviews
      ORDER BY schemaname, matviewname;
    `;
    audit.materializedViews = matViews;

    // 6. Columns for all base tables
    for (const t of audit.tables) {
      const cols = await sql`
        SELECT 
          column_name, 
          data_type, 
          udt_name,
          character_maximum_length, 
          is_nullable, 
          column_default
        FROM information_schema.columns
        WHERE table_schema = ${t.schema} AND table_name = ${t.name}
        ORDER BY ordinal_position;
      `;
      t.columns = cols;

      // Row count
      try {
        const countQuery = await sql.query(`SELECT COUNT(*)::bigint AS count FROM "${t.schema}"."${t.name}"`);
        const count = countQuery[0]?.count ?? '0';
        audit.tableCounts[`${t.schema}.${t.name}`] = Number(count);
        t.rowCount = Number(count);
      } catch (err) {
        audit.tableCounts[`${t.schema}.${t.name}`] = 'Error: ' + err.message;
        t.rowCount = null;
      }
    }

    // 7. Primary Keys
    const pks = await sql`
      SELECT 
        tc.table_schema, 
        tc.table_name, 
        kc.column_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kc 
        ON tc.constraint_name = kc.constraint_name 
        AND tc.table_schema = kc.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY tc.table_schema, tc.table_name, kc.ordinal_position;
    `;
    audit.primaryKeys = pks;

    // 8. Foreign Keys
    const fks = await sql`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON rc.unique_constraint_name = ccu.constraint_name
        AND rc.unique_constraint_schema = ccu.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY tc.table_schema, tc.table_name;
    `;
    audit.foreignKeys = fks;

    // 9. Unique and Check Constraints
    const constraints = await sql`
      SELECT 
        tc.table_schema, 
        tc.table_name, 
        tc.constraint_name, 
        tc.constraint_type,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name 
        AND tc.constraint_schema = cc.constraint_schema
      WHERE tc.table_schema NOT IN ('pg_catalog', 'information_schema')
        AND tc.constraint_type IN ('UNIQUE', 'CHECK')
      ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;
    `;
    audit.constraints = constraints;

    // 10. Indexes
    const indexes = await sql`
      SELECT
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename, indexname;
    `;
    audit.indexes = indexes;

    // 11. Sequences
    const sequences = await sql`
      SELECT 
        sequence_schema, 
        sequence_name, 
        data_type, 
        start_value, 
        minimum_value, 
        maximum_value, 
        increment
      FROM information_schema.sequences
      WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY sequence_schema, sequence_name;
    `;
    audit.sequences = sequences;

    // 12. Triggers
    const triggers = await sql`
      SELECT 
        event_object_schema,
        event_object_table,
        trigger_name,
        event_manipulation,
        action_statement,
        action_timing
      FROM information_schema.triggers
      WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY event_object_schema, event_object_table, trigger_name;
    `;
    audit.triggers = triggers;

    // 13. Functions
    const functions = await sql`
      SELECT 
        n.nspname as schema_name,
        p.proname as function_name,
        pg_get_function_result(p.oid) as result_type,
        pg_get_function_arguments(p.oid) as argument_types
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY n.nspname, p.proname;
    `;
    audit.functions = functions;

    // 14. RLS Policies
    const rls = await sql`
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd, 
        qual, 
        with_check
      FROM pg_policies
      ORDER BY schemaname, tablename, policyname;
    `;
    audit.rlsPolicies = rls;

    // 15. Identify Neon Auth / Auth tables
    audit.neonAuthTables = audit.tables.filter(t => t.schema === 'auth' || t.name.startsWith('auth_') || t.name.includes('neon_auth'));

    // Write audit output to disk
    const outDir = path.resolve('./backups');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const auditFile = path.join(outDir, 'neon_db_audit.json');
    fs.writeFileSync(auditFile, JSON.stringify(audit, null, 2), 'utf8');

    console.log(`Audit completed successfully! Saved to ${auditFile}`);
    console.log(`Found ${audit.tables.length} tables across schemas: ${audit.schemas.join(', ')}`);
    console.log('Table Row Counts:');
    for (const [tbl, cnt] of Object.entries(audit.tableCounts)) {
      console.log(`  - ${tbl}: ${cnt} rows`);
    }
  } catch (err) {
    console.error('Audit failed with error:', err);
    process.exit(1);
  }
}

runAudit();

