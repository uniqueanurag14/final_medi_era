#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System - Table Drop Utility
 * Command: npm run drop-table / npm run del-table [-- --confirm]
 * 
 * Drops all application tables & schema objects.
 */

import readline from 'readline';
import dotenv from 'dotenv';
import { MigrationEngine } from '../DATABASE/engine/migration-engine.ts';

dotenv.config();

async function askConfirmation(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === 'yes' || trimmed === 'y' || trimmed === 'delete tables');
    });
  });
}

async function run() {
  const engine = new MigrationEngine();

  const args = process.argv.slice(2);
  const autoConfirm =
    args.includes('--confirm') ||
    args.includes('--yes') ||
    args.includes('-y') ||
    args.includes('--force') ||
    process.env.FORCE_DEL === 'true' ||
    !process.stdin.isTTY;

  if (!autoConfirm) {
    const confirmed = await askConfirmation('⚠️  DANGER: This will DROP ALL tables in the database. Continue? (yes/no): ');
    if (!confirmed) {
      console.log('\n[CANCELLED] Operation cancelled. No tables were dropped.');
      process.exit(0);
    }
  }

  try {
    const result = await engine.dropTable();

    console.log('==================================================');
    console.log('DATABASE DROP');
    console.log(`Provider          : ${result.provider}`);
    console.log(`Database          : ${result.database}`);
    console.log(`Tables discovered : ${result.discoveredCount}`);
    console.log(`Tables dropped    : ${result.droppedCount}`);
    console.log(`Status            : ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log('==================================================\n');

    await engine.close();
    process.exit(0);
  } catch (err: any) {
    console.error('==================================================');
    console.error('DATABASE DROP');
    console.error(`Provider : ${engine.getConfig().dialect === 'mysql' ? 'MySQL' : 'PostgreSQL'}`);
    console.error(`Database : ${engine.getConfig().database}`);
    console.error(`Status   : FAILED`);
    console.error(`Error    : ${err.message || err}`);
    console.error('==================================================\n');
    await engine.close().catch(() => {});
    process.exit(1);
  }
}

run();
