#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System
 * Reset Demo Environment Utility
 * Command: npm run db:reset-demo [-- --confirm]
 *
 * Safety Constraints:
 * 1. Strictly blocked in production environments (NODE_ENV=production or INSTALL_MODE=production).
 * 2. Empties all tables in the database.
 * 3. Re-synchronizes schema.
 * 4. Re-seeds baseline roles/permissions/settings and deterministic healthcare demo data.
 */

import dotenv from 'dotenv';
import { getDbConfig, getSafeConfig, type DbConfig } from './config.ts';
import { createDatabaseClient, printDatabaseError } from './connection.ts';
import { askConfirmation } from './prompt.ts';
import { TABLES_DROP_ORDER, syncTables, seedBaselineData } from './schema-definitions.ts';
import { seedDemoDataset } from './demo-seeder.ts';

dotenv.config();

export async function runResetDemo(): Promise<void> {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  const installMode = (process.env.INSTALL_MODE || '').toLowerCase();

  console.log('================================================================');
  console.log('  MediEra Medical CRM & ERP — Reset Demo (db:reset-demo)');
  console.log('================================================================\n');

  // 1. Production Safety Guard
  if (nodeEnv === 'production' || installMode === 'production') {
    console.error('****************************************************************');
    console.error('  [SECURITY ALERT] RESET-DEMO REFUSED: RUNNING IN PRODUCTION!');
    console.error('  The "db:reset-demo" command wipes tables and injects demo data.');
    console.error('  It is strictly forbidden in production environments.');
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

  // 2. Confirmation Check
  const args = process.argv.slice(2);
  const hasConfirmFlag = args.includes('--confirm') || args.includes('--yes') || args.includes('-y') || process.env.FORCE_RESET === 'true';

  if (!hasConfirmFlag) {
    if (process.stdin.isTTY) {
      const confirmed = await askConfirmation('Are you sure you want to reset the demo environment? (yes/no): ');
      if (!confirmed) {
        console.log('\n❌ [CANCELLED] Reset-demo cancelled by user. No tables were modified.\n');
        process.exit(0);
      }
    } else {
      console.error('\n❌ [SECURITY CHECK FAILED] Explicit confirmation required in non-interactive mode.');
      console.error('   Please run with: npm run db:reset-demo -- --confirm\n');
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
    const isMysql = client.config.dialect === 'mysql';
    const existingTables = await client.listTables();
    const systemTablePatterns = [/^(pg_|sql_|information_schema)/i, /^(mysql|performance_schema|sys)$/i];
    const candidateTables = existingTables.filter((t) => !systemTablePatterns.some((p) => p.test(t)));

    console.log('[1/3] Clearing existing table data...');
    if (isMysql) {
      await client.execute('SET FOREIGN_KEY_CHECKS = 0;');
      for (const table of candidateTables) {
        await client.execute(`TRUNCATE TABLE \`${table}\`;`);
      }
      await client.execute('SET FOREIGN_KEY_CHECKS = 1;');
    } else {
      for (const table of candidateTables) {
        await client.execute(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
      }
    }
    console.log('  ✓ Tables emptied cleanly.');

    console.log('\n[2/3] Synchronizing schema and baseline security data...');
    await syncTables(client);
    await seedBaselineData(client);
    console.log('  ✓ Schema and roles verified.');

    console.log('\n[3/3] Re-seeding deterministic healthcare demo dataset...');
    const demoCounts = await seedDemoDataset(client);

    console.log('\n================================================================');
    console.log('  ✅ DEMO ENVIRONMENT RESET SUCCESSFULLY');
    console.log(`  - Healthcare Organizations: ${demoCounts.organizations}`);
    console.log(`  - Clinic & Hospital Bays  : ${demoCounts.branches}`);
    console.log(`  - Specialist Physicians   : ${demoCounts.doctors}`);
    console.log(`  - Weekly Doctor Schedules : ${demoCounts.schedules}`);
    console.log(`  - Patient Health Profiles : ${demoCounts.patients}`);
    console.log(`  - Demo Appointments       : ${demoCounts.appointments}`);
    console.log(`  - Medical Inventory SKUs  : ${demoCounts.inventory}`);
    console.log('================================================================\n');

    client.close().catch(() => {});
    process.exit(0);
  } catch (err: any) {
    printDatabaseError('operation', err, config);
    client.close().catch(() => {});
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('reset-demo.ts') || process.argv[1]?.endsWith('reset-demo.js')) {
  runResetDemo()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
