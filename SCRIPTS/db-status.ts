#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System - Database & Migration Status Utility
 * Command: npm run db:status
 */

import dotenv from 'dotenv';
import { MigrationEngine } from '../DATABASE/engine/migration-engine.ts';

dotenv.config();

async function run() {
  const engine = new MigrationEngine();

  try {
    const status = await engine.getStatus();
    engine.printDatabaseStatus(status.health);

    if (!status.health.connected) {
      console.error('❌ Cannot check migrations: Database connection failed.');
      process.exit(1);
    }

    console.log('==================================================');
    console.log('MIGRATIONS STATUS');
    console.log('==================================================');
    console.log(
      '  #   Status     Migration Name                             Applied At             Checksum'
    );
    console.log(
      '-----------------------------------------------------------------------------------------------'
    );

    status.migrations.forEach((m, idx) => {
      const num = String(idx + 1).padStart(2, ' ');
      const st = m.status === 'APPLIED' ? '✓ APPLIED ' : '⏳ PENDING ';
      const name = m.name.padEnd(42, ' ');
      const applied = (m.appliedAt ? new Date(m.appliedAt).toISOString().replace('T', ' ').substring(0, 19) : '------ --:--:--').padEnd(22, ' ');
      const checksum = m.checksum.substring(0, 12) + '...';
      console.log(`  ${num}  ${st} ${name} ${applied} ${checksum}`);
    });

    console.log('-----------------------------------------------------------------------------------------------');
    console.log(`Total: ${status.total} | Applied: ${status.applied} | Pending: ${status.pending}`);
    console.log('==================================================\n');

    engine.close().catch(() => {});
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Failed to retrieve database status:', err.message || err);
    engine.close().catch(() => {});
    process.exit(1);
  }
}

run();
