import { MigrationEngine } from './migration-engine.ts';

export async function runReset(): Promise<void> {
  const engine = new MigrationEngine();
  try {
    console.log('[STEP 1/2] Dropping tables...');
    await engine.dropTable();
    console.log('[STEP 2/2] Running migrations and bootstrapping...');
    await engine.migrate();
    await engine.bootstrapSuperAdmin();
    console.log('✅ Database reset completed successfully.\n');
    await engine.close();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Database reset failed:', err.message || err);
    await engine.close().catch(() => {});
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runReset();
}
