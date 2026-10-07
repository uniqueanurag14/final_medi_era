/**
 * Clinical Entities Repositories
 * 
 * Provides real database access for:
 * - Staff & Employees
 * - Departments
 * - Consultations (Medical Records)
 * - Prescriptions
 * - Lab Orders & Results
 * - Clinics (Branches)
 * - Hospitals (Organizations)
 * - Notifications
 */

import { dbAdapter } from '../db/adapter';

export interface DbBranch {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface DbOrganization {
  id: string;
  name: string;
  code: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  active: boolean;
}

export interface DbDepartment {
  id: string;
  branchId?: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
}

export interface DbStaff {
  id: string;
  userId?: string;
  organizationId: string;
  branchId?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  departmentId?: string;
  active: boolean;
}

export interface DbConsultation {
  id: string;
  consultationNumber: string;
  organizationId: string;
  branchId: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  status: string;
  isDemo: boolean;
}

export interface DbPrescription {
  id: string;
  prescriptionNumber: string;
  consultationId?: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  advice?: string;
  status: string;
  isDemo: boolean;
}

export interface DbLabOrder {
  id: string;
  orderNumber: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: string;
  status: string;
  totalCost: number;
  isDemo: boolean;
}

export interface DbNotification {
  id: string;
  userId?: string;
  organizationId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export class ClinicalEntitiesRepository {
  // --- Branches (Clinics) ---
  public async getBranches(): Promise<DbBranch[]> {
    try {
      const sql = `SELECT id, organization_id AS "organizationId", name, code, address, city, phone, email, active FROM branches ORDER BY name ASC;`;
      const res = await dbAdapter.query<DbBranch>(sql);
      return res.rows;
    } catch {
      return [];
    }
  }

  // --- Organizations (Hospitals) ---
  public async getOrganizations(): Promise<DbOrganization[]> {
    try {
      const sql = `SELECT id, name, legal_name AS "legalName", email, phone, address FROM organizations ORDER BY name ASC;`;
      const res = await dbAdapter.query<DbOrganization>(sql);
      return res.rows;
    } catch {
      return [];
    }
  }

  // --- Departments ---
  public async getDepartments(): Promise<DbDepartment[]> {
    try {
      const sql = `SELECT id, name, code, description, active FROM departments ORDER BY name ASC;`;
      const res = await dbAdapter.query<DbDepartment>(sql);
      return res.rows;
    } catch {
      return [];
    }
  }

  public async getDepartmentById(id: string): Promise<DbDepartment | null> {
    try {
      const sql = `SELECT id, name, code, description, active FROM departments WHERE id = $1 LIMIT 1;`;
      const res = await dbAdapter.query<DbDepartment>(sql, [id]);
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }

  public async createDepartment(data: { name: string; code?: string; description?: string; active?: boolean }): Promise<DbDepartment> {
    const id = `dept-${Date.now()}`;
    const code = data.code || `DEPT-${Math.floor(100 + Math.random() * 900)}`;
    const active = data.active !== false;
    await dbAdapter.query(
      `INSERT INTO departments (id, name, code, description, active) VALUES ($1, $2, $3, $4, $5)`,
      [id, data.name, code, data.description || '', active]
    );
    return { id, name: data.name, code, description: data.description || '', active };
  }

  public async updateDepartment(id: string, updates: Partial<DbDepartment>): Promise<DbDepartment | null> {
    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (updates.name !== undefined) {
      sets.push(`name = $${idx++}`);
      params.push(updates.name);
    }
    if (updates.code !== undefined) {
      sets.push(`code = $${idx++}`);
      params.push(updates.code);
    }
    if (updates.description !== undefined) {
      sets.push(`description = $${idx++}`);
      params.push(updates.description);
    }
    if (updates.active !== undefined) {
      sets.push(`active = $${idx++}`);
      params.push(updates.active);
    }

    if (sets.length > 0) {
      params.push(id);
      await dbAdapter.query(`UPDATE departments SET ${sets.join(', ')} WHERE id = $${idx}`, params);
    }
    return this.getDepartmentById(id);
  }

  public async deleteDepartment(id: string): Promise<boolean> {
    const res = await dbAdapter.query(`DELETE FROM departments WHERE id = $1`, [id]);
    return (res.rowCount || 0) > 0;
  }

  // --- Staff & Employees ---
  public async getStaff(): Promise<DbStaff[]> {
    try {
      const sql = `
        SELECT id, first_name AS "firstName", last_name AS "lastName",
               email, phone, role, active
        FROM staff ORDER BY first_name ASC;
      `;
      const res = await dbAdapter.query<DbStaff>(sql);
      return res.rows;
    } catch {
      return [];
    }
  }

  // --- Consultations (Medical Records) ---
  public async getConsultations(): Promise<DbConsultation[]> {
    try {
      const sql = `
        SELECT id, consultation_number AS "consultationNumber", organization_id AS "organizationId",
               branch_id AS "branchId", appointment_id AS "appointmentId", patient_id AS "patientId",
               doctor_id AS "doctorId", date, chief_complaint AS "chiefComplaint", diagnosis, status
        FROM consultations ORDER BY date DESC;
      `;
      const res = await dbAdapter.query<DbConsultation>(sql);
      return res.rows;
    } catch {
      return [];
    }
  }

  // --- Prescriptions ---
  public async getPrescriptions(): Promise<DbPrescription[]> {
    try {
      const sql = `
        SELECT id, prescription_number AS "prescriptionNumber", consultation_id AS "consultationId",
               appointment_id AS "appointmentId", patient_id AS "patientId", doctor_id AS "doctorId",
               diagnosis, advice, status
        FROM prescriptions ORDER BY created_at DESC;
      `;
      const res = await dbAdapter.query<DbPrescription>(sql);
      return res.rows;
    } catch {
      return [];
    }
  }

  // --- Lab Orders ---
  public async getLabOrders(): Promise<DbLabOrder[]> {
    try {
      const sql = `
        SELECT id, order_number AS "orderNumber", organization_id AS "organizationId", branch_id AS "branchId",
               patient_id AS "patientId", doctor_id AS "doctorId", appointment_id AS "appointmentId",
               date, status, total_cost AS "totalCost"
        FROM lab_orders ORDER BY created_at DESC;
      `;
      const res = await dbAdapter.query<DbLabOrder>(sql);
      return res.rows;
    } catch {
      return [];
    }
  }

  // --- Notifications ---
  public async getNotifications(userId?: string): Promise<DbNotification[]> {
    try {
      const sql = userId
        ? `SELECT id, user_id AS "userId", organization_id AS "organizationId", title, message, type, is_read AS "isRead", created_at AS "createdAt" FROM notifications WHERE user_id = $1 ORDER BY created_at DESC;`
        : `SELECT id, user_id AS "userId", organization_id AS "organizationId", title, message, type, is_read AS "isRead", created_at AS "createdAt" FROM notifications ORDER BY created_at DESC LIMIT 50;`;
      const res = await dbAdapter.query<DbNotification>(sql, userId ? [userId] : []);
      return res.rows;
    } catch {
      return [];
    }
  }

  // --- Designations ---
  public async getDesignations(): Promise<any[]> {
    try {
      const { settingsRepository } = await import('./settings.repository');
      const all = await settingsRepository.getAllSettings();
      if (all['system_designations'] && Array.isArray(all['system_designations'])) {
        return all['system_designations'];
      }
    } catch {
      // fallback
    }
    return [
      { id: 'des-01', name: 'Chief Medical Officer', code: 'DES-CMO', department: 'Executive Management', active: true },
      { id: 'des-02', name: 'Senior Consultant Physician', code: 'DES-SCP', department: 'Internal Medicine', active: true },
      { id: 'des-03', name: 'Clinical Specialist', code: 'DES-CS', department: 'Cardiology', active: true },
      { id: 'des-04', name: 'Head Nurse / Matron', code: 'DES-HN', department: 'Emergency & Critical Care', active: true },
      { id: 'des-05', name: 'Registered Staff Nurse', code: 'DES-RN', department: 'Inpatient Care', active: true },
      { id: 'des-06', name: 'Lead Pharmacist', code: 'DES-LP', department: 'Pharmacy', active: true },
      { id: 'des-07', name: 'Laboratory Director', code: 'DES-LD', department: 'Pathology & Diagnostics', active: true },
      { id: 'des-08', name: 'Senior Front Desk Officer', code: 'DES-FDO', department: 'Front Desk & Reception', active: true },
      { id: 'des-09', name: 'Billing Executive', code: 'DES-BE', department: 'Finance & Accounts', active: true },
    ];
  }

  public async getDesignationById(id: string): Promise<any | null> {
    const list = await this.getDesignations();
    return list.find((d: any) => d.id === id) || null;
  }

  public async createDesignation(data: any): Promise<any> {
    const list = await this.getDesignations();
    const newDes = {
      id: `des-${Date.now()}`,
      name: data.name,
      code: data.code || `DES-${Math.floor(100 + Math.random() * 900)}`,
      department: data.department || 'General Practice',
      description: data.description || '',
      active: data.active !== false,
    };
    const updated = [newDes, ...list];
    const { settingsRepository } = await import('./settings.repository');
    await settingsRepository.setSetting('system', 'system_designations', updated);
    return newDes;
  }

  public async updateDesignation(id: string, updates: any): Promise<any | null> {
    const list = await this.getDesignations();
    const idx = list.findIndex((d: any) => d.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    const { settingsRepository } = await import('./settings.repository');
    await settingsRepository.setSetting('system', 'system_designations', list);
    return list[idx];
  }

  public async deleteDesignation(id: string): Promise<boolean> {
    const list = await this.getDesignations();
    const filtered = list.filter((d: any) => d.id !== id);
    const { settingsRepository } = await import('./settings.repository');
    await settingsRepository.setSetting('system', 'system_designations', filtered);
    return true;
  }

  // --- User Archetypes ---
  public async getUserArchetypes(): Promise<any[]> {
    try {
      const { settingsRepository } = await import('./settings.repository');
      const all = await settingsRepository.getAllSettings();
      if (all['system_archetypes'] && Array.isArray(all['system_archetypes'])) {
        return all['system_archetypes'];
      }
    } catch {
      // fallback
    }
    return [
      { id: 'arch-01', name: 'Doctor', code: 'ARCH-DOC', category: 'Clinical', description: 'Licensed medical practitioner responsible for diagnoses, consultations, and prescriptions.', isSystem: true, active: true },
      { id: 'arch-02', name: 'Nurse', code: 'ARCH-NRS', category: 'Clinical', description: 'Clinical nursing practitioner performing patient triage, vitals recording, and care support.', isSystem: true, active: true },
      { id: 'arch-03', name: 'Receptionist', code: 'ARCH-RCP', category: 'Administrative', description: 'Front-desk personnel handling patient registration, scheduling, and live room queues.', isSystem: true, active: true },
      { id: 'arch-04', name: 'Pharmacist', code: 'ARCH-PHR', category: 'Clinical', description: 'Medical pharmacy officer responsible for formulary, dispensing, and stock ledgers.', isSystem: true, active: true },
      { id: 'arch-05', name: 'Lab Technician', code: 'ARCH-LAB', category: 'Clinical', description: 'Diagnostic pathology personnel running tests and uploading lab reports.', isSystem: true, active: true },
      { id: 'arch-06', name: 'Accountant', code: 'ARCH-ACC', category: 'Administrative', description: 'Financial officer managing payments, invoice reconciliation, and revenue analytics.', isSystem: true, active: true },
      { id: 'arch-07', name: 'Clinic Administrator', code: 'ARCH-ADM', category: 'Administrative', description: 'Branch-level operational manager overseeing clinical and administrative workflows.', isSystem: true, active: true },
      { id: 'arch-08', name: 'Executive Super Admin', code: 'ARCH-SAD', category: 'Administrative', description: 'Full system governance authority across all branches, organizations, and security policies.', isSystem: true, active: true },
    ];
  }

  public async getUserArchetypeById(id: string): Promise<any | null> {
    const list = await this.getUserArchetypes();
    return list.find((a: any) => a.id === id) || null;
  }

  public async createUserArchetype(data: any): Promise<any> {
    const list = await this.getUserArchetypes();
    const newArch = {
      id: `arch-${Date.now()}`,
      name: data.name,
      code: data.code || `ARCH-${Math.floor(100 + Math.random() * 900)}`,
      category: data.category || 'Clinical',
      description: data.description || '',
      isSystem: false,
      active: data.active !== false,
    };
    const updated = [newArch, ...list];
    const { settingsRepository } = await import('./settings.repository');
    await settingsRepository.setSetting('system', 'system_archetypes', updated);
    return newArch;
  }

  public async updateUserArchetype(id: string, updates: any): Promise<any | null> {
    const list = await this.getUserArchetypes();
    const idx = list.findIndex((a: any) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    const { settingsRepository } = await import('./settings.repository');
    await settingsRepository.setSetting('system', 'system_archetypes', list);
    return list[idx];
  }

  public async deleteUserArchetype(id: string): Promise<boolean> {
    const list = await this.getUserArchetypes();
    const filtered = list.filter((a: any) => a.id !== id);
    const { settingsRepository } = await import('./settings.repository');
    await settingsRepository.setSetting('system', 'system_archetypes', filtered);
    return true;
  }
}

export const clinicalEntitiesRepository = new ClinicalEntitiesRepository();
