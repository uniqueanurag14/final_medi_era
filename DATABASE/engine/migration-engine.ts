/**
 * MediEra Medical CRM + ERP System
 * Centralized Database Migration & Maintenance Engine
 * 
 * Supports:
 * - PostgreSQL (Direct pool or Embedded PGlite)
 * - MySQL 8+
 * Selected strictly via CURRENT_DATABASE
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDbConfig, getSafeConfig, type DbConfig } from './config.ts';
import { createDatabaseClient, type DatabaseClient } from './connection.ts';

export interface MigrationRecord {
  id: number;
  migration_name: string;
  version?: string;
  checksum: string;
  applied_at: string;
  execution_time_ms: number;
}

export interface MigrationFile {
  filename: string;
  filepath: string;
  checksum: string;
  content: string;
}

export interface ConnectionHealth {
  connected: boolean;
  provider: string;
  host: string;
  port: number;
  database: string;
  user: string;
  latencyMs: number;
  error?: string;
}

export interface MigrationStatusResult {
  health: ConnectionHealth;
  total: number;
  applied: number;
  pending: number;
  migrations: Array<{
    name: string;
    status: 'APPLIED' | 'PENDING';
    appliedAt?: string;
    checksum: string;
    executionTimeMs?: number;
    checksumMatch?: boolean;
  }>;
}

/**
 * Calculates SHA-256 checksum of SQL content
 */
export function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

/**
 * Discovers and deterministically sorts all .sql migration files in DATABASE/migrations
 */
export function discoverMigrationFiles(): MigrationFile[] {
  let migrationsDir = path.resolve(process.cwd(), 'DATABASE/migrations');
  if (!fs.existsSync(migrationsDir)) {
    const fallbackDir = path.resolve(process.cwd(), 'DATABASE/migrations');
    if (fs.existsSync(fallbackDir)) {
      migrationsDir = fallbackDir;
    } else {
      fs.mkdirSync(migrationsDir, { recursive: true });
      return [];
    }
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return files.map((filename) => {
    const filepath = path.join(migrationsDir, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    return {
      filename,
      filepath,
      checksum: calculateChecksum(content),
      content,
    };
  });
}

/**
 * Splits SQL script by semicolons while respecting quotes, string literals, and SQL comments
 */
export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const next = i + 1 < sql.length ? sql[i + 1] : '';
    const prev = i > 0 ? sql[i - 1] : '';

    // Handle comments strictly outside quotes
    if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
      if (char === '-' && next === '-') {
        // Single-line comment: advance to end of line
        while (i < sql.length && sql[i] !== '\n') {
          i++;
        }
        current += ' ';
        continue;
      }
      if (char === '/' && next === '*') {
        // Block comment: advance to end of comment block
        i += 2;
        while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) {
          i++;
        }
        i++; // skip closing '/'
        current += ' ';
        continue;
      }
    }

    if (char === "'" && !inDoubleQuote && !inBacktick) {
      if (inSingleQuote && next === "'") {
        current += "''";
        i++;
        continue;
      }
      if (prev !== '\\') {
        inSingleQuote = !inSingleQuote;
      }
    } else if (char === '"' && !inSingleQuote && !inBacktick && prev !== '\\') {
      inDoubleQuote = !inDoubleQuote;
    } else if (char === '`' && !inSingleQuote && !inDoubleQuote && prev !== '\\') {
      inBacktick = !inBacktick;
    }

    if (char === ';' && !inSingleQuote && !inDoubleQuote && !inBacktick) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = '';
    } else {
      current += char;
    }
  }

  const remainder = current.trim();
  if (remainder.length > 0) {
    statements.push(remainder);
  }

  return statements;
}

/**
 * Translates PostgreSQL DDL/DML statements into MySQL-compatible SQL
 */
