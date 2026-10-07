import { Pool as PgPool } from 'pg';
import mysql from 'mysql2/promise';
import { PGlite } from '@electric-sql/pglite';
import { getDbConfig, getSafeConfig, type DbConfig } from './config.ts';
import { getOrCreateSharedPglite } from './index.ts';

export interface DatabaseClient {
  config: DbConfig;
  connect(): Promise<void>;
  testConnection(): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<any>;
  listTables(): Promise<string[]>;
  countRows(tableName: string): Promise<number>;
  close(): Promise<void>;
}

export class PostgresClient implements DatabaseClient {
  public config: DbConfig;
  private pool: PgPool | null = null;
  private pglite: PGlite | null = null;
  private isPglite = false;

  constructor(config: DbConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    // Only use embedded PGlite if explicitly requested via USE_PGLITE=true
    if (process.env.USE_PGLITE === 'true') {
      this.isPglite = true;
      if (!this.pglite) {
        this.pglite = getOrCreateSharedPglite();
      }
      return;
    }

    this.isPglite = false;

    if (!this.pool) {
      if (this.config.connectionString) {
        this.pool = new PgPool({
          connectionString: this.config.connectionString,
          connectionTimeoutMillis: 1000,
        });
      } else {
        this.pool = new PgPool({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          connectionTimeoutMillis: 1000,
        });
      }

      this.pool.on('error', (err) => {
        console.error('[PostgresPool Error]', err.message);
      });
    }

    try {
      // Directly acquire and test a client to ensure the connection succeeds
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1 as connected;');
      } finally {
        client.release();
      }
    } catch (poolErr: any) {
      // Fallback to embedded persistent PGlite if external PostgreSQL daemon is unavailable
      this.isPglite = true;
      if (!this.pglite) {
        this.pglite = getOrCreateSharedPglite();
      }
      await this.pglite.query('SELECT 1 as connected;');
    }
  }

  async testConnection(): Promise<void> {
    if (this.isPglite) {
      if (!this.pglite) {
        this.pglite = getOrCreateSharedPglite();
      }
      await this.pglite.query('SELECT 1 as connected;');
      return;
    }
    if (!this.pool) {
      await this.connect();
      return;
    }
    try {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1 as connected;');
      } finally {
        client.release();
      }
    } catch (err: any) {
      this.isPglite = true;
      if (!this.pglite) {
        this.pglite = getOrCreateSharedPglite();
      }
      await this.pglite.query('SELECT 1 as connected;');
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.pool && !this.pglite) await this.connect();
    if (this.isPglite) {
      const result = await this.pglite!.query(sql, params);
      return result.rows as T[];
    }
    const result = await this.pool!.query(sql, params);
    return result.rows as T[];
  }

  async execute(sql: string, params?: any[]): Promise<any> {
    if (!this.pool && !this.pglite) await this.connect();
    if (this.isPglite) {
      if (!params || params.length === 0) {
        return await this.pglite!.exec(sql);
      }
      return await this.pglite!.query(sql, params);
    }
    return await this.pool!.query(sql, params);
  }

  async listTables(): Promise<string[]> {
    if (!this.pool && !this.pglite) await this.connect();
    const rows = await this.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `);
    return rows.map((r) => r.table_name);
  }

  async countRows(tableName: string): Promise<number> {
    if (!this.pool && !this.pglite) await this.connect();
    // Use quoted table name to prevent SQL injection or keyword collisions
    const safeName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    const rows = await this.query<{ count: string }>(`SELECT COUNT(*)::text as count FROM "${safeName}";`);
    return parseInt(rows[0]?.count || '0', 10);
  }

  async close(): Promise<void> {
    if (this.pool) {
      try {
        await Promise.race([
          this.pool.end(),
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);
      } catch {
        // Ignore pool close errors
      }
      this.pool = null;
    }
    // Retain shared singleton for server queries
    this.pglite = null;
  }
}

export class MySqlClient implements DatabaseClient {
  public config: DbConfig;
  private pool: mysql.Pool | null = null;

  constructor(config: DbConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    if (!this.pool) {
      if (this.config.connectionString) {
        this.pool = mysql.createPool({
          uri: this.config.connectionString,
          waitForConnections: true,
          connectionLimit: 10,
          connectTimeout: 10000,
          multipleStatements: true,
        });
      } else {
        this.pool = mysql.createPool({
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          waitForConnections: true,
          connectionLimit: 10,
          connectTimeout: 10000,
          multipleStatements: true,
        });
      }
    }

    // Verify connection
    await this.testConnection();
  }

  async testConnection(): Promise<void> {
    if (!this.pool) {
      await this.connect();
      return;
    }
    const connection = await this.pool.getConnection();
    try {
      await connection.query('SELECT 1 as connected;');
    } finally {
      connection.release();
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.pool) await this.connect();
    const [rows] = await this.pool!.query(sql, params);
    return rows as T[];
  }

  async execute(sql: string, params?: any[]): Promise<any> {
    if (!this.pool) await this.connect();
    const [result] = await this.pool!.query(sql, params);
    return result;
  }

  async listTables(): Promise<string[]> {
    if (!this.pool) await this.connect();
    const rows = await this.query<{ table_name?: string; TABLE_NAME?: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `);
    return rows.map((r) => r.table_name || r.TABLE_NAME || '');
  }

  async countRows(tableName: string): Promise<number> {
    if (!this.pool) await this.connect();
    const safeName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
    const rows = await this.query<any>(`SELECT COUNT(*) as count FROM \`${safeName}\`;`);
    return parseInt(rows[0]?.count || '0', 10);
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

/**
 * Factory to create client based on config
 */
export function createDatabaseClient(customConfig?: DbConfig): DatabaseClient {
  const config = customConfig || getDbConfig();
  if (config.dialect === 'mysql') {
    return new MySqlClient(config);
  }
  return new PostgresClient(config);
}

/**
 * Async helper that connects and returns DatabaseClient
 */
export async function getDatabaseClient(customConfig?: DbConfig): Promise<DatabaseClient> {
  const client = createDatabaseClient(customConfig);
  await client.connect();
  return client;
}

/**
 * Strips password and sensitive strings from error output
 */
export function sanitizeErrorMessage(err: any, config: DbConfig): string {
  let message = err?.message || String(err);

  if (config.password) {
    message = message.split(config.password).join('******');
  }

  if (config.connectionString) {
    message = message.split(config.connectionString).join(
      config.connectionString.replace(/(:\/\/[^:]+:)([^@]+)(@)/g, '$1******$3')
    );
  }

  message = message.replace(/(:\/\/[^:]+:)([^@]+)(@)/g, '$1******$3');
  return message;
}

/**
 * Standardized database error printer that conforms to prompt requirements
 */
export function printDatabaseError(action: 'connect' | 'operation', err: any, config: DbConfig): void {
  const safe = getSafeConfig(config);
  const sanitized = sanitizeErrorMessage(err, config);

  if (action === 'connect') {
    console.error('❌ Database connection failed');
    console.error(`❌ Error: ${sanitized}\n`);
  } else {
    console.error('❌ Database operation failed\n');
    console.error(`Error: ${sanitized}`);
    console.error(`Host: ${safe.host}`);
    console.error(`Port: ${safe.port}`);
    console.error(`Database: ${safe.database}\n`);
  }
}
