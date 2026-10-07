#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System - Database Clean Utility
 * Command: npm run clean-table [-- --confirm]
 * 
 * Removes application data while preserving database schema & migration history.
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
      resolve(trimmed === 'yes' || trimmed === 'y');
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
    process.env.FORCE_CLEAN === 'true' ||
    !process.stdin.isTTY;

  if (!autoConfirm) {
    const confirmed = await askConfirmation('⚠️  This will remove all application data while preserving schemas. Continue? (yes/no): ');
    if (!confirmed) {
      console.log('\n[CANCELLED] Database clean cancelled by user.');
      process.exit(0);
    }
  }

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
    console.error('==================================================');
    console.error('DATABASE CLEAN');
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
