import { MigrationEngine } from '../engine/migration-engine.ts';

export async function runClean(): Promise<void> {
  const engine = new MigrationEngine();
  try {
    const result = await engine.cleanTable();
    console.log('==================================================');
    console.log('DATABASE CLEAN');
    console.log(`Provider          : ${result.provider}`);
    console.log(`Database          : ${result.database}`);
    console.log(`Tables discovered : ${result.discoveredCount}`);
    console.log(`Tables cleaned    : ${result.cleanedCount}`);
    console.log(`Status            : ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log('==================================================\n');
    await engine.close();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Database clean failed:', err.message || err);
    await engine.close().catch(() => {});
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runClean();
}
