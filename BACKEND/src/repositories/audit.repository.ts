/**
 * Audit Repository
 * 
 * Interacts with the real audit_logs table in the configured database (PostgreSQL / MySQL).
 * NO dummy or seeded data.
 */

import { dbAdapter } from '../db/adapter';

export interface DbAuditLog {
  id: number;
  userId?: number | null;
  userEmail?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  search?: string;
  module?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

export class AuditRepository {
  public async findAll(filters: AuditLogFilters = {}): Promise<{ logs: DbAuditLog[]; total: number }> {
    const limit = Math.min(Math.max(Number(filters.limit) || 50, 1), 200);
    const offset = Math.max(Number(filters.offset) || 0, 0);

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (filters.module && filters.module !== 'all') {
      conditions.push(`(entity = $${paramIdx} OR module = $${paramIdx})`);
      params.push(filters.module);
      paramIdx++;
    }

    if (filters.action && filters.action !== 'all') {
      conditions.push(`action = $${paramIdx++}`);
      params.push(filters.action);
    }

    if (filters.search && filters.search.trim()) {
      const searchPattern = `%${filters.search.trim()}%`;
      conditions.push(`(action ILIKE $${paramIdx} OR entity ILIKE $${paramIdx} OR user_email ILIKE $${paramIdx} OR details ILIKE $${paramIdx})`);
      params.push(searchPattern);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query total count
    const countSql = `SELECT COUNT(*) as count FROM audit_logs ${whereClause};`;
    const countRes = await dbAdapter.query<{ count: string | number }>(countSql, params);
    const total = Number(countRes.rows[0]?.count || 0);

    // Query paginated rows
    const dataSql = `
      SELECT 
        id, 
        user_id AS "userId", 
        user_email AS "userEmail", 
        action, 
        entity AS "resource", 
        entity_id AS "resourceId", 
        details AS "metadata", 
        ip_address AS "ipAddress", 
        user_agent AS "userAgent", 
        timestamp AS "createdAt"
      FROM audit_logs
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;

    const dataParams = [...params, limit, offset];
    const dataRes = await dbAdapter.query<DbAuditLog>(dataSql, dataParams);

    return {
      logs: dataRes.rows,
      total,
    };
  }

  public async create(entry: {
    userId?: number | null;
    userEmail?: string | null;
    action: string;
    resource: string;
    resourceId?: string | null;
    metadata?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<DbAuditLog> {
    const metadataStr = entry.metadata
      ? (typeof entry.metadata === 'string' ? entry.metadata : JSON.stringify(entry.metadata))
      : null;

    const sql = `
      INSERT INTO audit_logs (
        user_id, user_email, user_role, action, module, entity, entity_id, details, ip_address, user_agent, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING 
        id, 
        user_id AS "userId", 
        user_email AS "userEmail", 
        action, 
        entity AS "resource", 
        entity_id AS "resourceId", 
        details AS "metadata", 
        ip_address AS "ipAddress", 
        user_agent AS "userAgent", 
        timestamp AS "createdAt";
    `;

    const params = [
      entry.userId ? String(entry.userId) : null,
      entry.userEmail || null,
      'ADMIN',
      entry.action,
      entry.resource || 'system',
      entry.resource,
      entry.resourceId || null,
      metadataStr,
      entry.ipAddress || null,
      entry.userAgent || null,
    ];

    const res = await dbAdapter.query<DbAuditLog>(sql, params);
    return res.rows[0];
  }
}

export const auditRepository = new AuditRepository();
