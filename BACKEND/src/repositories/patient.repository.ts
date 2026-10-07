/**
 * Patient Repository
 * 
 * Handles real patient database operations against the configured database.
 */

import { dbAdapter } from '../db/adapter';

export interface DbPatient {
  id: string;
  patientId: string;
  organizationId: string;
  branchId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  status?: string;
  createdAt?: string;
}

export class PatientRepository {
  public async findAll(): Promise<DbPatient[]> {
    const sql = `
      SELECT id, patient_id AS "patientId", organization_id AS "organizationId",
             branch_id AS "branchId", first_name AS "firstName", last_name AS "lastName",
             phone, email, date_of_birth AS "dateOfBirth", gender, blood_group AS "bloodGroup",
             address, city, status, created_at AS "createdAt"
      FROM patients ORDER BY created_at DESC;
    `;

    const res = await dbAdapter.query<DbPatient>(sql);
    return res.rows;
  }

  public async findById(id: string): Promise<DbPatient | null> {
    const sql = `
      SELECT id, patient_id AS "patientId", organization_id AS "organizationId",
             branch_id AS "branchId", first_name AS "firstName", last_name AS "lastName",
             phone, email, date_of_birth AS "dateOfBirth", gender, blood_group AS "bloodGroup",
             address, city, status, created_at AS "createdAt"
      FROM patients WHERE id = $1 LIMIT 1;
    `;
    const res = await dbAdapter.query<DbPatient>(sql, [id]);
    return res.rows[0] || null;
  }

  public async findByContact(contact: string): Promise<DbPatient | null> {
    const clean = contact.trim().toLowerCase();
    const sql = `
      SELECT id, patient_id AS "patientId", organization_id AS "organizationId",
             branch_id AS "branchId", first_name AS "firstName", last_name AS "lastName",
             phone, email, date_of_birth AS "dateOfBirth", gender, blood_group AS "bloodGroup",
             address, city, status, created_at AS "createdAt"
      FROM patients
      WHERE LOWER(email) = $1 OR phone = $1 OR LOWER(patient_id) = $1 OR id = $1
      LIMIT 1;
    `;
    const res = await dbAdapter.query<DbPatient>(sql, [clean]);
    return res.rows[0] || null;
  }

  public async create(patient: DbPatient): Promise<DbPatient> {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Resolve Organization ID with DB FK safety
    const orgCheck = patient.organizationId
      ? await dbAdapter.query<{ id: string }>('SELECT id FROM organizations WHERE id = $1 LIMIT 1;', [patient.organizationId]).catch(() => ({ rows: [] }))
      : { rows: [] };
    let orgId = orgCheck.rows[0]?.id;
    if (!orgId) {
      const firstOrg = await dbAdapter.query<{ id: string }>('SELECT id FROM organizations LIMIT 1;').catch(() => ({ rows: [] }));
      orgId = firstOrg.rows[0]?.id;
    }
    if (!orgId) {
      await dbAdapter.query(`
        INSERT INTO organizations (id, name, email, phone) 
        VALUES ('org-01', 'MediEra Healthcare', 'contact@mediera.com', '+15551234567') 
        ON CONFLICT (id) DO NOTHING;
      `).catch(() => {});
      orgId = 'org-01';
    }

    // 2. Resolve Branch ID with DB FK safety
    const branchCheck = patient.branchId
      ? await dbAdapter.query<{ id: string }>('SELECT id FROM branches WHERE id = $1 LIMIT 1;', [patient.branchId]).catch(() => ({ rows: [] }))
      : { rows: [] };
    let branchId = branchCheck.rows[0]?.id;
    if (!branchId) {
      const firstBranch = await dbAdapter.query<{ id: string }>('SELECT id FROM branches WHERE organization_id = $1 LIMIT 1;', [orgId]).catch(() => ({ rows: [] }));
      branchId = firstBranch.rows[0]?.id;
    }
    if (!branchId) {
      await dbAdapter.query(`
        INSERT INTO branches (id, organization_id, name, code, address, city, state, zip_code, phone, email) 
        VALUES ('branch-01', $1, 'MediEra Main Clinic', 'BR-01', 'Mumbai', 'Mumbai', 'Maharashtra', '400001', '+15551234567', 'branch@mediera.com') 
        ON CONFLICT (id) DO NOTHING;
      `, [orgId]).catch(() => {});
      branchId = 'branch-01';
    }

    const sql = `
      INSERT INTO patients (
        id, patient_id, organization_id, branch_id, first_name, last_name,
        phone, email, date_of_birth, gender, blood_group, address, city, state, zip_code, registered_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);
    `;
    await dbAdapter.query(sql, [
      patient.id,
      patient.patientId,
      orgId,
      branchId,
      patient.firstName,
      patient.lastName,
      patient.phone,
      patient.email || '',
      patient.dateOfBirth || '1990-01-01',
      patient.gender || 'Other',
      patient.bloodGroup || 'O+',
      patient.address || 'Standard Address',
      patient.city || 'Mumbai',
      'Maharashtra',
      '400001',
      today,
      patient.status || 'Active',
    ]);
    return patient;
  }

  public async update(id: string, updates: Partial<DbPatient>): Promise<DbPatient | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const merged = { ...existing, ...updates };
    const sql = `
      UPDATE patients
      SET first_name = $1, last_name = $2, phone = $3, email = $4,
          date_of_birth = $5, gender = $6, blood_group = $7, address = $8, city = $9
      WHERE id = $10 OR patient_id = $10;
    `;
    await dbAdapter.query(sql, [
      merged.firstName,
      merged.lastName,
      merged.phone,
      merged.email || '',
      merged.dateOfBirth || '1990-01-01',
      merged.gender || 'Other',
      merged.bloodGroup || 'O+',
      merged.address || '',
      merged.city || 'Mumbai',
      id,
    ]);
    return this.findById(id);
  }
}

export const patientRepository = new PatientRepository();