export function translateSqlForMysql(sql: string): string {
  let s = sql;

  // 1. Remove Postgres type casts: ::text, ::jsonb, ::int
  s = s.replace(/::[a-zA-Z0-9_]+/g, '');

  // 2. Replace JSONB with JSON
  s = s.replace(/\bJSONB\b/gi, 'JSON');

  // 3. Remove string defaults on JSON columns
  s = s.replace(/\bJSON\s+DEFAULT\s+('[^']*'|\([^)]*\))/gi, 'JSON');

  // 4. SERIAL / BIGSERIAL to INT / BIGINT AUTO_INCREMENT
  s = s.replace(/\bSERIAL PRIMARY KEY\b/gi, 'INT AUTO_INCREMENT PRIMARY KEY');
  s = s.replace(/\bBIGSERIAL PRIMARY KEY\b/gi, 'BIGINT AUTO_INCREMENT PRIMARY KEY');

  // 5. Replace TEXT UNIQUE with VARCHAR(255) UNIQUE
  s = s.replace(/\bTEXT(\s+NOT\s+NULL)?\s+UNIQUE\b/gi, 'VARCHAR(255)$1 UNIQUE');

  // 6. MySQL syntax for CREATE INDEX IF NOT EXISTS -> CREATE INDEX
  s = s.replace(/\bCREATE\s+(UNIQUE\s+)?INDEX\s+IF\s+NOT\s+EXISTS\b/gi, 'CREATE $1INDEX');

  // 7. Replace ILIKE with standard case-insensitive LIKE
  s = s.replace(/\bILIKE\b/gi, 'LIKE');

  // 8. Replace PostgreSQL TIMESTAMPTZ with TIMESTAMP
  s = s.replace(/\bTIMESTAMPTZ\b/gi, 'TIMESTAMP');

  // 9. Replace UUID with VARCHAR(36)
  s = s.replace(/\bUUID\b/gi, 'VARCHAR(36)');

  // 10. ON CONFLICT (col) DO NOTHING / ON CONFLICT DO NOTHING -> ON DUPLICATE KEY UPDATE col = col
  s = s.replace(
    /ON\s+CONFLICT\s*(\(([^)]+)\))?\s*DO\s+NOTHING/gi,
    (_match, _p1, cols) => {
      const firstCol = cols ? cols.split(',')[0].trim() : 'id';
      return `ON DUPLICATE KEY UPDATE ${firstCol} = ${firstCol}`;
    }
  );

  // 11. ON CONFLICT (col) DO UPDATE SET ... -> ON DUPLICATE KEY UPDATE ...
  s = s.replace(
    /ON\s+CONFLICT\s*\([^)]+\)\s*DO\s+UPDATE\s+SET\s+([\s\S]*?)(?=;|$)/gi,
    (_match, updateClause) => {
      const mysqlUpdate = updateClause.replace(/EXCLUDED\.([a-zA-Z0-9_]+)/gi, 'VALUES($1)');
      return `ON DUPLICATE KEY UPDATE ${mysqlUpdate}`;
    }
  );

  // 12. ALTER TABLE ... ADD COLUMN IF NOT EXISTS -> ADD COLUMN (if needed)
  s = s.replace(/ADD\s+COLUMN\s+IF\s+NOT\s+EXISTS/gi, 'ADD COLUMN');

  return s;
}

export class MigrationEngine {
  private config: DbConfig;
  private client: DatabaseClient;

  constructor(config?: DbConfig) {
    this.config = config || getDbConfig();
    this.client = createDatabaseClient(this.config);
  }

  public getConfig(): DbConfig {
    return this.config;
  }

  public getClient(): DatabaseClient {
    return this.client;
  }

  /**
   * Performs real connection health check using SELECT 1; and measures latency
   */
  public async checkHealth(): Promise<ConnectionHealth> {
    const safe = getSafeConfig(this.config);
    const start = Date.now();
    try {
      await this.client.connect();
      await this.client.testConnection();
      const latencyMs = Date.now() - start;
      return {
        connected: true,
        provider: safe.dialect,
        host: safe.host,
        port: safe.port,
        database: safe.database,
        user: safe.user,
        latencyMs,
      };
    } catch (err: any) {
      return {
        connected: false,
        provider: safe.dialect,
        host: safe.host,
        port: safe.port,
        database: safe.database,
        user: safe.user,
        latencyMs: Date.now() - start,
        error: err.message || String(err),
      };
    }
  }

