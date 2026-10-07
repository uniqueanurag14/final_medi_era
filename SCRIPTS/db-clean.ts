import { runClean } from '../DATABASE/scripts/clean.ts';

export async function dbClean(): Promise<void> {
  await runClean();
}

if (process.argv[1]?.endsWith('db-clean.ts')) {
  dbClean()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
