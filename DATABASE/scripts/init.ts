import { MigrationEngine } from '../engine/migration-engine.ts';
import type { DatabaseClient } from '../engine/connection.ts';

export interface SeedBaselineResult {
  roles: string[];
  permissions: string[];
  superAdminEmail: string;
}

export async function seedInitialData(client?: DatabaseClient): Promise<SeedBaselineResult> {
  const engine = new MigrationEngine();
  try {
    await engine.migrate({ skipStatusPrint: true });
    const admin = await engine.bootstrapSuperAdmin();
    const activeClient = client || engine.getClient();
    let roles: any[] = [];
    let permissions: any[] = [];
    try {
      roles = await activeClient.query<any>('SELECT name FROM roles;');
      permissions = await activeClient.query<any>('SELECT name FROM permissions;');
    } catch {
      // Fallback if empty
    }
    return {
      roles: roles.map((r: any) => r.name || ''),
      permissions: permissions.map((p: any) => p.name || ''),
      superAdminEmail: admin.email,
    };
  } finally {
    await engine.close().catch(() => {});
  }
}

export async function ensureDatabaseReady(): Promise<void> {
  const engine = new MigrationEngine();
  try {
    const health = await engine.checkHealth();
    if (health.connected) {
      await engine.migrate();
      await engine.bootstrapSuperAdmin();
    }
  } catch (err: any) {
    console.warn('[Database Ready Notice]', err.message || err);
  } finally {
    await engine.close().catch(() => {});
  }
}

export async function runInit(): Promise<void> {
  const engine = new MigrationEngine();
  try {
    const health = await engine.checkHealth();
    engine.printDatabaseStatus(health);

    if (!health.connected) {
      console.error(`[FATAL] Database connection failed: ${health.error}`);
      process.exit(1);
    }

    const migResult = await engine.migrate();
    console.log(`Newly Applied : ${migResult.applied.length}`);
    console.log(`Pre-existing  : ${migResult.skipped.length}`);

    await engine.bootstrapSuperAdmin();
    console.log('✅ Database initialization completed successfully.\n');

    await engine.close();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Database initialization failed:', err.message || err);
    await engine.close().catch(() => {});
    process.exit(1);
  }
}

// If executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runInit();
}