  /**
   * Prints the standard DATABASE STATUS console block
   */
  public printDatabaseStatus(health: ConnectionHealth): void {
    console.log('==================================================');
    console.log('DATABASE STATUS');
    console.log('==================================================');
    console.log(`Provider     : ${health.provider}`);
    console.log(`Host         : ${health.host}`);
    console.log(`Port         : ${health.port}`);
    console.log(`Database     : ${health.database}`);
    console.log(`User         : ${health.user}`);
    console.log(`Connection   : ${health.connected ? 'CONNECTED' : 'FAILED'}`);
    if (health.connected) {
      console.log(`Health Query : SELECT 1`);
      console.log(`Latency      : ${health.latencyMs} ms`);
    } else {
      console.log(`Error        : ${health.error || 'Connection refused'}`);
    }
    console.log('==================================================\n');
  }

  /**
   * Ensures the migration tracking table (_schema_migrations) exists
   */
  public async ensureMigrationTable(): Promise<void> {
    const isMysql = this.config.dialect === 'mysql';
    const sql = isMysql
      ? `CREATE TABLE IF NOT EXISTS _schema_migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          version VARCHAR(255),
          checksum VARCHAR(64) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          execution_time_ms INT DEFAULT 0 NOT NULL
        );`
      : `CREATE TABLE IF NOT EXISTS _schema_migrations (
          id SERIAL PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          version VARCHAR(255),
          checksum VARCHAR(64) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          execution_time_ms INTEGER DEFAULT 0 NOT NULL
        );`;

    await this.client.execute(sql);
  }

  /**
   * Reads all applied migrations from _schema_migrations
   */
  public async getAppliedMigrations(): Promise<Map<string, MigrationRecord>> {
    await this.ensureMigrationTable();
    const rows = await this.client.query<any>(
      `SELECT id, migration_name, version, checksum, applied_at, execution_time_ms 
       FROM _schema_migrations 
       ORDER BY id ASC;`
    );

    const map = new Map<string, MigrationRecord>();
    for (const r of rows) {
      const name = r.migration_name || r.version;
      map.set(name, {
        id: Number(r.id),
        migration_name: name,
        version: r.version || name,
        checksum: String(r.checksum || ''),
        applied_at: String(r.applied_at),
        execution_time_ms: Number(r.execution_time_ms || 0),
      });
    }
    return map;
  }

  /**
   * Queries migration status for all discovered migrations
   */
  public async getStatus(): Promise<MigrationStatusResult> {
    const health = await this.checkHealth();
    if (!health.connected) {
      return {
        health,
        total: 0,
        applied: 0,
        pending: 0,
        migrations: [],
      };
    }

    const files = discoverMigrationFiles();
    const appliedMap = await this.getAppliedMigrations();

    const list = files.map((f) => {
      const record = appliedMap.get(f.filename);
      if (record) {
        return {
          name: f.filename,
          status: 'APPLIED' as const,
          appliedAt: record.applied_at,
          checksum: f.checksum,
          executionTimeMs: record.execution_time_ms,
          checksumMatch: record.checksum ? record.checksum === f.checksum : true,
        };
      }
      return {
        name: f.filename,
        status: 'PENDING' as const,
        checksum: f.checksum,
      };
    });

    const appliedCount = list.filter((m) => m.status === 'APPLIED').length;
    const pendingCount = list.filter((m) => m.status === 'PENDING').length;

    return {
      health,
      total: list.length,
      applied: appliedCount,
      pending: pendingCount,
      migrations: list,
    };
  }

