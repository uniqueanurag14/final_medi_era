#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System
 * Full Database Removal Utility
 * Command: npm run db:remove [-- --confirm]
 *
 * Safety Constraints:
 * 1. Strictly blocked in production environments (NODE_ENV=production or INSTALL_MODE=production).
 * 2. Requires explicit confirmation phrase: "DELETE MEDIERA DATABASE".
 * 3. Drops all application tables in dependency order with constraint handling.
 */

import dotenv from 'dotenv';
import { getDbConfig, getSafeConfig, type DbConfig } from './config.ts';
import { createDatabaseClient, printDatabaseError } from './connection.ts';
import { askExactPhrase } from './prompt.ts';
import { TABLES_DROP_ORDER } from './schema-definitions.ts';

dotenv.config();

export async function runRemove(): Promise<void> {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  const installMode = (process.env.INSTALL_MODE || '').toLowerCase();

  console.log('================================================================');
  console.log('  MediEra Medical CRM & ERP — Full Database Removal (db:remove)');
  console.log('================================================================\n');

  // 1. Production Safety Guard
  if (nodeEnv === 'production' || installMode === 'production') {
    console.error('****************************************************************');
    console.error('  [SECURITY ALERT] DATABASE REMOVAL BLOCKED IN PRODUCTION!');
    console.error('  The "db:remove" command permanently drops tables and is strictly');
    console.error('  prohibited in production environments.');
    console.error('****************************************************************\n');
    process.exit(1);
  }

  let config: DbConfig;
  try {
    config = getDbConfig();
  } catch (err: any) {
    console.error('❌ Database operation failed:', err?.message || err);
    process.exit(1);
  }

  const safe = getSafeConfig(config);
  console.log(`  Database : ${safe.database}`);
  console.log(`  Dialect  : ${safe.dialect.toUpperCase()}`);
  console.log(`  Host     : ${safe.host}:${safe.port}\n`);

  console.log('----------------------------------------------------------------');
  console.log('  ⚠️  DANGER: DESTRUCTIVE ACTION');
  console.log('  This command drops ALL database tables.');
  console.log('  All schemas, users, clinical records, and configuration will be erased.');
  console.log('----------------------------------------------------------------\n');

  // 2. Strict Confirmation Check
  const args = process.argv.slice(2);
  const hasConfirmFlag = args.includes('--confirm') || args.includes('--force') || process.env.FORCE_REMOVE === 'true';

  if (!hasConfirmFlag) {
    if (process.stdin.isTTY) {
      console.log('To confirm complete table deletion, type: DELETE MEDIERA DATABASE');
      const confirmed = await askExactPhrase('Confirmation phrase: ', 'DELETE MEDIERA DATABASE');
      if (!confirmed) {
        console.log('\n❌ [CANCELLED] Confirmation phrase did not match. No tables were dropped.\n');
        process.exit(0);
      }
    } else {
      console.error('\n❌ [SECURITY CHECK FAILED] Explicit confirmation required in non-interactive mode.');
      console.error('   Please run with: npm run db:remove -- --confirm\n');
      process.exit(1);
    }
  }

  const client = createDatabaseClient(config);

  try {
    await client.connect();
    console.log('✅ Database connected.\n');
  } catch (err: any) {
    printDatabaseError('connect', err, config);
    await client.close().catch(() => {});
    process.exit(1);
  }

  try {
    const existingTables = await client.listTables();
    const systemTablePatterns = [/^(pg_|sql_|information_schema)/i, /^(mysql|performance_schema|sys)$/i];
    const candidateTables = existingTables.filter((t) => !systemTablePatterns.some((p) => p.test(t)));

    // Order tables to drop: TABLES_DROP_ORDER first, then any remainder
    const tablesToDrop: string[] = [];
    for (const t of TABLES_DROP_ORDER) {
      if (candidateTables.includes(t)) {
        tablesToDrop.push(t);
      }
    }
    for (const t of candidateTables) {
      if (!tablesToDrop.includes(t)) {
        tablesToDrop.push(t);
      }
    }

    console.log('🔄 Dropping application tables...\n');

    if (tablesToDrop.length === 0) {
      console.log('ℹ No application tables found to drop.');
    } else {
      const isMysql = client.config.dialect === 'mysql';
      if (isMysql) {
        await client.execute('SET FOREIGN_KEY_CHECKS = 0;');
      }

      for (const table of tablesToDrop) {
        const safeName = table.replace(/[^a-zA-Z0-9_]/g, '');
        if (isMysql) {
          await client.execute(`DROP TABLE IF EXISTS \`${safeName}\`;`);
        } else {
          await client.execute(`DROP TABLE IF EXISTS "${safeName}" CASCADE;`);
        }
        console.log(`  ✕ Dropped table: ${table}`);
      }

      if (isMysql) {
        await client.execute('SET FOREIGN_KEY_CHECKS = 1;');
      }
    }

    console.log('\n================================================================');
    console.log('  ✅ DATABASE REMOVAL COMPLETED');
    console.log(`  - Tables dropped: ${tablesToDrop.length}`);
    console.log('================================================================\n');

    client.close().catch(() => {});
    process.exit(0);
  } catch (err: any) {
    printDatabaseError('operation', err, config);
    client.close().catch(() => {});
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('remove.ts') || process.argv[1]?.endsWith('remove.js')) {
  runRemove()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
