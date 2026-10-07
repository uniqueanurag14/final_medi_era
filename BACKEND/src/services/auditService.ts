import { db, schema } from '../../../DATABASE/engine/index.ts';
import { desc, eq, and, sql } from 'drizzle-orm';

export interface CreateAuditLogParams {
  userId?: number;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  async log(params: CreateAuditLogParams): Promise<void> {
    try {
      await db.insert(schema.auditLogs).values({
        userId: params.userId || null,
        userEmail: params.userEmail || null,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  },

  async getLogs(query: {
    action?: string;
    resource?: string;
    userEmail?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.action) {
      conditions.push(eq(schema.auditLogs.action, query.action));
    }
    if (query.resource) {
      conditions.push(eq(schema.auditLogs.resource, query.resource));
    }
    if (query.userEmail) {
      conditions.push(eq(schema.auditLogs.userEmail, query.userEmail));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.auditLogs)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    const logs = await db
      .select()
      .from(schema.auditLogs)
      .where(whereClause)
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: logs.map((l) => ({
        id: l.id,
        userId: l.userId,
        userEmail: l.userEmail,
        action: l.action,
        resource: l.resource,
        resourceId: l.resourceId,
        metadata: l.metadata ? JSON.parse(l.metadata) : null,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        createdAt: l.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },
};
