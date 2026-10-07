import { getDbConfig, normalizeDialect, getSafeConfig } from '../DATABASE/engine/config.ts';
import { sanitizeErrorMessage } from '../DATABASE/engine/connection.ts';
import { APPLICATION_TABLES, TABLES_DROP_ORDER, SYSTEM_PERMISSIONS, SYSTEM_ROLES } from '../DATABASE/schemas/schema-definitions.ts';

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

export async function runCliTests() {
  console.log('====================================================');
  console.log('  TESTING DATABASE CLI SUITE');
  console.log('====================================================\n');

  // Test 1: Dialect normalization
  console.log('[1] Dialect Normalization Tests');
  assert(normalizeDialect('postgres') === 'postgres', 'postgres dialect supported');
  assert(normalizeDialect('POSTGRESQL') === 'postgres', 'postgresql alias normalized');
  assert(normalizeDialect('pg') === 'postgres', 'pg alias normalized');
  assert(normalizeDialect('mysql') === 'mysql', 'mysql dialect supported');
  assert(normalizeDialect('MYSQL') === 'mysql', 'MYSQL case insensitive');
  assert(normalizeDialect('mariadb') === 'mysql', 'mariadb alias normalized');
  try {
    normalizeDialect('oracle');
    assert(false, 'unsupported dialect should throw error');
  } catch (err: any) {
    assert(err.message.includes('Unsupported database dialect'), 'unsupported dialect error message thrown');
  }

  // Test 2: Port and Config Defaults
  console.log('\n[2] Port and Config Defaults');
  const prevDialect = process.env.DB_DIALECT;
  const prevPort = process.env.DB_PORT;
  delete process.env.DB_PORT;

  process.env.DB_DIALECT = 'postgres';
  const pgConf = getDbConfig();
  assert(pgConf.dialect === 'postgres', 'PostgreSQL dialect configured');
  assert(pgConf.port === 5432, 'PostgreSQL default port is 5432');

  process.env.DB_DIALECT = 'mysql';
  const myConf = getDbConfig();
  assert(myConf.dialect === 'mysql', 'MySQL dialect configured');
  assert(myConf.port === 3306, 'MySQL default port is 3306');

  // Test 3: Safe Config & Password Sanitization
  console.log('\n[3] Security & Password Masking Tests');
  const secretConfig = {
    dialect: 'postgres' as const,
    host: 'db.example.com',
    port: 5432,
    database: 'prod_db',
    user: 'db_admin',
    password: 'SuperSecretPassword999!',
  };
  const safe = getSafeConfig(secretConfig);
  assert(!('password' in safe), 'Safe config excludes password field');

  const rawError = new Error('Fatal error: failed authentication with password SuperSecretPassword999! for user db_admin');
  const sanitized = sanitizeErrorMessage(rawError, secretConfig);
  assert(!sanitized.includes('SuperSecretPassword999!'), 'Sanitized error masks plain password');
  assert(sanitized.includes('******'), 'Sanitized error replaces password with asterisks');

  const urlError = new Error('Failed to connect to postgres://db_admin:SuperSecretPassword999!@db.example.com:5432/prod_db');
  const sanitizedUrl = sanitizeErrorMessage(urlError, secretConfig);
  assert(!sanitizedUrl.includes('SuperSecretPassword999!'), 'Sanitized URL masks password in connection string');

  // Test 4: Application Tables and Drop Order
  console.log('\n[4] Application Tables and Dependency Hierarchy');
  assert(APPLICATION_TABLES.length >= 12, 'Core application tables cataloged');
  assert(APPLICATION_TABLES.includes('organizations'), 'organizations table present');
  assert(APPLICATION_TABLES.includes('branches'), 'branches table present');
  assert(APPLICATION_TABLES.includes('doctors'), 'doctors table present');
  assert(APPLICATION_TABLES.includes('doctor_branch_assignments'), 'doctor_branch_assignments table present');
  assert(APPLICATION_TABLES.includes('doctor_schedules'), 'doctor_schedules table present');
  assert(APPLICATION_TABLES.includes('roles'), 'roles table present');
  assert(APPLICATION_TABLES.includes('users'), 'users table present');
  assert(APPLICATION_TABLES.includes('user_sessions'), 'user_sessions table present');

  // Verify user_sessions drops before users
  const sessionDropIndex = TABLES_DROP_ORDER.indexOf('user_sessions');
  const userDropIndex = TABLES_DROP_ORDER.indexOf('users');
  assert(sessionDropIndex < userDropIndex, 'user_sessions dropped before users (foreign key dependency order)');

  // Verify users drops before roles
  const rolesDropIndex = TABLES_DROP_ORDER.indexOf('roles');
  assert(userDropIndex < rolesDropIndex, 'users dropped before roles (foreign key dependency order)');

  // Test 5: System Permissions and Roles Seed Integrity
  console.log('\n[5] Seed Data Definition Integrity');
  assert(SYSTEM_PERMISSIONS.length >= 18, 'All baseline permissions defined');
  assert(SYSTEM_ROLES.some((r) => r.name === 'superadmin'), 'superadmin role defined');
  assert(SYSTEM_ROLES.some((r) => r.name === 'admin'), 'admin role defined');
  assert(SYSTEM_ROLES.some((r) => r.name === 'user'), 'user role defined');

  // Test 6: MySQL Compatibility & Query Generation
  console.log('\n[6] MySQL Compatibility & Query Generation');
  process.env.CURRENT_DATABASE = 'mysql';
  const myConfig = getDbConfig();
  assert(myConfig.dialect === 'mysql', 'CURRENT_DATABASE=mysql sets dialect to mysql');
  assert(myConfig.port === 3306, 'MySQL default port is 3306');
  delete process.env.CURRENT_DATABASE;

  // Restore env
  if (prevDialect !== undefined) process.env.DB_DIALECT = prevDialect;
  else delete process.env.DB_DIALECT;
  if (prevPort !== undefined) process.env.DB_PORT = prevPort;

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

if (process.argv[1]?.includes('test-cli')) {
  runCliTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
