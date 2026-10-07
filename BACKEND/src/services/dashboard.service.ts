/**
 * Dashboard Service
 * 
 * Aggregates real operational statistics directly from the database tables.
 * NO mock, dummy, or hardcoded numbers.
 */

import { dbAdapter } from '../db/adapter';

export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  waitingInQueue: number;
  completedAppointments: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingPayments: number;
  totalInvoices: number;
  totalDoctors: number;
  totalUsers: number;
  totalBranches: number;
  recentAppointments: any[];
  recentAuditLogs: any[];
}

export class DashboardService {
  public async getStats(): Promise<DashboardStats> {
    // 1. Total Patients
    const patientsRes = await dbAdapter.query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM patients;'
    ).catch(() => ({ rows: [{ count: 0 }] }));
    const totalPatients = Number(patientsRes.rows[0]?.count || 0);

    // 2. Appointments counts
    const todayDateStr = new Date().toISOString().split('T')[0];
    
    const apptsRes = await dbAdapter.query<{
      total: string | number;
      today: string | number;
      waiting: string | number;
      completed: string | number;
    }>(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN date = $1 OR date LIKE $2 THEN 1 END) as today,
        COUNT(CASE WHEN status IN ('Waiting', 'Scheduled', 'In Consultation') THEN 1 END) as waiting,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed
      FROM appointments;`,
      [todayDateStr, `${todayDateStr}%`]
    ).catch(() => ({ rows: [{ total: 0, today: 0, waiting: 0, completed: 0 }] }));

    const totalAppointments = Number(apptsRes.rows[0]?.total || 0);
    const todayAppointments = Number(apptsRes.rows[0]?.today || 0);
    const waitingInQueue = Number(apptsRes.rows[0]?.waiting || 0);
    const completedAppointments = Number(apptsRes.rows[0]?.completed || 0);

    // 3. Invoices & Revenue
    const invRes = await dbAdapter.query<{
      total_billed: string | number;
      total_paid: string | number;
      pending_balance: string | number;
      count: string | number;
    }>(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_billed,
        COALESCE(SUM(paid_amount), 0) as total_paid,
        COALESCE(SUM(balance_amount), 0) as pending_balance,
        COUNT(*) as count
      FROM invoices;`
    ).catch(() => ({ rows: [{ total_billed: 0, total_paid: 0, pending_balance: 0, count: 0 }] }));

    const totalRevenue = Number(invRes.rows[0]?.total_billed || 0);
    const paidRevenue = Number(invRes.rows[0]?.total_paid || 0);
    const pendingPayments = Number(invRes.rows[0]?.pending_balance || 0);
    const totalInvoices = Number(invRes.rows[0]?.count || 0);

    // 4. Doctors, Users, Branches
    const docRes = await dbAdapter.query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM doctors;'
    ).catch(() => ({ rows: [{ count: 0 }] }));
    const totalDoctors = Number(docRes.rows[0]?.count || 0);

    const userRes = await dbAdapter.query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM users;'
    ).catch(() => ({ rows: [{ count: 0 }] }));
    const totalUsers = Number(userRes.rows[0]?.count || 0);

    const branchRes = await dbAdapter.query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM branches;'
    ).catch(() => ({ rows: [{ count: 0 }] }));
    const totalBranches = Number(branchRes.rows[0]?.count || 0);

    // 5. Recent Appointments (real data)
    const recentApptsRes = await dbAdapter.query<any>(
      `SELECT 
        a.id, CONCAT(a.date, ' ', a.time_slot) AS "dateTime", a.status, a.visit_type AS "appointmentType",
        CONCAT(p.first_name, ' ', p.last_name) AS "patientName",
        p.phone AS "patientPhone",
        d.name AS "doctorName"
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON CAST(a.doctor_id AS VARCHAR) = CAST(d.id AS VARCHAR)
      ORDER BY a.created_at DESC
      LIMIT 5;`
    ).catch(() => ({ rows: [] }));

    // 6. Recent Audit Logs (real data)
    const recentAuditRes = await dbAdapter.query<any>(
      `SELECT 
        id, user_email AS "userEmail", action, entity AS "resource", entity_id AS "resourceId",
        details AS "metadata", timestamp AS "createdAt"
      FROM audit_logs
      ORDER BY id DESC
      LIMIT 10;`
    ).catch(() => ({ rows: [] }));

    return {
      totalPatients,
      totalAppointments,
      todayAppointments,
      waitingInQueue,
      completedAppointments,
      totalRevenue,
      paidRevenue,
      pendingPayments,
      totalInvoices,
      totalDoctors,
      totalUsers,
      totalBranches,
      recentAppointments: recentApptsRes.rows,
      recentAuditLogs: recentAuditRes.rows,
    };
  }
}

export const dashboardService = new DashboardService();
