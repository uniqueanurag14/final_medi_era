/**
 * Doctor & Invoice Repositories
 * 
 * Handles real doctor and invoice database operations against configured database.
 */

import { dbAdapter } from '../db/adapter';

export interface DbDoctor {
  id: string;
  organizationId?: string;
  specialtyId?: string;
  specialtyName?: string;
  name: string;
  title?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  roomNumber?: string;
  bio?: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  active?: boolean;
}

export class DoctorRepository {
  public async findAll(): Promise<DbDoctor[]> {
    const sql = `
      SELECT d.id, d.organization_id AS "organizationId", d.specialty_id AS "specialtyId",
             COALESCE(s.name, 'General Medicine') AS "specialtyName", d.name, d.title, d.qualification,
             d.experience_years AS "experienceYears", d.consultation_fee AS "consultationFee",
             d.room_number AS "roomNumber", d.bio, d.avatar, d.rating, d.review_count AS "reviewCount",
             d.active
      FROM doctors d
      LEFT JOIN specialties s ON d.specialty_id = s.id
      ORDER BY d.name ASC;
    `;
    const res = await dbAdapter.query<DbDoctor>(sql);
    return res.rows;
  }
}

export interface DbInvoice {
  id: string;
  invoiceNumber: string;
  organizationId?: string;
  branchId?: string;
  patientId: string;
  appointmentId?: string;
  date?: string;
  dueDate?: string;
  subtotal?: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  paymentMethod?: string;
  createdAt?: string;
}

export class InvoiceRepository {
  public async findAll(): Promise<DbInvoice[]> {
    const sql = `
      SELECT id, invoice_number AS "invoiceNumber", organization_id AS "organizationId",
             branch_id AS "branchId", patient_id AS "patientId", appointment_id AS "appointmentId",
             date, due_date AS "dueDate", subtotal, total_amount AS "totalAmount", paid_amount AS "paidAmount",
             balance_amount AS "balanceAmount", status, payment_method AS "paymentMethod",
             created_at AS "createdAt"
      FROM invoices ORDER BY created_at DESC;
    `;
    const res = await dbAdapter.query<DbInvoice>(sql);
    return res.rows;
  }

  public async create(inv: DbInvoice): Promise<DbInvoice> {
    const todayStr = inv.date || new Date().toISOString().split('T')[0];
    const dueDateStr = inv.dueDate || todayStr;
    const subtotal = inv.subtotal !== undefined ? inv.subtotal : inv.totalAmount;
    const orgId = inv.organizationId || 'org-01';
    const branchId = inv.branchId || 'branch-01';

    const sql = `
      INSERT INTO invoices (
        id, invoice_number, organization_id, branch_id, patient_id,
        appointment_id, date, due_date, subtotal, total_amount, paid_amount, balance_amount, status, payment_method
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
    `;
    await dbAdapter.query(sql, [
      inv.id,
      inv.invoiceNumber,
      orgId,
      branchId,
      inv.patientId,
      inv.appointmentId || null,
      todayStr,
      dueDateStr,
      subtotal,
      inv.totalAmount,
      inv.paidAmount,
      inv.balanceAmount,
      inv.status || 'Issued',
      inv.paymentMethod || 'Cash',
    ]);
    return inv;
  }

  public async findById(id: string): Promise<DbInvoice | null> {
    const sql = `
      SELECT id, invoice_number AS "invoiceNumber", organization_id AS "organizationId",
             branch_id AS "branchId", patient_id AS "patientId", appointment_id AS "appointmentId",
             date, due_date AS "dueDate", subtotal, total_amount AS "totalAmount", paid_amount AS "paidAmount",
             balance_amount AS "balanceAmount", status, payment_method AS "paymentMethod",
             created_at AS "createdAt"
      FROM invoices WHERE id = $1 OR invoice_number = $1 LIMIT 1;
    `;
    const res = await dbAdapter.query<DbInvoice>(sql, [id]);
    return res.rows[0] || null;
  }

  public async findByPatientId(patientId: string): Promise<DbInvoice[]> {
    const sql = `
      SELECT id, invoice_number AS "invoiceNumber", organization_id AS "organizationId",
             branch_id AS "branchId", patient_id AS "patientId", appointment_id AS "appointmentId",
             date, due_date AS "dueDate", subtotal, total_amount AS "totalAmount", paid_amount AS "paidAmount",
             balance_amount AS "balanceAmount", status, payment_method AS "paymentMethod",
             created_at AS "createdAt"
      FROM invoices WHERE patient_id = $1 ORDER BY created_at DESC;
    `;
    const res = await dbAdapter.query<DbInvoice>(sql, [patientId]);
    return res.rows;
  }

  public async recordPayment(
    id: string,
    amount: number,
    paymentMethod: string = 'Online'
  ): Promise<DbInvoice | null> {
    const invoice = await this.findById(id);
    if (!invoice) return null;

    const currentPaid = Number(invoice.paidAmount) || 0;
    const total = Number(invoice.totalAmount) || 0;
    const newPaid = Math.min(total, currentPaid + amount);
    const newBalance = Math.max(0, total - newPaid);
    const newStatus = newBalance === 0 ? 'Paid' : 'Partially Paid';

    const sql = `
      UPDATE invoices
      SET paid_amount = $1, balance_amount = $2, status = $3, payment_method = $4
      WHERE id = $5;
    `;
    await dbAdapter.query(sql, [newPaid, newBalance, newStatus, paymentMethod, invoice.id]);
    return this.findById(invoice.id);
  }
}

export const doctorRepository = new DoctorRepository();
export const invoiceRepository = new InvoiceRepository();