  /**
   * Runs all pending migrations in deterministic order with transactions and rollback
   */
  public async migrate(options?: { skipStatusPrint?: boolean }): Promise<{
    applied: MigrationFile[];
    skipped: MigrationFile[];
    totalTimeMs: number;
  }> {
    const health = await this.checkHealth();
    if (!options?.skipStatusPrint) {
      this.printDatabaseStatus(health);
    }

    if (!health.connected) {
      console.error(`❌ Cannot migrate: Database connection failed (${health.error || 'Connection refused'}).`);
      process.exit(1);
    }

    await this.ensureMigrationTable();
    const files = discoverMigrationFiles();
    const appliedMap = await this.getAppliedMigrations();

    console.log(`Discovered ${files.length} migration file(s) in deterministic order.`);
    console.log(`Already applied: ${appliedMap.size} | Pending: ${files.length - appliedMap.size}\n`);

    const applied: MigrationFile[] = [];
    const skipped: MigrationFile[] = [];
    const overallStart = Date.now();

    for (const f of files) {
      const existing = appliedMap.get(f.filename);
      if (existing) {
        if (existing.checksum && existing.checksum !== f.checksum) {
          console.warn(
            `⚠️  [CHECKSUM WARNING] Migration "${f.filename}" was previously applied with checksum ${existing.checksum.substring(0, 10)}..., but current file checksum is ${f.checksum.substring(0, 10)}... (Skipping re-execution)`
          );
        }
        skipped.push(f);
        continue;
      }

      console.log(`🚀 Applying migration: ${f.filename}...`);
      const fileStart = Date.now();

      if (this.config.dialect === 'postgres') {
        // PostgreSQL: full transactional DDL/DML support
        try {
          await this.client.execute('BEGIN;');
          await this.client.execute(f.content);
          const durationMs = Date.now() - fileStart;

          await this.client.execute(
            `INSERT INTO _schema_migrations (migration_name, version, checksum, applied_at, execution_time_ms)
             VALUES ($1, $1, $2, CURRENT_TIMESTAMP, $3);`,
            [f.filename, f.checksum, durationMs]
          );
          await this.client.execute('COMMIT;');
          console.log(`✓ [SUCCESS] ${f.filename} applied in ${durationMs} ms.\n`);
          applied.push(f);
        } catch (err: any) {
          try {
            await this.client.execute('ROLLBACK;');
          } catch {}

          console.error('\n==================================================');
          console.error('MIGRATION FAILED');
          console.error(`Migration : ${f.filename}`);
          console.error(`Database  : PostgreSQL`);
          console.error(`Status    : ROLLED BACK`);
          console.error('\nError:');
          console.error(err.message || err);
          console.error('==================================================\n');
          throw err;
        }
      } else {
        // MySQL: Translate syntax and execute statements
        try {
          const translated = translateSqlForMysql(f.content);
          const stmts = splitSqlStatements(translated);

          for (const stmt of stmts) {
            if (stmt.trim()) {
              try {
                await this.client.execute(stmt);
              } catch (stmtErr: any) {
                const msg = String(stmtErr.message || '').toLowerCase();
                const code = stmtErr.code;
                const errno = stmtErr.errno;
                if (
                  code === 'ER_DUP_FIELDNAME' ||
                  code === 'ER_DUP_KEYNAME' ||
                  code === 'ER_TABLE_EXISTS_ERROR' ||
                  errno === 1060 ||
                  errno === 1061 ||
                  errno === 1050 ||
                  msg.includes('duplicate key name') ||
                  msg.includes('duplicate column name') ||
                  msg.includes('already exists')
                ) {
                  // Ignore safe idempotent duplicate notices in MySQL
                  continue;
                }
                throw stmtErr;
              }
            }
          }

          const durationMs = Date.now() - fileStart;
          await this.client.execute(
            `INSERT INTO _schema_migrations (migration_name, version, checksum, applied_at, execution_time_ms)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?);`,
            [f.filename, f.filename, f.checksum, durationMs]
          );
          console.log(`✓ [SUCCESS] ${f.filename} applied in ${durationMs} ms.\n`);
          applied.push(f);
        } catch (err: any) {
          console.error('\n==================================================');
          console.error('MIGRATION FAILED');
          console.error(`Migration : ${f.filename}`);
          console.error(`Database  : MySQL`);
          console.error(`Status    : ABORTED`);
          console.error('\nError:');
          console.error(err.message || err);
          console.error('==================================================\n');
          throw err;
        }
      }
    }

    return {
      applied,
      skipped,
      totalTimeMs: Date.now() - overallStart,
    };
  }

  /**
   * Bootstraps the Super Admin account safely and idempotently with hashed password
   */
  public async bootstrapSuperAdmin(): Promise<{ email: string; name: string; createdOrUpdated: boolean }> {
    const email = (process.env.SUPER_ADMIN_EMAIL || 'dev.sinha14@gmail.com').trim().toLowerCase();
    const name = process.env.SUPER_ADMIN_NAME || 'System Administrator';
    const plainPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123!';
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);

