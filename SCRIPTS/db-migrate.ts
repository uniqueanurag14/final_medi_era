#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System - Database Migration Runner
 * Command: npm run db:migrate / npm run db-migrate
 */

import dotenv from 'dotenv';
import { MigrationEngine } from '../DATABASE/engine/migration-engine.ts';

dotenv.config();

console.log('==================================================');
console.log('🚀 MediEra Database Migration Engine');
console.log('==================================================\n');

async function run() {
  const engine = new MigrationEngine();

  try {
    const health = await engine.checkHealth();
    engine.printDatabaseStatus(health);

    if (!health.connected) {
      console.error(`[FATAL] Cannot migrate: Database connection failed: ${health.error}`);
      process.exit(1);
    }

    const result = await engine.migrate({ skipStatusPrint: true });

    console.log('==================================================');
    console.log('📊 MIGRATION SUMMARY');
    console.log('==================================================');
    console.log(`Newly Applied : ${result.applied.length}`);
    console.log(`Pre-existing  : ${result.skipped.length}`);
    console.log(`Duration      : ${result.totalTimeMs} ms`);
    console.log('==================================================\n');

    await engine.close().catch(() => {});
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Migration failed:', err.message || err);
    await engine.close().catch(() => {});
    process.exit(1);
  }
}

run();
