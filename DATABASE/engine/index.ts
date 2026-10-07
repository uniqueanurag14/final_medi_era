import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';
import * as schema from '../schemas/schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
  var _sharedPglite: PGlite | undefined;
}

export function getOrCreateSharedPglite(dataDir?: string): PGlite {
  if (!global._sharedPglite) {
    const defaultDir = dataDir || process.env.PGDATA_DIR || path.resolve(process.cwd(), '.data/postgres');
    try {
      if (fs.existsSync(defaultDir)) {
        if (!fs.existsSync(path.join(defaultDir, 'global'))) {
          fs.rmSync(defaultDir, { recursive: true, force: true });
        } else if (fs.existsSync(path.join(defaultDir, 'postmaster.pid'))) {
          fs.rmSync(path.join(defaultDir, 'postmaster.pid'), { force: true });
        }
      }
      fs.mkdirSync(defaultDir, { recursive: true });
      global._sharedPglite = new PGlite(defaultDir);
    } catch {
      try {
        if (fs.existsSync(defaultDir)) {
          fs.rmSync(defaultDir, { recursive: true, force: true });
          fs.mkdirSync(defaultDir, { recursive: true });
        }
        global._sharedPglite = new PGlite(defaultDir);
      } catch {
        // Fallback to in-memory PGlite if persistent disk creation fails
        global._sharedPglite = new PGlite();
      }
    }
  }
  return global._sharedPglite;
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: process.env.SQL_HOST === 'localhost' ? 1000 : 15000,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
export { schema };