    // 1. Ensure Super Admin role exists
    const roleId = 'role-super-admin';
    const roleCheck = await this.client.query<any>(
      this.config.dialect === 'postgres'
        ? `SELECT id FROM roles WHERE id = $1 OR name = 'SUPER_ADMIN' LIMIT 1;`
        : `SELECT id FROM roles WHERE id = ? OR name = 'SUPER_ADMIN' LIMIT 1;`,
      [roleId]
    );

    if (roleCheck.length === 0) {
      if (this.config.dialect === 'postgres') {
        await this.client.execute(
          `INSERT INTO roles (id, name, display_name, description, is_system)
           VALUES ($1, 'SUPER_ADMIN', 'Super Administrator', 'Full unrestricted platform access', TRUE)
           ON CONFLICT DO NOTHING;`,
          [roleId]
        );
      } else {
        await this.client.execute(
          `INSERT INTO roles (id, name, display_name, description, is_system)
           VALUES (?, 'SUPER_ADMIN', 'Super Administrator', 'Full unrestricted platform access', TRUE)
           ON DUPLICATE KEY UPDATE display_name = 'Super Administrator';`,
          [roleId]
        );
      }
    }

    // 2. Ensure default organization and branch exist for foreign key integrity
    const orgCheck = await this.client.query<any>(
      this.config.dialect === 'postgres'
        ? `SELECT id FROM organizations WHERE id = 'org-mediera-01' LIMIT 1;`
        : `SELECT id FROM organizations WHERE id = 'org-mediera-01' LIMIT 1;`
    );
    if (orgCheck.length === 0) {
      await this.client.execute(
        `INSERT INTO organizations (id, name, email, phone)
         VALUES ('org-mediera-01', 'MediEra Health Systems', 'contact@mediera.com', '+1 (800) 555-6334')
         ${this.config.dialect === 'postgres' ? 'ON CONFLICT DO NOTHING' : 'ON DUPLICATE KEY UPDATE name = name'};`
      );
    }

    const branchCheck = await this.client.query<any>(
      this.config.dialect === 'postgres'
        ? `SELECT id FROM branches WHERE id = 'br-main-01' LIMIT 1;`
        : `SELECT id FROM branches WHERE id = 'br-main-01' LIMIT 1;`
    );
    if (branchCheck.length === 0) {
      await this.client.execute(
        `INSERT INTO branches (id, organization_id, name, code, address, city, state, zip_code, phone, email)
         VALUES ('br-main-01', 'org-mediera-01', 'MediEra Central Hospital', 'MED-MAIN', '100 Medical Center Parkway', 'New York', 'NY', '10001', '+1 (800) 555-6334', 'central@mediera.com')
         ${this.config.dialect === 'postgres' ? 'ON CONFLICT DO NOTHING' : 'ON DUPLICATE KEY UPDATE name = name'};`
      );
    }

    // 3. Check if user already exists by ID or Email
    const userRows = await this.client.query<any>(
      this.config.dialect === 'postgres'
        ? `SELECT id, email FROM users WHERE id = 'usr-admin-01' OR LOWER(email) = $1 LIMIT 1;`
        : `SELECT id, email FROM users WHERE id = 'usr-admin-01' OR LOWER(email) = ? LIMIT 1;`,
      [email]
    );

    if (userRows.length === 0) {
      // Create new Super Admin
      if (this.config.dialect === 'postgres') {
        await this.client.execute(
          `INSERT INTO users (id, uid, organization_id, branch_id, role_id, email, name, password_hash, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active', NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, status = 'Active';`,
          [
            'usr-admin-01',
            'uid-admin-01',
            'org-mediera-01',
            'br-main-01',
            roleId,
            email,
            name,
            hashedPassword,
          ]
        );
      } else {
        await this.client.execute(
          `INSERT INTO users (id, uid, organization_id, branch_id, role_id, email, name, password_hash, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', NOW(), NOW())
           ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name), password_hash = VALUES(password_hash), status = 'Active';`,
          [
            'usr-admin-01',
            'uid-admin-01',
            'org-mediera-01',
            'br-main-01',
            roleId,
            email,
            name,
            hashedPassword,
          ]
        );
      }
      console.log(`✓ [BOOTSTRAP] Super Admin account created: ${email}`);
    } else {
      // Update existing Super Admin record
      const existingId = userRows[0].id;
      if (this.config.dialect === 'postgres') {
        await this.client.execute(
          `UPDATE users SET email = $1, name = $2, password_hash = $3, status = 'Active', role_id = $4, updated_at = NOW() WHERE id = $5;`,
          [email, name, hashedPassword, roleId, existingId]
        );
      } else {
        await this.client.execute(
          `UPDATE users SET email = ?, name = ?, password_hash = ?, status = 'Active', role_id = ?, updated_at = NOW() WHERE id = ?;`,
          [email, name, hashedPassword, roleId, existingId]
        );
      }
      console.log(`✓ [BOOTSTRAP] Super Admin credentials verified/updated: ${email}`);
    }

