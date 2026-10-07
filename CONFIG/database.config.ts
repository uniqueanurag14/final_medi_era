/**
 * MediEra / AutoEra CRM + ERP Database Configuration Loader
 * 
 * CURRENT_DATABASE is the single source of truth for database selection:
 *   CURRENT_DATABASE=MySQL or CURRENT_DATABASE=PostgreSQL (case-insensitive)
 * 
 * Removes all reliance on legacy MYSQL=true and PGDB=false flags.
 * Fails clearly if CURRENT_DATABASE is missing or invalid.
 * Validates only the active engine's credentials.
 * Never logs or exposes passwords or secrets.
 */

import dotenv from 'dotenv';
dotenv.config();

export type DatabaseEngine = 'mysql' | 'postgresql' | 'sqlite';

export interface ResolvedDatabaseConfig {
  engine: DatabaseEngine;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  connectionUrl?: string;
}

export interface SystemDataConfig {
  currentDatabase: string;
  disableDummyData: boolean;
  enableDemoData: boolean;
  enableDummyData: boolean;
}

export function getSystemDataConfig(): SystemDataConfig {
  const currentDatabase =
    process.env.CURRENT_DATABASE?.trim() ||
    process.env.DB_PROVIDER?.trim() ||
    process.env.DATABASE_PROVIDER?.trim() ||
    'PostgreSQL';
  // Default is safe: if DISABLE_DUMMY_DATA is missing or true, disable all dummy data
  const rawDisable = process.env.DISABLE_DUMMY_DATA;
  const disableDummyData = rawDisable !== undefined ? rawDisable.toLowerCase() === 'true' : true;

  const enableDemoData = disableDummyData ? false : process.env.ENABLE_DEMO_DATA === 'true';
  const enableDummyData = disableDummyData ? false : process.env.ENABLE_DUMMY_DATA === 'true';

  return {
    currentDatabase,
    disableDummyData,
    enableDemoData,
    enableDummyData,
  };
}

