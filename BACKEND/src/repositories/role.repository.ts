/**
 * Role & Permission Repository
 * 
 * Production real database persistence for MediEra RBAC Roles and Granular Permissions.
 * Strictly queries PostgreSQL / MySQL via dbAdapter. No mock data.
 */

import { dbAdapter } from '../db/adapter';
import crypto from 'crypto';

export interface DbPermission {
  id: string;
  code: string;
  module: string;
  action: string;
  description?: string;
  createdAt?: string;
}

export interface DbRole {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  organizationId?: string;
  isSystem: boolean;
  status: 'Active' | 'Inactive';
  usersCount?: number;
  permissionsCount?: number;
  createdAt: string;
}

export interface DbRoleWithPermissions extends DbRole {
  permissions: string[]; // List of permission codes e.g. ['patient.view', 'patient.create']
}

export class RoleRepository {
  public async findAll(params?: { organizationId?: string }): Promise<DbRoleWithPermissions[]> {
    let sql = `
      SELECT r.id, r.name,
             COALESCE(r.display_name, r.name) AS "displayName",
             r.description, r.organization_id AS "organizationId",
             COALESCE(r.is_system, false) AS "isSystem",
             COALESCE(r.status, 'Active') AS status,
             r.created_at AS "createdAt",
             (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS "usersCount",
             (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) AS "permissionsCount"
      FROM roles r
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (params?.organizationId && params.organizationId !== 'all') {
      queryParams.push(params.organizationId);
      sql += ` AND (r.organization_id = $${queryParams.length} OR r.organization_id IS NULL OR r.is_system = true)`;
    }

    sql += ` ORDER BY r.is_system DESC, r.name ASC;`;

    const res = await dbAdapter.query<DbRole>(sql, queryParams);
    const roles = res.rows;

    // Fetch all role permission mappings in one efficient query
    const permSql = `
      SELECT rp.role_id AS "roleId", p.code AS "permCode"
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
    `;
    const permRes = await dbAdapter.query<{ roleId: string; permCode: string }>(permSql);
    const permMap = new Map<string, string[]>();
    for (const row of permRes.rows) {
      const arr = permMap.get(row.roleId) || [];
      arr.push(row.permCode);
      permMap.set(row.roleId, arr);
    }

    return roles.map((r) => ({
      ...r,
      isSystem: Boolean(r.isSystem),
      usersCount: parseInt(String(r.usersCount || '0'), 10),
      permissionsCount: (permMap.get(r.id) || []).length,
      permissions: permMap.get(r.id) || [],
    }));
  }

  public async findById(id: string): Promise<DbRoleWithPermissions | null> {
    const sql = `
      SELECT r.id, r.name,
             COALESCE(r.display_name, r.name) AS "displayName",
             r.description, r.organization_id AS "organizationId",
             COALESCE(r.is_system, false) AS "isSystem",
             COALESCE(r.status, 'Active') AS status,
             r.created_at AS "createdAt",
             (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id) AS "usersCount"
      FROM roles r
      WHERE r.id = $1
      LIMIT 1;
    `;
    const res = await dbAdapter.query<DbRole>(sql, [id]);
    if (res.rows.length === 0) return null;

    const role = res.rows[0];
    const permCodes = await this.getPermissionsForRole(id);

    return {
      ...role,
      isSystem: Boolean(role.isSystem),
      usersCount: parseInt(String(role.usersCount || '0'), 10),
      permissionsCount: permCodes.length,
      permissions: permCodes,
    };
  }

  public async create(data: {
    name: string;
    displayName?: string;
    description?: string;
    organizationId?: string;
    isSystem?: boolean;
    permissions?: string[];
  }): Promise<DbRoleWithPermissions> {
    const id = `role-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const name = data.name.toUpperCase().replace(/\s+/g, '_');
    const displayName = data.displayName || data.name;
    const description = data.description || '';
    const organizationId = data.organizationId || null;
    const isSystem = Boolean(data.isSystem);

    const sql = `
      INSERT INTO roles (id, name, display_name, description, organization_id, is_system, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'Active', CURRENT_TIMESTAMP)
      RETURNING id;
    `;
    await dbAdapter.query(sql, [id, name, displayName, description, organizationId, isSystem]);

    if (data.permissions && data.permissions.length > 0) {
      await this.setRolePermissions(id, data.permissions);
    }

    const created = await this.findById(id);
    if (!created) throw new Error('Failed to retrieve newly created role.');
    return created;
  }

  public async update(id: string, data: {
    name?: string;
    displayName?: string;
    description?: string;
    status?: 'Active' | 'Inactive';
    permissions?: string[];
  }): Promise<DbRoleWithPermissions> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Role with ID ${id} not found.`);

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      values.push(data.name.toUpperCase().replace(/\s+/g, '_'));
      fields.push(`name = $${values.length}`);
    }
    if (data.displayName !== undefined) {
      values.push(data.displayName);
      fields.push(`display_name = $${values.length}`);
    }
    if (data.description !== undefined) {
      values.push(data.description);
      fields.push(`description = $${values.length}`);
    }
    if (data.status !== undefined) {
      values.push(data.status);
      fields.push(`status = $${values.length}`);
    }

    if (fields.length > 0) {
      values.push(id);
      const sql = `UPDATE roles SET ${fields.join(', ')} WHERE id = $${values.length}`;
      await dbAdapter.query(sql, values);
    }

    if (data.permissions !== undefined) {
      await this.setRolePermissions(id, data.permissions);
    }

    const updated = await this.findById(id);
    return updated || existing;
  }

  public async setStatus(id: string, status: 'Active' | 'Inactive'): Promise<boolean> {
    const res = await dbAdapter.query(`UPDATE roles SET status = $1 WHERE id = $2`, [status, id]);
    return (res.rowCount || 0) > 0;
  }

  public async delete(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;
    if (existing.isSystem) {
      throw new Error('System roles are essential and cannot be deleted.');
    }
    const res = await dbAdapter.query(`DELETE FROM roles WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  }

  public async getAllPermissions(): Promise<DbPermission[]> {
    const sql = `
      SELECT id, code, module, action, description, created_at AS "createdAt"
      FROM permissions
      ORDER BY module ASC, code ASC;
    `;
    const res = await dbAdapter.query<DbPermission>(sql);
    return res.rows;
  }

  public async getPermissionsForRole(roleId: string): Promise<string[]> {
    const sql = `
      SELECT p.code
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = $1
    `;
    const res = await dbAdapter.query<{ code: string }>(sql, [roleId]);
    return res.rows.map((r) => r.code);
  }

  public async setRolePermissions(roleId: string, permissionCodes: string[]): Promise<void> {
    // Delete existing mappings
    await dbAdapter.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);

    if (!permissionCodes || permissionCodes.length === 0) return;

    // Resolve permission IDs for codes
    const placeholders = permissionCodes.map((_, i) => `$${i + 1}`).join(', ');
    const permRes = await dbAdapter.query<{ id: string }>(
      `SELECT id FROM permissions WHERE code IN (${placeholders})`,
      permissionCodes
    );

    for (const p of permRes.rows) {
      await dbAdapter.query(
        `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [roleId, p.id]
      );
    }
  }
}

export const roleRepository = new RoleRepository();
