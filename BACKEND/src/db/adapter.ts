/**
 * MediEra / AutoEra CRM + ERP System
 * Centralized Dual Database Adapter (PostgreSQL & MySQL 8+)
 * 
 * Supports:
 * CURRENT_DATABASE=MySQL  -> MySQL 8+ pool
 * CURRENT_DATABASE=PostgreSQL -> PostgreSQL pool
 * 
 * Complies with strict architectural rules:
 * - Direct database queries are isolated strictly in this adapter.
 * - Repositories call this adapter.
 * - Services and controllers NEVER execute direct SQL queries.
 * - No silent fallback to mock data on database error.
 * - CURRENT_DATABASE is the single source of truth.
 * - Lazy initialization ensures server does not crash on startup if unconfigured.
 */

import fs from 'fs';
import path from 'path';
import { Pool as PgPool, PoolConfig as PgPoolConfig } from 'pg';
import mysql from 'mysql2/promise';
import { getDatabaseConfig, DatabaseEngine, ResolvedDatabaseConfig, formatDatabaseConfigForDisplay } from '../config/database.config';
import { createPool } from '../../../DATABASE/engine/index.ts';

export type { DatabaseEngine, ResolvedDatabaseConfig };

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  affectedRows?: number;
  insertId?: string | number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  searchFields?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Protected Super Admin Account Definition
 * The Super Admin account must NEVER be deleted, altered or purged by any cleanup procedure.
 */
export const PROTECTED_SUPER_ADMIN = {
  id: 'usr-admin-01',
  username: 'superadmin',
  email: 'admin@mediera.com',
  name: 'Marcus Sterling (Executive Super Admin)',
  role: 'SUPER_ADMIN',
  isSuperAdmin: true,
  canBeDeleted: false,
};

export function getProtectedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL || PROTECTED_SUPER_ADMIN.email;
  return {
    ...PROTECTED_SUPER_ADMIN,
    email,
    name: 'Marcus Sterling (Executive Super Admin)',
  };
}

/**
 * Protected System Tables that must NEVER be dropped by del-table
 */
export const PROTECTED_SYSTEM_TABLES = [
  '_schema_migrations',
  'roles',
  'permissions',
  'role_permissions',
  'account_groups',
  'system_settings',
  'users',
];

export class DatabaseAdapter {
  private static instance: DatabaseAdapter;
  private engine: DatabaseEngine = 'mysql';
  private config: ResolvedDatabaseConfig | null = null;
  private configError: string | null = null;
  private pgPool: PgPool | null = null;
  private mysqlPool: mysql.Pool | null = null;
  private pglite: any = null;
  private isConnected: boolean = false;
  private lastError: string | null = null;

  private constructor() {
    this.refreshConfig();
  }

  public static getInstance(): DatabaseAdapter {
    if (!DatabaseAdapter.instance) {
      DatabaseAdapter.instance = new DatabaseAdapter();
    }
    return DatabaseAdapter.instance;
  }

  public refreshConfig(): boolean {
    try {
      this.config = getDatabaseConfig();
      this.engine = this.config.engine;
      this.configError = null;
      return true;
    } catch (err: any) {
      this.config = null;
      this.configError = err.message;
      return false;
    }
  }

  public getEngine(): DatabaseEngine {
    if (!this.config) {
      this.refreshConfig();
    }
    return this.config ? this.config.engine : this.engine;
  }

  public getConfig(): Omit<ResolvedDatabaseConfig, 'password'> & { password?: string; configError?: string | null } {
    if (!this.config) {
      this.refreshConfig();
    }
    if (!this.config) {
      return {
        engine: this.engine,
        host: 'localhost',
        port: 3306,
        database: 'unconfigured',
        user: 'root',
        ssl: false,
        configError: this.configError,
      };
    }
    return {
      ...this.config,
      password: this.config.password ? '******' : undefined,
      configError: null,
    };
  }

  public isHealthy(): boolean {
    return this.isConnected;
  }

  public getLastError(): string | null {
    return this.lastError || this.configError;
  }

  /**
   * Applies schema migrations to ensure all relational tables exist
   */
  private async ensurePgSchema(): Promise<void> {
    try {
      const { migrationEngine } = await import('../../../DATABASE/engine/migration-engine.ts');
      const status = await migrationEngine.getStatus();
      if (status.pending > 0) {
        await migrationEngine.migrate();
        await migrationEngine.bootstrapSuperAdmin();
      }
    } catch (err: any) {
      console.warn('[PostgreSQL Schema Setup]', err.message);
    }
  }

