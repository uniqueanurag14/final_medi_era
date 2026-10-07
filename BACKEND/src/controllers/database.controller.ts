/**
 * Database & Health Diagnostics Controller
 */

import { Request, Response } from 'express';
import { dbAdapter } from '../db/adapter';
import { MigrationEngine } from '../../../DATABASE/engine/migration-engine';
import { getSmtpStatus } from '../services/smtp-status.service';

export class DatabaseController {
  public async getStatus(req: Request, res: Response) {
    const isHealthy = dbAdapter.isHealthy();
    const config = dbAdapter.getConfig();
    const engine = dbAdapter.getEngine();
    const lastError = dbAdapter.getLastError();

    return res.json({
      success: true,
      data: {
        engine,
        connected: isHealthy,
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        ssl: config.ssl,
        lastError,
      },
    });
  }

  public async testConnection(req: Request, res: Response) {
    const result = await dbAdapter.testConnection();
    return res.json({
      success: result.connected,
      data: result,
    });
  }

  public async getHealth(req: Request, res: Response) {
    let migrationsStatus = 'unknown';
    let dbConnected = dbAdapter.isHealthy();

    try {
      const migrationEngine = new MigrationEngine();
      const status = await migrationEngine.getStatus();
      migrationsStatus = status.pending === 0 ? 'up-to-date' : `pending:${status.pending}`;
      if (status.health.connected) {
        dbConnected = true;
      }
      await migrationEngine.close().catch(() => {});
    } catch {
      // Keep dbConnected as is
    }

    let smtpStatusStr = 'not-configured';
    try {
      const smtp = await getSmtpStatus();
      smtpStatusStr = smtp.status.toLowerCase().replace(/\s+/g, '-');
    } catch {
      smtpStatusStr = 'not-configured';
    }

    return res.json({
      status: 'ok',
      server: 'up',
      database: dbConnected ? 'connected' : 'disconnected',
      migrations: migrationsStatus,
      smtp: smtpStatusStr,
      engine: dbAdapter.getEngine(),
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }
}

export const databaseController = new DatabaseController();
