#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System - Database Update & Migration Runner
 * Command: npm run db:update / npm run db-update
 * 
 * Applies all pending migrations and schema changes to the database.
 */

import dotenv from 'dotenv';
import { MigrationEngine } from '../DATABASE/engine/migration-engine.ts';

dotenv.config();

console.log('==================================================');
console.log('🔄 MediEra Database Update (Schema & Migrations)');
console.log('==================================================\n');

async function run() {
  const engine = new MigrationEngine();

  try {
    // 1. Health check & status
    const health = await engine.checkHealth();
    engine.printDatabaseStatus(health);

    if (!health.connected) {
      console.error(`[FATAL] Database connection failed: ${health.error || 'Connection refused'}`);
      console.error(`Please verify that your ${health.provider} service is running and accessible.`);
      process.exit(1);
    }

    // 2. Discover and execute pending migrations
    console.log('[PHASE 1] APPLYING DATABASE UPDATES & MIGRATIONS');
    console.log('--------------------------------------------------');
    const result = await engine.migrate({ skipStatusPrint: true });

    console.log('==================================================');
    console.log('📊 DATABASE UPDATE SUMMARY');
    console.log('==================================================');
    console.log(`Newly Applied : ${result.applied.length}`);
    console.log(`Pre-existing  : ${result.skipped.length}`);
    console.log(`Duration      : ${result.totalTimeMs} ms`);
    console.log('==================================================\n');

    // 3. Super Admin & System Verification
    console.log('[PHASE 2] SYSTEM BOOTSTRAP VERIFICATION');
    console.log('--------------------------------------------------');
    const admin = await engine.bootstrapSuperAdmin();
    console.log(`Super Admin   : ${admin.name} (${admin.email})`);
    console.log(`Credentials   : Verified and stored.`);
    console.log('==================================================\n');

    console.log('==================================================');
    console.log('✅ DATABASE UPDATE COMPLETED SUCCESSFULLY');
    console.log('==================================================\n');

    await engine.close();
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Database update failed:', err.message || err);
    await engine.close().catch(() => {});
    process.exit(1);
  }
}

run();
