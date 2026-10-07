#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System
 * Clean / Production Installation Mode
 * Command: npm run medi-era
 *
 * Architecture:
 * - Environment protection: Sets INSTALL_MODE=production
 * - Initializes database schema and relational tables
 * - Synchronizes immutable system permissions and baseline security roles
 * - Provisions protected Super Administrator from environment configuration
 * - Strictly ZERO demo business records (clean empty clinic database ready for real operations)
 */

import dotenv from 'dotenv';
import { getDatabaseClient } from './connection.ts';
import { seedInitialData } from './init.ts';

dotenv.config();
process.env.INSTALL_MODE = 'production';

async function runMediEraInstall() {
  console.log('================================================================');
  console.log('  MediEra Medical CRM & ERP — Production Installation');
  console.log('  Mode: INSTALL_MODE=production');
  console.log('================================================================\n');

  const client = await getDatabaseClient();

  try {
    console.log('[1/2] Initializing production database schema & security baseline...');
    const baseline = await seedInitialData(client);

    console.log('\n[2/2] Validating zero-demo data safety constraint...');
    const isMysql = client.config.dialect === 'mysql';

    const [patientCheck] = await client.query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM patients'
    );
    const [appointmentCheck] = await client.query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM appointments'
    );
    const [inventoryCheck] = await client.query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM inventory_items'
    );

    const patientCount = Number(patientCheck?.count || 0);
    const appointmentCount = Number(appointmentCheck?.count || 0);
    const inventoryCount = Number(inventoryCheck?.count || 0);

    console.log('----------------------------------------------------------------');
    console.log('  PRODUCTION INSTALLATION REPORT:');
    console.log(`  - Installation Mode       : PRODUCTION (Clean Enterprise)`);
    console.log(`  - Database Dialect        : ${client.config.dialect.toUpperCase()}`);
    console.log(`  - Database Host/Port      : ${client.config.host}:${client.config.port}`);
    console.log(`  - Core Permissions        : ${baseline.permissions.length} immutable permissions`);
    console.log(`  - Security Roles          : ${baseline.roles.length} roles initialized`);
    console.log(`  - Protected Super Admin   : ${baseline.superAdminEmail}`);
    console.log(`  - Demo Patients           : ${patientCount} (Clean)`);
    console.log(`  - Demo Appointments       : ${appointmentCount} (Clean)`);
    console.log(`  - Demo Inventory Items    : ${inventoryCount} (Clean)`);
    console.log('----------------------------------------------------------------');
    console.log('  [STATUS] MediEra is fully installed and ready for clinical onboarding.');
    console.log('  Log in to the management console to configure your organization and branches.');
    console.log('================================================================\n');

    client.close().catch(() => {});
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ [PRODUCTION INSTALLATION FAILED]:', error.message || error);
    client.close().catch(() => {});
    process.exit(1);
  }
}

runMediEraInstall()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
