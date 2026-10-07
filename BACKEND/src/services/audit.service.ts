/**
 * Audit Service
 * 
 * Handles business logic and queries for audit logs.
 */

import { auditRepository, AuditLogFilters, DbAuditLog } from '../repositories/audit.repository';

export class AuditService {
  public async getAuditLogs(filters: AuditLogFilters): Promise<{ logs: DbAuditLog[]; total: number }> {
    return auditRepository.findAll(filters);
  }

  public async logAction(entry: {
    userId?: number | null;
    userEmail?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    metadata?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<DbAuditLog> {
    return auditRepository.create(entry);
  }

  public async log(entry: {
    userId?: number | null;
    userEmail?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    metadata?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<DbAuditLog> {
    return this.logAction(entry);
  }
}

export const auditService = new AuditService();
