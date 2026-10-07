/**
 * Organization Repository
 * 
 * Production real database persistence for MediEra Healthcare Organizations.
 * Strictly queries PostgreSQL / MySQL via dbAdapter. No mock data.
 */

import { dbAdapter } from '../db/adapter';
import crypto from 'crypto';

export interface DbOrganization {
  id: string;
  name: string;
  legalName?: string;
  registrationNumber?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logoUrl?: string;
  website?: string;
  taxId?: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  status: 'Active' | 'Inactive';
  settings?: any;
  branchesCount?: number;
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export class OrganizationRepository {
  public async findAll(params?: { search?: string; status?: string }): Promise<DbOrganization[]> {
    let sql = `
      SELECT o.id, o.name, o.legal_name AS "legalName", o.registration_number AS "registrationNumber",
             o.email, o.phone, o.address, o.city, o.state, o.country, o.pincode,
             o.logo_url AS "logoUrl", o.website, o.tax_id AS "taxId",
             COALESCE(o.timezone, 'Asia/Kolkata') AS timezone,
             COALESCE(o.currency, 'INR') AS currency,
             COALESCE(o.date_format, 'DD-MM-YYYY') AS "dateFormat",
             COALESCE(o.status, 'Active') AS status,
             o.settings,
             o.created_at AS "createdAt", o.updated_at AS "updatedAt",
             (SELECT COUNT(*) FROM branches b WHERE b.organization_id = o.id) AS "branchesCount",
             (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id) AS "usersCount"
      FROM organizations o
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (params?.status && params.status !== 'All') {
      queryParams.push(params.status);
      sql += ` AND LOWER(o.status) = LOWER($${queryParams.length})`;
    }

    if (params?.search && params.search.trim()) {
      queryParams.push(`%${params.search.trim()}%`);
      sql += ` AND (o.name ILIKE $${queryParams.length} OR o.email ILIKE $${queryParams.length} OR o.city ILIKE $${queryParams.length} OR o.registration_number ILIKE $${queryParams.length})`;
    }

    sql += ` ORDER BY o.created_at DESC;`;

    const res = await dbAdapter.query<DbOrganization>(sql, queryParams);
    return res.rows.map(this.normalize);
  }

  public async findById(id: string): Promise<DbOrganization | null> {
    const sql = `
      SELECT o.id, o.name, o.legal_name AS "legalName", o.registration_number AS "registrationNumber",
             o.email, o.phone, o.address, o.city, o.state, o.country, o.pincode,
             o.logo_url AS "logoUrl", o.website, o.tax_id AS "taxId",
             COALESCE(o.timezone, 'Asia/Kolkata') AS timezone,
             COALESCE(o.currency, 'INR') AS currency,
             COALESCE(o.date_format, 'DD-MM-YYYY') AS "dateFormat",
             COALESCE(o.status, 'Active') AS status,
             o.settings,
             o.created_at AS "createdAt", o.updated_at AS "updatedAt",
             (SELECT COUNT(*) FROM branches b WHERE b.organization_id = o.id) AS "branchesCount",
             (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id) AS "usersCount"
      FROM organizations o
      WHERE o.id = $1
      LIMIT 1;
    `;
    const res = await dbAdapter.query<DbOrganization>(sql, [id]);
    return res.rows[0] ? this.normalize(res.rows[0]) : null;
  }

  public async create(data: Partial<DbOrganization>): Promise<DbOrganization> {
    const id = data.id || `org-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const name = data.name || 'New Organization';
    const legalName = data.legalName || data.name || '';
    const regNo = data.registrationNumber || '';
    const email = data.email || 'contact@mediera.health';
    const phone = data.phone || '+91 9876543210';
    const address = data.address || '';
    const city = data.city || '';
    const state = data.state || '';
    const country = data.country || 'India';
    const pincode = data.pincode || '';
    const logoUrl = data.logoUrl || null;
    const website = data.website || null;
    const taxId = data.taxId || null;
    const timezone = data.timezone || 'Asia/Kolkata';
    const currency = data.currency || 'INR';
    const dateFormat = data.dateFormat || 'DD-MM-YYYY';
    const status = data.status || 'Active';
    const settings = typeof data.settings === 'object' ? JSON.stringify(data.settings) : data.settings || '{}';

    const sql = `
      INSERT INTO organizations (
        id, name, legal_name, registration_number, email, phone,
        address, city, state, country, pincode, logo_url, website, tax_id,
        timezone, currency, date_format, status, settings, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING id;
    `;

    await dbAdapter.query(sql, [
      id, name, legalName, regNo, email, phone,
      address, city, state, country, pincode, logoUrl, website, taxId,
      timezone, currency, dateFormat, status, settings,
    ]);

    const created = await this.findById(id);
    if (!created) throw new Error('Failed to retrieve newly created organization.');
    return created;
  }

  public async update(id: string, data: Partial<DbOrganization>): Promise<DbOrganization> {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Organization with ID ${id} not found.`);

    const fields: string[] = [];
    const values: any[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name',
      legalName: 'legal_name',
      registrationNumber: 'registration_number',
      email: 'email',
      phone: 'phone',
      address: 'address',
      city: 'city',
      state: 'state',
      country: 'country',
      pincode: 'pincode',
      logoUrl: 'logo_url',
      website: 'website',
      taxId: 'tax_id',
      timezone: 'timezone',
      currency: 'currency',
      dateFormat: 'date_format',
      status: 'status',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if ((data as any)[key] !== undefined) {
        values.push((data as any)[key]);
        fields.push(`${col} = $${values.length}`);
      }
    }

    if (data.settings !== undefined) {
      values.push(typeof data.settings === 'object' ? JSON.stringify(data.settings) : data.settings);
      fields.push(`settings = $${values.length}`);
    }

    if (fields.length === 0) return existing;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE organizations
      SET ${fields.join(', ')}
      WHERE id = $${values.length}
    `;

    await dbAdapter.query(sql, values);
    const updated = await this.findById(id);
    return updated || existing;
  }

  public async setStatus(id: string, status: 'Active' | 'Inactive'): Promise<boolean> {
    const res = await dbAdapter.query(
      `UPDATE organizations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, id]
    );
    return (res.rowCount || 0) > 0;
  }

  public async delete(id: string): Promise<boolean> {
    const res = await dbAdapter.query(`DELETE FROM organizations WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  }

  private normalize(row: any): DbOrganization {
    let parsedSettings = {};
    if (row.settings) {
      try {
        parsedSettings = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
      } catch {
        parsedSettings = {};
      }
    }
    return {
      ...row,
      branchesCount: parseInt(String(row.branchesCount || '0'), 10),
      usersCount: parseInt(String(row.usersCount || '0'), 10),
      settings: parsedSettings,
    };
  }
}

export const organizationRepository = new OrganizationRepository();