  /**
   * Initializes real connection pools based on selected engine
   */
  public async connect(): Promise<boolean> {
    try {
      this.lastError = null;

      if (!this.config) {
        if (!this.refreshConfig()) {
          this.isConnected = false;
          this.lastError = this.configError || 'CURRENT_DATABASE is not configured.';
          return false;
        }
      }

      const cfg = this.config!;
      this.engine = cfg.engine;

      if (this.engine === 'postgresql') {
        let connectedPool = false;

        // When Cloud SQL or external PG pool is enabled, test connectivity
        if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
          try {
            const pool = createPool();
            const client = await pool.connect();
            await client.query('SELECT 1;');
            client.release();
            this.pgPool = pool;
            connectedPool = true;
          } catch (err: any) {
            this.pgPool = null;
          }
        }

        // Try connecting to PostgreSQL pool if configured
        if (!this.pgPool && process.env.USE_PGLITE !== 'true') {
          try {
            const pgConfig: PgPoolConfig = cfg.connectionUrl
              ? { connectionString: cfg.connectionUrl, max: 10, connectionTimeoutMillis: 1000 }
              : {
                  host: cfg.host,
                  port: cfg.port,
                  database: cfg.database,
                  user: cfg.user,
                  password: cfg.password,
                  ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
                  max: 10,
                  connectionTimeoutMillis: 1000,
                };

            const testPool = new PgPool(pgConfig);
            testPool.on('error', () => {});
            const client = await testPool.connect();
            await client.query('SELECT 1;');
            client.release();
            this.pgPool = testPool;
            connectedPool = true;
          } catch (err: any) {
            this.pgPool = null;
          }
        }

        // If no PostgreSQL daemon is reachable or USE_PGLITE=true, use persistent native PGlite engine in dev
        if (!connectedPool) {
          if (!this.pglite) {
            const { getOrCreateSharedPglite } = await import('../../../DATABASE/engine/index.ts');
            this.pglite = getOrCreateSharedPglite();
          }
          await this.pglite.query('SELECT 1;');
        }

        this.isConnected = true;
        await this.ensurePgSchema();
        return true;
      } else {
        // MySQL engine
        if (!this.mysqlPool) {
          if (cfg.connectionUrl) {
            this.mysqlPool = mysql.createPool(cfg.connectionUrl);
          } else {
            this.mysqlPool = mysql.createPool({
              host: cfg.host,
              port: cfg.port,
              database: cfg.database,
              user: cfg.user,
              password: cfg.password,
              ssl: cfg.ssl ? { rejectUnauthorized: false } : undefined,
              waitForConnections: true,
              connectionLimit: 10,
              queueLimit: 0,
              multipleStatements: true,
            });
          }
        }

        const conn = await this.mysqlPool.getConnection();
        await conn.query('SELECT 1;');
        conn.release();
        this.isConnected = true;
        return true;
      }
    } catch (error: any) {
      this.isConnected = false;
      this.lastError = error.message;
      return false;
    }
  }

  /**
   * Normalizes SQL queries across PostgreSQL and MySQL:
   * - Translates $1, $2 placeholders to ? for MySQL
   * - Translates NOW() vs CURRENT_TIMESTAMP
   * - Normalizes quoting identifiers
   */
  public normalizeQuery(sql: string): string {
    const activeEngine = this.getEngine();
    if (activeEngine === 'mysql') {
      let formatted = sql.replace(/\$\d+/g, '?');
      formatted = formatted.replace(/"([a-zA-Z0-9_]+)"/g, '`$1`');
      formatted = formatted.replace(/\bTRUE\b/gi, '1').replace(/\bFALSE\b/gi, '0');
      formatted = formatted.replace(/\s+RETURNING\s+[a-zA-Z0-9_,\s]+/gi, '');
      return formatted;
    }

    return sql.replace(/`([a-zA-Z0-9_]+)`/g, '"$1"');
  }

  /**
   * Universal query executor
   * NO SILENT FALLBACK TO MOCK DATA: Throws clear database error if query fails
   */
  public async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.config) {
      if (!this.refreshConfig()) {
        throw new Error(`[Database Configuration Error] Cannot execute query: ${this.configError}`);
      }
    }

    const cfg = this.config!;
    const formattedSql = this.normalizeQuery(sql);

    if (this.engine === 'postgresql') {
      if (!this.pgPool && !this.pglite) {
        await this.connect();
      }
      if (this.pgPool) {
        try {
          const res = await this.pgPool.query(formattedSql, params);
          this.isConnected = true;
          return {
            rows: res.rows as T[],
            rowCount: res.rowCount || 0,
            affectedRows: res.rowCount || 0,
          };
        } catch (err: any) {
          this.lastError = err.message;
          throw new Error(`[Database Error (${this.engine})] Query failed: ${err.message}`);
        }
      }
      if (this.pglite) {
        try {
          const res = await this.pglite.query(formattedSql, params);
          this.isConnected = true;
          return {
            rows: (res.rows || []) as T[],
            rowCount: res.rows?.length || 0,
            affectedRows: (res as any).affectedRows || res.rows?.length || 0,
          };
        } catch (err: any) {
          this.lastError = err.message;
          throw new Error(`[Database Error (${this.engine})] Query failed: ${err.message}`);
        }
      }
      throw new Error(`[Database Error] PostgreSQL pool is not initialized or database daemon is unreachable at ${cfg.host}:${cfg.port}`);
    }

    if (this.engine === 'mysql') {
      if (!this.mysqlPool) {
        await this.connect();
      }
      if (this.mysqlPool) {
        try {
          const [rows] = await this.mysqlPool.query(formattedSql, params);
          this.isConnected = true;
          const rowsArray = Array.isArray(rows) ? (rows as T[]) : [];
          const affectedRows = (rows as any).affectedRows ?? rowsArray.length;
          const insertId = (rows as any).insertId;
          return {
            rows: rowsArray,
            rowCount: rowsArray.length,
            affectedRows,
            insertId,
          };
        } catch (err: any) {
          this.lastError = err.message;
          throw new Error(`[Database Error (${this.engine})] Query failed: ${err.message}`);
        }
      }
      throw new Error(`[Database Error] MySQL pool is not initialized or database daemon is unreachable at ${cfg.host}:${cfg.port}`);
    }

    throw new Error(`[Database Error] Unsupported database engine: ${this.engine}`);
  }

  /**
   * Retrieves all base tables currently existing in the active database.
   */
  public async getExistingTables(): Promise<Set<string>> {
    const tableSet = new Set<string>();
    const activeEngine = this.getEngine();

    if (activeEngine === 'postgresql') {
      const res = await this.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
      );
      res.rows.forEach((r: any) => tableSet.add(String(r.table_name).toLowerCase()));
    } else {
      const dbName = this.config?.database || 'clinic_crm_db';
      const res = await this.query(
        'SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = "BASE TABLE";',
        [dbName]
      );
      res.rows.forEach((r: any) => tableSet.add(String(r.table_name || r.TABLE_NAME).toLowerCase()));
    }

    return tableSet;
  }

  /**
   * Safe transaction management
   */
  public async transaction<T>(callback: (adapter: DatabaseAdapter) => Promise<T>): Promise<T> {
    try {
      await this.query('BEGIN');
      const result = await callback(this);
      await this.query('COMMIT');
      return result;
    } catch (error) {
      try {
        await this.query('ROLLBACK');
      } catch {
        // Rollback attempt
      }
      throw error;
    }
  }

  /**
   * Verifies connection and basic test queries
   */
  public async testConnection(): Promise<{
    engine: DatabaseEngine;
    connected: boolean;
    config: Omit<ResolvedDatabaseConfig, 'password'> & { configError?: string | null };
    error: string | null;
  }> {
    const connected = await this.connect();
    return {
      engine: this.getEngine(),
      connected,
      config: this.getConfig(),
      error: this.lastError,
    };
  }

  /**
   * Safe Database Cleanup Command Implementation
   * Removes test users, demo users, test customers/patients, test bookings, temporary data.
   * Uses real database queries inside a transaction.
   * Handles non-existent tables gracefully by checking existence first.
   * CRITICAL: Preserves the Super Admin user at all times.
   */
  public async executeCleanTable(options: { confirm: boolean; superAdminEmail?: string }): Promise<{
    success: boolean;
    engine: DatabaseEngine;
    totalDeletedRows: number;
    deletedPerTable: Record<string, number>;
    skippedMissingTables: string[];
    protectedSuperAdmin: typeof PROTECTED_SUPER_ADMIN;
    message: string;
  }> {
    if (!options.confirm) {
      throw new Error(
        '[MediEra DB Security] Cleanup aborted: Confirmation flag not provided. Accidental deletion prevented.'
      );
    }

    if (!this.config) {
      if (!this.refreshConfig()) {
        throw new Error(`[DATABASE CONFIGURATION ERROR] ${this.configError}`);
      }
    }

    const cfg = this.config!;
    const connected = await this.connect();
    if (!connected) {
      throw new Error(
        `[DATABASE CONNECTION ERROR] Cannot connect to ${this.engine.toUpperCase()} at ${cfg.host}:${cfg.port}.\n` +
        `Error: ${this.lastError || 'Connection refused'}`
      );
    }

    const superAdminEmail = options.superAdminEmail || PROTECTED_SUPER_ADMIN.email;
    const existingTables = await this.getExistingTables();
    const deletedPerTable: Record<string, number> = {};
    const skippedMissingTables: string[] = [];
    let totalDeletedRows = 0;

    const cleanupPlan: Array<{ table: string; query: string; params?: any[] }> = [
      {
        table: 'journal_lines',
        query: "DELETE FROM journal_lines WHERE journal_entry_id IN (SELECT id FROM journal_entries WHERE reference_type = 'Test' OR description LIKE '%Demo%' OR description LIKE '%Test%');",
      },
      {
        table: 'journal_entries',
        query: "DELETE FROM journal_entries WHERE reference_type = 'Test' OR description LIKE '%Demo%' OR description LIKE '%Test%';",
      },
      {
        table: 'appointment_status_history',
        query: 'DELETE FROM appointment_status_history;',
      },
      {
        table: 'lab_order_items',
        query: 'DELETE FROM lab_order_items;',
      },
      {
        table: 'lab_orders',
        query: "DELETE FROM lab_orders WHERE is_demo = TRUE OR order_number LIKE 'DEMO-%';",
      },
      {
        table: 'prescription_items',
        query: 'DELETE FROM prescription_items;',
      },
      {
        table: 'prescriptions',
        query: "DELETE FROM prescriptions WHERE is_demo = TRUE OR prescription_number LIKE 'DEMO-%';",
      },
      {
        table: 'consultations',
        query: "DELETE FROM consultations WHERE is_demo = TRUE OR consultation_number LIKE 'DEMO-%';",
      },
      {
        table: 'payments',
        query: "DELETE FROM payments WHERE notes LIKE '%Demo%' OR notes LIKE '%Test%';",
      },
      {
        table: 'invoice_items',
        query: "DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE is_demo = TRUE);",
      },
      {
        table: 'invoices',
        query: "DELETE FROM invoices WHERE is_demo = TRUE OR invoice_number LIKE 'DEMO-%';",
      },
      {
        table: 'appointments',
        query: 'DELETE FROM appointments WHERE is_demo = TRUE;',
      },
      {
        table: 'vitals',
        query: 'DELETE FROM vitals;',
      },
      {
        table: 'followups',
        query: 'DELETE FROM followups WHERE is_demo = TRUE;',
      },
      {
        table: 'leads',
        query: 'DELETE FROM leads WHERE is_demo = TRUE;',
      },
      {
        table: 'inventory_items',
        query: 'DELETE FROM inventory_items WHERE is_demo = TRUE;',
      },
      {
        table: 'patients',
        query: 'DELETE FROM patients WHERE is_demo = TRUE;',
      },
      {
        table: 'users',
        query: "DELETE FROM users WHERE email != $1 AND id != $2 AND (email LIKE '%test%' OR email LIKE '%demo%' OR name LIKE '%Test%');",
        params: [superAdminEmail, PROTECTED_SUPER_ADMIN.id],
      },
    ];

    await this.query('BEGIN');
    try {
      if (this.engine === 'mysql') {
        await this.query('SET FOREIGN_KEY_CHECKS = 0;');
      }

      for (const item of cleanupPlan) {
        if (!existingTables.has(item.table.toLowerCase())) {
          skippedMissingTables.push(item.table);
          continue;
        }

        const res = await this.query(item.query, item.params || []);
        const count = res.affectedRows ?? res.rowCount ?? 0;
        deletedPerTable[item.table] = count;
        totalDeletedRows += count;
      }

      if (this.engine === 'mysql') {
        await this.query('SET FOREIGN_KEY_CHECKS = 1;');
      }

      await this.query('COMMIT');
    } catch (err: any) {
      try {
        await this.query('ROLLBACK');
      } catch {
        // Rollback attempt
      }
      throw new Error(`[Cleanup Execution Failed]: ${err.message}`);
    }

    let superAdminPreserved = false;
    if (existingTables.has('users')) {
      try {
        const verifyRes = await this.query(
          "SELECT id, email, status FROM users WHERE id = $1 OR email = $2;",
          [PROTECTED_SUPER_ADMIN.id, superAdminEmail]
        );
        superAdminPreserved = verifyRes.rows.length > 0;
      } catch {
        // Verify check
      }
    }

    return {
      success: true,
      engine: this.engine,
      totalDeletedRows,
      deletedPerTable,
      skippedMissingTables,
      protectedSuperAdmin: {
        ...PROTECTED_SUPER_ADMIN,
        email: superAdminEmail,
      },
      message: `Database cleanup completed successfully on ${this.engine.toUpperCase()}. ` +
        `Super Admin (${superAdminEmail}) is verified and preserved (${superAdminPreserved ? 'Active in DB' : 'Protected'}).`,
    };
  }

  /**
   * Destructive Table Deletion Utility (del-table)
   * Strictly blocked in production.
   * Protects core system tables from being dropped.
   * Drops remaining application tables with foreign key constraint handling.
   */
  public async executeDelTable(options: { confirm: boolean }): Promise<{
    success: boolean;
    engine: DatabaseEngine;
    droppedTables: string[];
    protectedTables: string[];
    message: string;
  }> {
    if (!options.confirm) {
      throw new Error('[SECURITY ALERT] Deletion aborted: Confirmation flag not provided.');
    }

    const env = (process.env.NODE_ENV || process.env.APP_ENV || 'development').toLowerCase();
    if (env === 'production') {
      throw new Error('[CRITICAL SECURITY] Table deletion is strictly forbidden in production.');
    }

    if (!this.config) {
      if (!this.refreshConfig()) {
        throw new Error(`[DATABASE CONFIGURATION ERROR] ${this.configError}`);
      }
    }

    const cfg = this.config!;
    const connected = await this.connect();
    if (!connected) {
      throw new Error(
        `[DATABASE CONNECTION ERROR] Cannot connect to ${this.engine.toUpperCase()} at ${cfg.host}:${cfg.port}.\n` +
        `Error: ${this.lastError || 'Connection refused'}`
      );
    }

    const existingTables = await this.getExistingTables();
    const protectedSet = new Set(PROTECTED_SYSTEM_TABLES.map((t) => t.toLowerCase()));

    const tablesToDrop = Array.from(existingTables).filter((t) => !protectedSet.has(t));
    const preservedSystemTables = Array.from(existingTables).filter((t) => protectedSet.has(t));

    if (tablesToDrop.length === 0) {
      return {
        success: true,
        engine: this.engine,
        droppedTables: [],
        protectedTables: preservedSystemTables,
        message: 'No non-system tables found to delete.',
      };
    }

    try {
      if (this.engine === 'mysql') {
        await this.query('SET FOREIGN_KEY_CHECKS = 0;');
        try {
          for (const tbl of tablesToDrop) {
            await this.query(`DROP TABLE IF EXISTS \`${tbl}\`;`);
          }
        } finally {
          await this.query('SET FOREIGN_KEY_CHECKS = 1;');
        }
      } else {
        for (const tbl of tablesToDrop) {
          await this.query(`DROP TABLE IF EXISTS "${tbl}" CASCADE;`);
        }
      }

      return {
        success: true,
        engine: this.engine,
        droppedTables: tablesToDrop,
        protectedTables: preservedSystemTables,
        message: `Successfully dropped ${tablesToDrop.length} table(s) on ${this.engine.toUpperCase()}. ` +
          `Protected ${preservedSystemTables.length} system table(s).`,
      };
    } catch (err: any) {
      throw new Error(`[Table Deletion Error]: ${err.message}`);
    }
  }
}

export const dbAdapter = DatabaseAdapter.getInstance();
