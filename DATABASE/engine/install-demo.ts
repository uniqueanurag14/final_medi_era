#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System
 * Demo Installation Mode
 * Command: npm run install-demo
 *
 * Architecture:
 * - Environment protection: Enforces INSTALL_MODE=demo
 * - Initializes clean database schema
 * - Seeds core immutable permissions & roles
 * - Provisions Super Administrator account
 * - Populates rich, deterministic healthcare demo dataset:
 *   organizations, branches, doctors, consultation schedules,
 *   patients, appointments, and medical inventory.
 */

import dotenv from 'dotenv';
import { getDatabaseClient } from './connection.ts';
import { seedInitialData } from './init.ts';
import { seedDemoDataset } from './demo-seeder.ts';

dotenv.config();
process.env.INSTALL_MODE = 'demo';

async function runInstallDemo() {
  console.log('================================================================');
  console.log('  MediEra Medical CRM & ERP — Demo Installation');
  console.log('  Mode: INSTALL_MODE=demo');
  console.log('================================================================\n');

  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  if (nodeEnv === 'production') {
    console.warn('⚠️  [NOTICE] NODE_ENV is set to production, but install-demo was explicitly invoked.');
    console.warn('    Proceeding to configure isolated demo environment...\n');
  }

  const client = await getDatabaseClient();

  try {
    console.log('[1/3] Synchronizing core database tables and system baseline...');
    const baseline = await seedInitialData(client);
    console.log(`  ✓ System roles verified: ${baseline.roles.length}`);
    console.log(`  ✓ System permissions cataloged: ${baseline.permissions.length}`);
    console.log(`  ✓ Super Admin account verified: ${baseline.superAdminEmail}`);

    console.log('\n[2/3] Populating deterministic healthcare demo dataset...');
    const demoCounts = await seedDemoDataset(client);

    console.log('\n[3/3] Demo installation verification completed successfully!');
    console.log('----------------------------------------------------------------');
    console.log('  DEMO ENVIRONMENT REPORT:');
    console.log(`  - Installation Mode       : DEMO (Deterministic)`);
    console.log(`  - Database Dialect        : ${client.config.dialect.toUpperCase()}`);
    console.log(`  - Database Host/Port      : ${client.config.host}:${client.config.port}`);
    console.log(`  - Healthcare Organizations: ${demoCounts.organizations}`);
    console.log(`  - Clinic & Hospital Bays  : ${demoCounts.branches}`);
    console.log(`  - Specialist Physicians   : ${demoCounts.doctors}`);
    console.log(`  - Weekly Doctor Schedules : ${demoCounts.schedules}`);
    console.log(`  - Patient Health Profiles : ${demoCounts.patients}`);
    console.log(`  - Demo Appointments       : ${demoCounts.appointments}`);
    console.log(`  - Medical Inventory SKUs  : ${demoCounts.inventory}`);
    console.log('----------------------------------------------------------------');
    console.log('  INITIAL ACCESS CREDENTIALS:');
    console.log('  Super Admin : admin@mediera.com / Admin@12345');
    console.log('  Portal URL  : http://localhost:3000');
    console.log('================================================================\n');

    client.close().catch(() => {});
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ [DEMO INSTALLATION FAILED]:', error.message || error);
    client.close().catch(() => {});
    process.exit(1);
  }
}

runInstallDemo()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
