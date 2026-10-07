import dotenv from 'dotenv';

dotenv.config();

export type SupportedDialect = 'postgres' | 'mysql';

export interface DbConfig {
  dialect: SupportedDialect;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  connectionString?: string;
  ssl?: boolean | object;
}

/**
 * Normalizes user-specified dialect string into 'postgres' or 'mysql'
 */
export function normalizeDialect(rawDialect?: string): SupportedDialect {
  const d = (rawDialect || '').trim().toLowerCase();
  if (['postgres', 'postgresql', 'pg'].includes(d)) {
    return 'postgres';
  }
  if (['mysql', 'mariadb'].includes(d)) {
    return 'mysql';
  }
  if (!d) {
    return 'postgres';
  }
  throw new Error(`Unsupported database dialect: "${rawDialect}". Supported dialects are "postgres" and "mysql".`);
}

/**
 * Parses connection string if supplied (postgres:// or mysql://)
 */
function parseConnectionString(connStr: string): Partial<DbConfig> | null {
  try {
    const url = new URL(connStr);
    const dialect = normalizeDialect(url.protocol.replace(':', ''));
    const host = url.hostname || 'localhost';
    const port = url.port ? parseInt(url.port, 10) : dialect === 'mysql' ? 3306 : 5432;
    const database = url.pathname ? url.pathname.replace(/^\//, '') : '';
    const user = decodeURIComponent(url.username || '');
    const password = decodeURIComponent(url.password || '');

    return { dialect, host, port, database, user, password, connectionString: connStr };
  } catch {
    return null;
  }
}

/**
 * Loads database configuration from environment variables with backwards-compatibility
 */
export function getDbConfig(): DbConfig {
  const rawExplicitDialect =
    process.env.CURRENT_DATABASE ||
    process.env.DB_DIALECT ||
    process.env.DATABASE_DIALECT ||
    process.env.SQL_DIALECT;

  const explicitDialect = rawExplicitDialect ? normalizeDialect(rawExplicitDialect) : null;

  const connectionUrl = process.env.DATABASE_URL || process.env.DB_URL;
  if (connectionUrl) {
    const parsed = parseConnectionString(connectionUrl);
    // If an explicit dialect was requested (e.g. mysql), only use connectionUrl if its dialect matches
    if (parsed && parsed.dialect && parsed.host && parsed.database) {
      if (!explicitDialect || explicitDialect === parsed.dialect) {
        return {
          dialect: parsed.dialect,
          host: parsed.host,
          port: parsed.port || (parsed.dialect === 'mysql' ? 3306 : 5432),
          database: parsed.database,
          user: parsed.user || (parsed.dialect === 'mysql' ? 'root' : 'postgres'),
          password: parsed.password || '',
          connectionString: connectionUrl,
        };
      }
    }
  }

  const dialect = explicitDialect || 'postgres';

  if (dialect === 'mysql') {
    const host = (process.env.MYSQLHOST || process.env.MYSQL_DB_HOST || process.env.MYSQL_HOST)?.trim() || 'localhost';
    const rawPort = (process.env.MYSQLPORT || process.env.MYSQL_DB_PORT || process.env.MYSQL_PORT)?.trim();
    const port = rawPort ? parseInt(rawPort, 10) : 3306;
    const database = (process.env.MYSQLDATABASE || process.env.MYSQL_DB_NAME)?.trim() || 'mediera_workshop_db';
    const user = (process.env.MYSQLUSER || process.env.MYSQL_DB_USER || process.env.MYSQL_USER)?.trim() || 'root';
    const password =
      process.env.MYSQLPASSWORD !== undefined
        ? process.env.MYSQLPASSWORD
        : (process.env.MYSQL_DB_PASSWORD || process.env.MYSQL_PASSWORD || '');

    return {
      dialect: 'mysql',
      host,
      port,
      database,
      user,
      password,
    };
  }

  // PostgreSQL dialect
  const host = (process.env.PGHOST || process.env.SQL_HOST || process.env.DB_HOST)?.trim() || 'localhost';
  const rawPort = (process.env.PGPORT || process.env.SQL_PORT || process.env.DB_PORT)?.trim();
  const port = rawPort ? parseInt(rawPort, 10) : 5432;
  const database = (process.env.PGDATABASE || process.env.SQL_DB_NAME || process.env.DB_NAME)?.trim() || 'mediera_workshop_db';
  const user = (process.env.PGUSER || process.env.SQL_USER || process.env.DB_USER)?.trim() || 'postgres';
  const password =
    process.env.PGPASSWORD !== undefined
      ? process.env.PGPASSWORD
      : (process.env.SQL_PASSWORD || process.env.DB_PASSWORD || '');

  return {
    dialect: 'postgres',
    host,
    port,
    database,
    user,
    password,
  };
}

/**
 * Returns a display-safe configuration representation without exposing passwords or credentials
 */
export function getSafeConfig(config: DbConfig) {
  const isProd = process.env.NODE_ENV === 'production';
  const isCloud = Boolean(
    process.env.INSTANCE_CONNECTION_NAME ||
    process.env.CLOUD_SQL_CONNECTION_NAME ||
    process.env.GOOGLE_CLOUD_PROJECT
  );

  return {
    dialect: config.dialect === 'postgres' ? 'PostgreSQL' : 'MySQL',
    rawDialect: config.dialect,
    database: config.database,
    host: config.host,
    port: config.port,
    user: config.user,
    environment: isCloud ? 'Cloud' : isProd ? 'Production' : 'Local',
    status: 'Connected',
  };
}
