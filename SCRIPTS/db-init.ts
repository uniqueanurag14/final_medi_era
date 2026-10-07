#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System - Database Initialization & Bootstrap Engine
 * Command: npm run db:init / npm run db-init
 * 
 * Features:
 * 1. Single source of truth: CURRENT_DATABASE (PostgreSQL or MySQL).
 * 2. Probes database connection with SELECT 1 and latency reporting.
 * 3. Creates _schema_migrations tracking table if missing.
 * 4. Deterministically sorts and applies pending migrations in transactions.
 * 5. Safely bootstraps protected Super Admin with bcrypt hashed password.
 * 6. Completely idempotent: safe to re-run multiple times without duplicating data.
 */

import dotenv from 'dotenv';
import { MigrationEngine } from '../DATABASE/engine/migration-engine.ts';

dotenv.config();

console.log('==================================================');
console.log('🚀 MediEra Database Initialization & Bootstrap');
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

    // 2. Execute migrations
    console.log('[PHASE 1] RUNNING DATABASE MIGRATIONS');
    console.log('--------------------------------------------------');
    const result = await engine.migrate({ skipStatusPrint: true });

    console.log('==================================================');
    console.log('📊 MIGRATION SUMMARY');
    console.log('==================================================');
    console.log(`Newly Applied : ${result.applied.length}`);
    console.log(`Pre-existing  : ${result.skipped.length}`);
    console.log(`Duration      : ${result.totalTimeMs} ms`);
    console.log('==================================================\n');

    // 3. Super Admin Bootstrap
    console.log('[PHASE 2] SUPER ADMIN & SYSTEM BOOTSTRAP');
    console.log('--------------------------------------------------');
    const admin = await engine.bootstrapSuperAdmin();
    console.log(`Super Admin   : ${admin.name} (${admin.email})`);
    console.log(`Credentials   : Bcrypt password verified and stored.`);
    console.log('==================================================\n');

    // 4. Final Verification
    const finalHealth = await engine.checkHealth();
    if (!finalHealth.connected) {
      console.error('[FATAL] Final database connectivity check failed.');
      process.exit(1);
    }

    console.log('==================================================');
    console.log('✅ DATABASE INITIALIZATION COMPLETED SUCCESSFULLY');
    console.log('==================================================\n');

    await engine.close();
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Database initialization failed:', err.message || err);
    await engine.close().catch(() => {});
    process.exit(1);
  }
}

run();
