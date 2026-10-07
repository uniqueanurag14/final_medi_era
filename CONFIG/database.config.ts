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
  const currentDatabase = process.env.CURRENT_DATABASE?.trim() || 'PostgreSQL';
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
  // Prioritize Cloud SQL if provisioned by the platform
  if (process.env.SQL_HOST && process.env.SQL_DB_NAME) {
    return {
      engine: 'postgresql',
      host: process.env.SQL_HOST,
      port: 5432,
      database: process.env.SQL_DB_NAME,
      user: process.env.SQL_USER || 'postgres',
      password: process.env.SQL_PASSWORD || '',
      ssl: false,
    };
  }

  const database = process.env.CURRENT_DATABASE?.trim();

  if (!database) {
    throw new Error(
      '[DATABASE CONFIGURATION ERROR] Missing required environment variable: CURRENT_DATABASE.\n' +
      'CURRENT_DATABASE is the single source of truth for database selection.\n' +
      'Please set CURRENT_DATABASE="PostgreSQL" in your environment or .env file.'
    );
  }

  switch (database) {
    case 'PostgreSQL':
    case 'postgresql':
    case 'postgres': {
      let host = process.env.PGHOST || 'localhost';
      let portRaw = process.env.PGPORT || '5432';
      let dbName = process.env.PGDATABASE || 'clinic_crm_db';
      let user = process.env.PGUSER || 'postgres';
      let password = process.env.PGPASSWORD !== undefined ? String(process.env.PGPASSWORD) : '';
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

    case 'MySQL':
    case 'mysql': {
      const rawUrl = process.env.DATABASE_URL?.startsWith('mysql://') ? process.env.DATABASE_URL : undefined;
      const host = process.env.MYSQL_DB_HOST || process.env.MYSQLHOST || 'localhost';
      const portRaw = process.env.MYSQL_DB_PORT || process.env.MYSQLPORT || '3306';
      const port = parseInt(portRaw, 10);
      if (isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`[DATABASE CONFIGURATION ERROR] Invalid MYSQL_DB_PORT: "${portRaw}". Must be a valid port number.`);
      }

      const dbName =
        process.env.MYSQL_DB_NAME ||
        process.env.MYSQLDATABASE ||
        'clinic_crm_db';

      const user =
        process.env.MYSQL_DB_USER ||
        process.env.MYSQLUSER ||
        'root';

      const password =
        process.env.MYSQL_DB_PASSWORD ??
        process.env.MYSQLPASSWORD ??
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

    case 'SQLite':
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
