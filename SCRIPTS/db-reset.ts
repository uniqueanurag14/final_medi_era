#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System - Database Reset Utility
 * Command: npm run db:reset / npm run db-reset
 * 
 * Drops all application tables and reinstalls schema and bootstrap data cleanly.
 */

import dotenv from 'dotenv';
import { MigrationEngine } from '../DATABASE/engine/migration-engine.ts';

dotenv.config();

console.log('==================================================');
console.log('⚠️  DATABASE RESET');
console.log('==================================================\n');

async function run() {
  const engine = new MigrationEngine();

  try {
    console.log('[STEP 1/2] Dropping all existing database tables...');
    const dropRes = await engine.dropTable();
    console.log(`✓ Tables dropped: ${dropRes.droppedCount}\n`);

    console.log('[STEP 2/2] Running full database initialization & bootstrap...');
    const migRes = await engine.migrate();
    console.log(`✓ Migrations applied: ${migRes.applied.length}`);

    await engine.bootstrapSuperAdmin();
    console.log(`✓ Super Admin bootstrapped.\n`);

    console.log('==================================================');
    console.log('✅ DATABASE RESET COMPLETED SUCCESSFULLY');
    console.log('==================================================\n');

    await engine.close();
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Database reset failed:', err.message || err);
    await engine.close().catch(() => {});
    process.exit(1);
  }
}

run();
