/**
 * Branch Repository
 * 
 * Production real database persistence for MediEra Clinic Branches & Branch Settings.
 * Strictly queries PostgreSQL / MySQL via dbAdapter. No mock data.
 */

import { dbAdapter } from '../db/adapter';
import crypto from 'crypto';

export interface DbBranch {
  id: string;
  organizationId: string;
  organizationName?: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  timezone: string;
  workingHours?: any;
  settings?: any;
  isMainBranch: boolean;
  status: 'Active' | 'Inactive';
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export class BranchRepository {
  private initialized = false;

  private async ensureColumns() {
    if (this.initialized) return;
    this.initialized = true;
    try {
      await dbAdapter.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS working_hours JSON;`);
      await dbAdapter.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';`);
      await dbAdapter.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS pincode VARCHAR(50);`);
      await dbAdapter.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'Asia/Kolkata';`);
      await dbAdapter.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS settings JSON;`);
      await dbAdapter.query(`ALTER TABLE branches ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';`);
    } catch (err: any) {
      console.warn('[BranchRepository.ensureColumns warning]', err?.message);
    }
  }

  public async findAll(params?: { organizationId?: string; search?: string; status?: string }): Promise<DbBranch[]> {
    await this.ensureColumns();
    let sql = `
      SELECT b.id, b.organization_id AS "organizationId", o.name AS "organizationName",
             b.name, b.code, b.email, b.phone, b.address, b.city, b.state,
             COALESCE(b.country, 'India') AS country, b.pincode,
             COALESCE(b.timezone, 'Asia/Kolkata') AS timezone,
             b.working_hours AS "workingHours", b.operating_hours AS "operatingHours",
             b.settings,
             COALESCE(b.is_main_branch, false) AS "isMainBranch",
             COALESCE(b.status, 'Active') AS status,
             b.created_at AS "createdAt",
             (SELECT COUNT(*) FROM user_branches ub WHERE ub.branch_id = b.id) AS "usersCount"
      FROM branches b
      LEFT JOIN organizations o ON b.organization_id = o.id
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (params?.organizationId && params.organizationId !== 'all') {
      queryParams.push(params.organizationId);
      sql += ` AND b.organization_id = $${queryParams.length}`;
    }

    if (params?.status && params.status !== 'All') {
      queryParams.push(params.status);
      sql += ` AND LOWER(b.status) = LOWER($${queryParams.length})`;
    }

    if (params?.search && params.search.trim()) {
      queryParams.push(`%${params.search.trim()}%`);
      sql += ` AND (b.name ILIKE $${queryParams.length} OR b.code ILIKE $${queryParams.length} OR b.city ILIKE $${queryParams.length} OR b.email ILIKE $${queryParams.length})`;
    }

    sql += ` ORDER BY b.is_main_branch DESC, b.name ASC;`;

    const res = await dbAdapter.query<DbBranch>(sql, queryParams);
    return res.rows.map(this.normalize);
  }

  public async findById(id: string): Promise<DbBranch | null> {
    await this.ensureColumns();
    const sql = `
      SELECT b.id, b.organization_id AS "organizationId", o.name AS "organizationName",
             b.name, b.code, b.email, b.phone, b.address, b.city, b.state,
             COALESCE(b.country, 'India') AS country, b.pincode,
             COALESCE(b.timezone, 'Asia/Kolkata') AS timezone,
             b.working_hours AS "workingHours", b.operating_hours AS "operatingHours",
             b.settings,
             COALESCE(b.is_main_branch, false) AS "isMainBranch",
             COALESCE(b.status, 'Active') AS status,
             b.created_at AS "createdAt",
             (SELECT COUNT(*) FROM user_branches ub WHERE ub.branch_id = b.id) AS "usersCount"
      FROM branches b
      LEFT JOIN organizations o ON b.organization_id = o.id
      WHERE b.id = $1
      LIMIT 1;
    `;
    const res = await dbAdapter.query<DbBranch>(sql, [id]);
    return res.rows[0] ? this.normalize(res.rows[0]) : null;
  }

  public async create(data: Partial<DbBranch>): Promise<DbBranch> {
    await this.ensureColumns();
    const id = data.id || `br-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const orgId = data.organizationId || 'org-mediera-01';
    const name = data.name || 'New Branch';
    const code = (data.code || name.replace(/[^A-Za-z0-9]/g, '').substring(0, 8).toUpperCase()) || 'BR-NEW';
    const email = data.email || '';
    const phone = data.phone || '';
    const address = data.address || '';
    const city = data.city || '';
    const state = data.state || '';
    const country = data.country || 'India';
    const pincode = data.pincode || '';
    const timezone = data.timezone || 'Asia/Kolkata';
    const workingHours = typeof data.workingHours === 'object' ? JSON.stringify(data.workingHours) : (data.workingHours || '{}');
    const settings = typeof data.settings === 'object' ? JSON.stringify(data.settings) : (data.settings || '{}');
    const isMainBranch = Boolean(data.isMainBranch);
    const status = data.status || 'Active';

    const sql = `
      INSERT INTO branches (
        id, organization_id, name, code, email, phone,
        address, city, state, country, pincode, timezone,
        working_hours, operating_hours, settings, is_main_branch, status, created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $13, $14, $15, $16, CURRENT_TIMESTAMP
      )
      RETURNING id;
    `;

    await dbAdapter.query(sql, [
      id, orgId, name, code, email, phone,
      address, city, state, country, pincode, timezone,
      workingHours, settings, isMainBranch, status
    ]);

    const created = await this.findById(id);
    if (!created) throw new Error('Failed to retrieve newly created branch.');
    return created;
  }

  public async update(id: string, data: Partial<DbBranch>): Promise<DbBranch> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Branch with ID ${id} not found.`);

    const fields: string[] = [];
    const values: any[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name',
      code: 'code',
      email: 'email',
      phone: 'phone',
      address: 'address',
      city: 'city',
      state: 'state',
      country: 'country',
      pincode: 'pincode',
      timezone: 'timezone',
      isMainBranch: 'is_main_branch',
      status: 'status',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if ((data as any)[key] !== undefined) {
        values.push((data as any)[key]);
        fields.push(`${col} = $${values.length}`);
      }
    }

    if (data.workingHours !== undefined) {
      const wh = typeof data.workingHours === 'object' ? JSON.stringify(data.workingHours) : data.workingHours;
      values.push(wh);
      fields.push(`working_hours = $${values.length}`);
      fields.push(`operating_hours = $${values.length}`);
    }

    if (data.settings !== undefined) {
      values.push(typeof data.settings === 'object' ? JSON.stringify(data.settings) : data.settings);
      fields.push(`settings = $${values.length}`);
    }

    if (fields.length === 0) return existing;

    values.push(id);
    const sql = `
      UPDATE branches
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
    `;

    await dbAdapter.query(sql, values);
    const updated = await this.findById(id);
    return updated || existing;
  }

  public async updateSettings(id: string, settings: any): Promise<DbBranch> {
    const serialized = typeof settings === 'object' ? JSON.stringify(settings) : settings;
    await dbAdapter.query(
      `UPDATE branches SET settings = $1 WHERE id = $2`,
      [serialized, id]
    );
    const updated = await this.findById(id);
    if (!updated) throw new Error(`Branch with ID ${id} not found.`);
    return updated;
  }

  public async setStatus(id: string, status: 'Active' | 'Inactive'): Promise<boolean> {
    const res = await dbAdapter.query(
      `UPDATE branches SET status = $1 WHERE id = $2`,
      [status, id]
    );
    return (res.rowCount || 0) > 0;
  }

  public async delete(id: string): Promise<boolean> {
    const res = await dbAdapter.query(`DELETE FROM branches WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  }

  private normalize(row: any): DbBranch {
    let parsedWorkingHours: any = {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openingTime: '08:00',
      closingTime: '20:00',
    };
    if (row.workingHours || row.operatingHours) {
      try {
        parsedWorkingHours = typeof row.workingHours === 'string' ? JSON.parse(row.workingHours) : (row.workingHours || row.operatingHours);
      } catch {
        parsedWorkingHours = {};
      }
    }

    let parsedSettings: any = {
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openingTime: '08:00',
      closingTime: '20:00',
      appointmentSlotDuration: 15,
      maxDailyTokens: 120,
      allowWalkIns: true,
      autoQueueTokens: true,
      autoBillingAlerts: true,
      lowStockThresholdAlerts: true,
      enableMedicalStorePOS: true,
    };
    if (row.settings) {
      try {
        const s = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
        parsedSettings = { ...parsedSettings, ...s };
      } catch {
        // retain defaults
      }
    }

    return {
      ...row,
      isMainBranch: Boolean(row.isMainBranch),
      usersCount: parseInt(String(row.usersCount || '0'), 10),
      workingHours: parsedWorkingHours,
      settings: parsedSettings,
    };
  }
}

export const branchRepository = new BranchRepository();
