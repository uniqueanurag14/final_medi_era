#!/usr/bin/env node
/**
 * MediEra Medical CRM + ERP System - Port Management Utility
 * Command: npm run free-port
 * 
 * Frees port 3000 (or specified PORT) on Windows (PowerShell/CMD), Linux, and macOS.
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const portToFree = parseInt(process.env.PORT || '3000', 10);
const isWindows = process.platform === 'win32';

console.log('================================================================');
console.log('  MediEra Medical CRM & ERP - Port Management Utility');
console.log(`  Target Port: ${portToFree}`);
console.log(`  Operating System: ${process.platform} (${isWindows ? 'Windows' : 'Unix-like'})`);
console.log('================================================================\n');

function freePortWindows(port: number): boolean {
  try {
    const netstatOutput = execSync(`netstat -ano -p tcp`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const lines = netstatOutput.split('\n');
    const pids = new Set<string>();

    for (const line of lines) {
      if (line.includes(`:${port} `) && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid) && pid !== '0') {
          pids.add(pid);
        }
      }
    }

    if (pids.size === 0) {
      console.log(`[STATUS] Port ${port} is already free. No process is listening.`);
      return true;
    }

    for (const pid of pids) {
      console.log(`[ACTION] Terminating Windows process PID ${pid} listening on port ${port}...`);
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'inherit' });
        console.log(`[SUCCESS] Terminated PID ${pid}.`);
      } catch (killErr: any) {
        // Try powershell fallback
        try {
          execSync(`powershell -Command "Stop-Process -Id ${pid} -Force"`, { stdio: 'inherit' });
          console.log(`[SUCCESS] Terminated PID ${pid} via PowerShell.`);
        } catch {
          console.warn(`[WARNING] Could not terminate PID ${pid}: ${killErr.message}`);
        }
      }
    }

    console.log(`\n[SUCCESS] Port ${port} has been freed successfully.`);
    return true;
  } catch (err: any) {
    console.error(`[ERROR] Failed to inspect or free port ${port}:`, err.message);
    return false;
  }
}

function freePortUnix(port: number): boolean {
  try {
    let pidsRaw = '';
    try {
      pidsRaw = execSync(`lsof -ti :${port}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    } catch {
      // lsof exits with 1 if no process found
    }

    const pids = pidsRaw
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && /^\d+$/.test(p));

    if (pids.length === 0) {
      console.log(`[STATUS] Port ${port} is already free. No process is listening.`);
      return true;
    }

    for (const pid of pids) {
      console.log(`[ACTION] Terminating process PID ${pid} listening on port ${port}...`);
      try {
        execSync(`kill -9 ${pid}`);
        console.log(`[SUCCESS] Terminated PID ${pid}.`);
      } catch (err: any) {
        console.warn(`[WARNING] Could not terminate PID ${pid}: ${err.message}`);
      }
    }

    console.log(`\n[SUCCESS] Port ${port} has been freed successfully.`);
    return true;
  } catch (err: any) {
    console.error(`[ERROR] Failed to free port ${port}:`, err.message);
    return false;
  }
}

const success = isWindows ? freePortWindows(portToFree) : freePortUnix(portToFree);
console.log('================================================================\n');
process.exit(success ? 0 : 1);
