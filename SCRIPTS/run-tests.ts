/**
 * MediEra Automated Test Suite
 * Validates Database Connection, System Roles, Super Admin Auth, and RBAC
 */

import { dbAdapter } from '../BACKEND/src/db/adapter.ts';
import { MigrationEngine } from '../DATABASE/engine/migration-engine.ts';
import { authService } from '../BACKEND/src/services/auth.service.ts';
import { userService } from '../BACKEND/src/services/user.service.ts';
import { roleService } from '../BACKEND/src/services/role.service.ts';
import { auditService } from '../BACKEND/src/services/audit.service.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('  RUNNING MEDIERA SYSTEM TEST SUITE');
  console.log('====================================================\n');

  // 1. Database Connection & Engine Status
  console.log('[1] Database & Migration Engine Tests');
  try {
    const migrationEngine = new MigrationEngine();
    const health = await migrationEngine.checkHealth();
    assert(health.connected, 'Database connects successfully');
    
    const status = await migrationEngine.getStatus();
    assert(status.total >= 0, `Discovered migrations catalog (${status.total} migrations tracked)`);
  } catch (err: any) {
    assert(false, 'Database health check', err?.message);
  }

  // 2. Roles & Permissions Catalog
  console.log('\n[2] Roles & Permissions Catalog Tests');
  try {
    const roles = await roleService.getRoles();
    assert(roles.length >= 1, `Roles exist in system (${roles.length} roles found)`);
    
    const permissions = await roleService.getAllPermissions();
    assert(permissions.length >= 1, `Permissions cataloged (${permissions.length} permissions found)`);
  } catch (err: any) {
    assert(false, 'Roles & Permissions', err?.message);
  }

  // 3. Super Admin Authentication & Access Control
  console.log('\n[3] Super Admin Authentication & Security Tests');
  try {
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@mediera.com').trim().toLowerCase();
    const superAdminPass = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123!';

    // Should succeed on ERP portal
    const erpLogin = await authService.login({
      identifier: superAdminEmail,
      password: superAdminPass,
      portal: 'erp',
    });
    assert(erpLogin.success, 'Super Admin authenticates via ERP portal');
    assert(erpLogin.user?.role === 'SUPER_ADMIN', 'Super Admin role properly assigned');

    // Should fail on patient portal
    const patientLogin = await authService.login({
      identifier: superAdminEmail,
      password: superAdminPass,
      portal: 'patient',
    });
    assert(!patientLogin.success, 'Super Admin denied from patient portal');
  } catch (err: any) {
    assert(false, 'Authentication tests', err?.message);
  }

  // 4. Audit Log Integrity
  console.log('\n[4] Audit Log Subsystem Tests');
  try {
    await auditService.log({
      action: 'TEST_EXECUTION',
      resource: 'test_suite',
      metadata: { runner: 'run-tests.ts', timestamp: new Date().toISOString() },
    });
    assert(true, 'Audit log created successfully');
  } catch (err: any) {
    assert(false, 'Audit logging', err?.message);
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