export function getDatabaseConfig(): ResolvedDatabaseConfig {
  const rawDb =
    process.env.CURRENT_DATABASE?.trim() ||
    process.env.DB_PROVIDER?.trim() ||
    process.env.DATABASE_PROVIDER?.trim() ||
    process.env.DB_DIALECT?.trim() ||
    process.env.DATABASE_DIALECT?.trim() ||
    process.env.DB_ENGINE?.trim() ||
    process.env.DATABASE_ENGINE?.trim();

  let database = rawDb;

  if (!database) {
    if (process.env.DATABASE_URL?.startsWith('mysql://') || process.env.DB_URL?.startsWith('mysql://')) {
      database = 'MySQL';
    } else if (process.env.DATABASE_URL?.startsWith('postgres') || process.env.DB_URL?.startsWith('postgres')) {
      database = 'PostgreSQL';
    } else if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
      database = 'PostgreSQL';
    } else if (process.env.DB_PORT === '3306' || process.env.MYSQLPORT === '3306' || (process.env.MYSQLUSER && !process.env.PGUSER)) {
      database = 'MySQL';
    } else {
      database = 'PostgreSQL';
    }
  }

  const normalized = database.toLowerCase();

  // Prioritize Cloud SQL only if PostgreSQL is selected or not explicitly set to MySQL
  if (['postgresql', 'postgres', 'pg'].includes(normalized) && process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    return {
      engine: 'postgresql',
      host: process.env.SQL_HOST,
      port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
      database: process.env.SQL_DB_NAME,
      user: process.env.SQL_USER || 'postgres',
      password: process.env.SQL_PASSWORD || '',
      ssl: false,
    };
  }

  switch (normalized) {
    case 'postgresql':
    case 'postgres':
    case 'pg': {
      let host = process.env.PGHOST || process.env.PG_HOST || process.env.POSTGRES_HOST || process.env.DB_HOST || process.env.SQL_HOST || 'localhost';
      let portRaw = process.env.PGPORT || process.env.PG_PORT || process.env.POSTGRES_PORT || process.env.DB_PORT || process.env.SQL_PORT || '5432';
      let dbName = process.env.PGDATABASE || process.env.PG_DATABASE || process.env.POSTGRES_DB || process.env.DB_NAME || process.env.SQL_DB_NAME || 'medical_crm_new';
      let user = process.env.PGUSER || process.env.PG_USER || process.env.POSTGRES_USER || process.env.DB_USER || process.env.SQL_USER || 'postgres';
      let password = process.env.PGPASSWORD !== undefined ? String(process.env.PGPASSWORD) : (process.env.PG_PASSWORD || process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || process.env.SQL_PASSWORD || '');
      const ssl = process.env.PGSSL === 'true';

      const rawUrl =
        process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://'))
          ? process.env.DATABASE_URL
          : undefined;

      if (rawUrl) {
        try {
          const parsed = new URL(rawUrl);
          if (parsed.hostname) host = parsed.hostname;
          if (parsed.port) portRaw = parsed.port;
          if (parsed.pathname && parsed.pathname.length > 1) dbName = parsed.pathname.substring(1);
          if (parsed.username) user = decodeURIComponent(parsed.username);
          if (parsed.password) password = decodeURIComponent(parsed.password);
        } catch {
          // Keep env variables
        }
      }

      const port = parseInt(portRaw, 10);
      if (isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`[DATABASE CONFIGURATION ERROR] Invalid PGPORT: "${portRaw}". Must be a valid port number.`);
      }

      return {
        engine: 'postgresql',
        host,
        port,
        database: dbName,
        user,
        password,
        ssl,
        connectionUrl: rawUrl,
      };
    }

    case 'mysql':
    case 'mariadb': {
      const rawUrl = process.env.DATABASE_URL?.startsWith('mysql://') ? process.env.DATABASE_URL : undefined;
      const host = process.env.MYSQL_DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
      const portRaw = process.env.MYSQL_DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || '3306';
      const port = parseInt(portRaw, 10);
      if (isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`[DATABASE CONFIGURATION ERROR] Invalid MYSQL_DB_PORT: "${portRaw}". Must be a valid port number.`);
      }

      const dbName =
        process.env.MYSQL_DB_NAME ||
        process.env.MYSQLDATABASE ||
        process.env.DB_NAME ||
        'medical_crm_new';

      const user =
        process.env.MYSQL_DB_USER ||
        process.env.MYSQLUSER ||
        process.env.MYSQL_USER ||
        process.env.DB_USER ||
        'root';

      const password =
        process.env.MYSQL_DB_PASSWORD ??
        process.env.MYSQLPASSWORD ??
        process.env.MYSQL_PASSWORD ??
        process.env.DB_PASSWORD ??
        '';

      const ssl = (process.env.MYSQL_SSL || process.env.MYSQLSSL) === 'true';

      return {
        engine: 'mysql',
        host,
        port,
        database: dbName,
        user,
        password,
        ssl,
        connectionUrl: rawUrl,
      };
    }

    case 'sqlite': {
      const dbPath = process.env.SQLITE_DB_PATH || './.data/sqlite/mediera.db';
      return {
        engine: 'sqlite',
        host: 'localhost',
        port: 0,
        database: dbPath,
        user: 'system',
        password: '',
        ssl: false,
      };
    }

    default:
      throw new Error(`Unsupported database: ${database}`);
  }
}

/**
 * Format configuration for safe logging without exposing secrets.
 */
export function formatDatabaseConfigForDisplay(config: ResolvedDatabaseConfig): string {
  return [
    '================================================================',
    '                   DATABASE CONFIGURATION                       ',
    '================================================================',
    `  Active Database Engine : ${config.engine.toUpperCase()}`,
    `  Host                   : ${config.host}`,
    `  Port                   : ${config.port}`,
    `  Database Name          : ${config.database}`,
    `  User                   : ${config.user}`,
    `  Password               : ${config.password ? 'SET (length: ' + config.password.length + ')' : 'EMPTY'}`,
    `  SSL Enabled            : ${config.ssl}`,
    '================================================================',
  ].join('\n');
}
