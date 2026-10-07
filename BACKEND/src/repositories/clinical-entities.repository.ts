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
}

export const clinicalEntitiesRepository = new ClinicalEntitiesRepository();
