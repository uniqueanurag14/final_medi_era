/**
 * Appointment Repository
 * 
 * Handles real appointment database operations against configured database.
 */

import { dbAdapter } from '../db/adapter';

export interface DbAppointment {
  id: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  status: string;
  appointmentType: string;
  tokenNumber?: number;
  chiefComplaint?: string;
  createdAt?: string;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  branchName?: string;
}

export class AppointmentRepository {
  public async findAll(): Promise<DbAppointment[]> {
    const sql = `
      SELECT a.id, a.organization_id AS "organizationId", a.branch_id AS "branchId",
             a.patient_id AS "patientId", a.doctor_id AS "doctorId",
             CONCAT(a.date, ' ', a.time_slot) AS "dateTime",
             a.date, a.time_slot AS "timeSlot", a.token_number AS "tokenNumber",
             a.status, a.visit_type AS "appointmentType", a.chief_complaint AS "chiefComplaint",
             a.created_at AS "createdAt",
             CONCAT(p.first_name, ' ', p.last_name) AS "patientName",
             p.phone AS "patientPhone",
             d.name AS "doctorName",
             b.name AS "branchName"
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON CAST(a.doctor_id AS VARCHAR) = CAST(d.id AS VARCHAR)
      LEFT JOIN branches b ON CAST(a.branch_id AS VARCHAR) = CAST(b.id AS VARCHAR)
      ORDER BY a.created_at DESC;
    `;

    const res = await dbAdapter.query<DbAppointment>(sql);
    return res.rows;
  }

  public async findById(id: string): Promise<DbAppointment | null> {
    const sql = `
      SELECT a.id, a.organization_id AS "organizationId", a.branch_id AS "branchId",
             a.patient_id AS "patientId", a.doctor_id AS "doctorId",
             CONCAT(a.date, ' ', a.time_slot) AS "dateTime",
             a.date, a.time_slot AS "timeSlot", a.token_number AS "tokenNumber",
             a.status, a.visit_type AS "appointmentType", a.chief_complaint AS "chiefComplaint",
             a.created_at AS "createdAt",
             CONCAT(p.first_name, ' ', p.last_name) AS "patientName",
             p.phone AS "patientPhone",
             d.name AS "doctorName",
             b.name AS "branchName"
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON CAST(a.doctor_id AS VARCHAR) = CAST(d.id AS VARCHAR)
      LEFT JOIN branches b ON CAST(a.branch_id AS VARCHAR) = CAST(b.id AS VARCHAR)
      WHERE a.id = $1 LIMIT 1;
    `;
    const res = await dbAdapter.query<DbAppointment>(sql, [id]);
    return res.rows[0] || null;
  }

  public async create(appt: DbAppointment): Promise<DbAppointment> {
    const datePart = appt.dateTime?.includes('T')
      ? appt.dateTime.split('T')[0]
      : (appt.dateTime?.split(' ')[0] || new Date().toISOString().split('T')[0]);
    const timePart = appt.dateTime?.includes('T')
      ? appt.dateTime.split('T')[1].substring(0, 5)
      : (appt.dateTime?.split(' ')[1] || '10:00 AM');
    const apptNum = `APT-${Date.now().toString().slice(-6)}`;

    // 1. Resolve Organization ID with DB FK safety
    const orgCheck = appt.organizationId
      ? await dbAdapter.query<{ id: string }>('SELECT id FROM organizations WHERE id = $1 LIMIT 1;', [appt.organizationId]).catch(() => ({ rows: [] }))
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
    const branchCheck = appt.branchId
      ? await dbAdapter.query<{ id: string }>('SELECT id FROM branches WHERE id = $1 LIMIT 1;', [appt.branchId]).catch(() => ({ rows: [] }))
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

    // 3. Resolve Doctor ID with DB FK safety
    let doctorId = appt.doctorId || 'doc-1';
    const docCheck = await dbAdapter.query<{ id: string }>('SELECT id FROM doctors WHERE id = $1 LIMIT 1;', [doctorId]).catch(() => ({ rows: [] }));
    if (!docCheck.rows[0]?.id) {
      const firstDoc = await dbAdapter.query<{ id: string }>('SELECT id FROM doctors LIMIT 1;').catch(() => ({ rows: [] }));
      if (firstDoc.rows[0]?.id) {
        doctorId = firstDoc.rows[0].id;
      }
    }

    // 4. Compute next Token Number for the date
    const tokenRes = await dbAdapter.query<{ max_token: number }>(
      'SELECT COALESCE(MAX(token_number), 0) as max_token FROM appointments WHERE date = $1 AND doctor_id = $2;',
      [datePart, doctorId]
    ).catch(() => ({ rows: [{ max_token: 0 }] }));
    const tokenNumber = Number(tokenRes.rows[0]?.max_token || 0) + 1;

    const sql = `
      INSERT INTO appointments (
        id, appointment_number, token_number, organization_id, branch_id, patient_id, doctor_id,
        date, time_slot, status, visit_type, chief_complaint
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
    `;
    await dbAdapter.query(sql, [
      appt.id,
      apptNum,
      tokenNumber,
      orgId,
      branchId,
      appt.patientId,
      doctorId,
      datePart,
      timePart,
      appt.status || 'Scheduled',
      appt.appointmentType || 'General Consultation',
      appt.chiefComplaint || '',
    ]);
    return { ...appt, doctorId, tokenNumber };
  }

  public async updateStatus(id: string, status: string): Promise<boolean> {
    const sql = `UPDATE appointments SET status = $1 WHERE id = $2;`;
    const res = await dbAdapter.query(sql, [status, id]);
    return (res.affectedRows || 0) > 0;
  }
}

export const appointmentRepository = new AppointmentRepository();