    return { email, name, createdOrUpdated: true };
  }

  /**
   * Removes application data while strictly preserving database schema and migration history
   */
  public async cleanTable(): Promise<{
    provider: string;
    database: string;
    discoveredCount: number;
    cleanedCount: number;
    success: boolean;
  }> {
    const health = await this.checkHealth();
    if (!health.connected) {
      throw new Error(`Database connection failed: ${health.error}`);
    }

    const tables = await this.client.listTables();
    const systemProtected = new Set([
      '_schema_migrations',
      'roles',
      'permissions',
      'role_permissions',
      'account_groups',
      'system_settings',
    ]);

    const tablesToClean = tables.filter((t) => !systemProtected.has(t.toLowerCase()));

    const isMysql = this.config.dialect === 'mysql';

    if (isMysql) {
      await this.client.execute('SET FOREIGN_KEY_CHECKS = 0;');
      for (const t of tablesToClean) {
        if (t.toLowerCase() === 'users') {
          // Preserve Super Admin in users table
          await this.client.execute(
            `DELETE FROM users WHERE email != 'admin@mediera.com' AND email != 'dev.sinha14@gmail.com' AND id != 'usr-admin-01';`
          );
        } else {
          try {
            await this.client.execute(`TRUNCATE TABLE \`${t}\`;`);
          } catch {
            await this.client.execute(`DELETE FROM \`${t}\`;`);
          }
        }
      }
      await this.client.execute('SET FOREIGN_KEY_CHECKS = 1;');
    } else {
      // PostgreSQL
      // Truncate tables with CASCADE while preserving users Super Admin
      for (const t of tablesToClean) {
        if (t.toLowerCase() === 'users') {
          await this.client.execute(
            `DELETE FROM users WHERE email != 'admin@mediera.com' AND email != 'dev.sinha14@gmail.com' AND id != 'usr-admin-01';`
          );
        } else {
          try {
            await this.client.execute(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`);
          } catch {
            try {
              await this.client.execute(`DELETE FROM "${t}";`);
            } catch (err: any) {
              console.warn(`[Clean notice] Table "${t}": ${err.message}`);
            }
          }
        }
      }
    }

    return {
      provider: health.provider,
      database: health.database,
      discoveredCount: tables.length,
      cleanedCount: tablesToClean.length,
      success: true,
    };
  }

  /**
   * Drops all application tables and schema objects (including migration metadata)
   */
  public async dropTable(): Promise<{
    provider: string;
    database: string;
    discoveredCount: number;
    droppedCount: number;
    success: boolean;
  }> {
    const health = await this.checkHealth();
    if (!health.connected) {
      throw new Error(`Database connection failed: ${health.error}`);
    }

    const tables = await this.client.listTables();
    const isMysql = this.config.dialect === 'mysql';

    if (isMysql) {
      await this.client.execute('SET FOREIGN_KEY_CHECKS = 0;');
      for (const t of tables) {
        await this.client.execute(`DROP TABLE IF EXISTS \`${t}\`;`);
      }
      await this.client.execute('SET FOREIGN_KEY_CHECKS = 1;');
    } else {
      for (const t of tables) {
        try {
          await this.client.execute(`DROP TABLE IF EXISTS "${t}" CASCADE;`);
        } catch (err: any) {
          console.warn(`[Drop warning] Table "${t}": ${err.message}`);
        }
      }
    }

    return {
      provider: health.provider,
      database: health.database,
      discoveredCount: tables.length,
      droppedCount: tables.length,
      success: true,
    };
  }

  /**
   * Closes database connection
   */
  public async close(): Promise<void> {
    await this.client.close();
  }
}

export const migrationEngine = new MigrationEngine();
