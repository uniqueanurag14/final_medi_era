/**
 * Audit Controller
 * 
 * REST API handlers for audit log queries and logging.
 */

import { Request, Response } from 'express';
import { auditService } from '../services/audit.service';

export class AuditController {
  public async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { search, module, action, limit, offset } = req.query;

      const result = await auditService.getAuditLogs({
        search: typeof search === 'string' ? search : undefined,
        module: typeof module === 'string' ? module : undefined,
        action: typeof action === 'string' ? action : undefined,
        limit: limit ? parseInt(limit as string, 10) : 50,
        offset: offset ? parseInt(offset as string, 10) : 0,
      });

      res.status(200).json({
        success: true,
        total: result.total,
        count: result.logs.length,
        data: result.logs,
      });
    } catch (err: any) {
      console.error('[AuditController] Error fetching audit logs:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to fetch audit logs from database',
      });
    }
  }

  public async createAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const { action, resource, resourceId, metadata } = req.body;

      if (!action || !resource) {
        res.status(400).json({
          success: false,
          error: 'Fields "action" and "resource" are required.',
        });
        return;
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;
      const userAgent = (req.headers['user-agent'] as string) || null;
      const user = (req as any).user;

      const newLog = await auditService.logAction({
        userId: user?.id || null,
        userEmail: user?.email || req.body.userEmail || 'system',
        action,
        resource,
        resourceId,
        metadata,
        ipAddress,
        userAgent,
      });

      res.status(201).json({
        success: true,
        data: newLog,
      });
    } catch (err: any) {
      console.error('[AuditController] Error logging audit event:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to record audit event in database',
      });
    }
  }
}

export const auditController = new AuditController();
