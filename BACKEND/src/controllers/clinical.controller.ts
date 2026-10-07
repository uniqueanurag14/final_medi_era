/**
 * Clinical & ERP Controller
 * 
 * Controllers MUST NOT contain direct database queries.
 * Delegates to ClinicalService.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { clinicalService } from '../services/clinical.service';
import { auditService } from '../services/audit.service';
import {
  CreatePatientDto,
  CreateAppointmentDto,
  CreateInvoiceDto,
  toPatientResponseDto,
  toAppointmentResponseDto,
  toDoctorResponseDto,
  toInvoiceResponseDto,
} from '../dtos/records.dto';

export class ClinicalController {
  // --- Patients ---
  public async getPatients(req: AuthenticatedRequest, res: Response) {
    try {
      // Security: Only staff and super admin can list clinic-wide patients
      if (req.user && (req.user.role === 'PATIENT' || req.user.role === 'CUSTOMER')) {
        return res.status(403).json({
          success: false,
          error: 'Access Denied: Patients cannot access the clinic patient registry.',
        });
      }
      const patients = await clinicalService.getPatients();
      const dtos = patients.map(toPatientResponseDto);
      return res.json({ success: true, count: dtos.length, data: dtos });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getPatientById(req: AuthenticatedRequest, res: Response) {
    try {
      const requestedId = req.params.id;
      // Prevent horizontal privilege escalation
      if (req.user && (req.user.role === 'PATIENT' || req.user.role === 'CUSTOMER')) {
        const isOwn =
          requestedId === req.user.id ||
          requestedId === `usr-${req.user.id}` ||
          req.user.id === `usr-${requestedId}` ||
          requestedId.includes(req.user.id);
        if (!isOwn) {
          return res.status(403).json({
            success: false,
            error: 'Access forbidden: You cannot view another patient\'s medical records.',
          });
        }
      }

      const patient = await clinicalService.getPatientById(requestedId);
      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }
      return res.json({ success: true, data: toPatientResponseDto(patient) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createPatient(req: AuthenticatedRequest, res: Response) {
    try {
      const dto = req.body as CreatePatientDto;
      const patient = await clinicalService.createPatient(dto);

      auditService.logAction({
        userId: req.user?.id ? Number(req.user.id) : null,
        userEmail: req.user?.email || 'admin@clinic.com',
        action: 'PATIENT_REGISTERED',
        resource: 'patients',
        resourceId: patient.id,
        metadata: { patientId: patient.patientId, name: `${patient.firstName} ${patient.lastName}`, phone: patient.phone },
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
        userAgent: (req.headers['user-agent'] as string) || null,
      }).catch(() => {});

      return res.status(201).json({ success: true, data: toPatientResponseDto(patient) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Appointments ---
  public async getAppointments(req: AuthenticatedRequest, res: Response) {
    try {
      let appointments = await clinicalService.getAppointments();

      // If called by a patient, only return their own appointments
      if (req.user && (req.user.role === 'PATIENT' || req.user.role === 'CUSTOMER')) {
        const uid = req.user.id;
        const uemail = (req.user.email || '').toLowerCase();
        appointments = appointments.filter(
          (a) =>
            a.patientId === uid ||
            a.patientId === `usr-${uid}` ||
            uid === `usr-${a.patientId}` ||
            (a as any).patientEmail?.toLowerCase() === uemail
        );
      }

      const dtos = appointments.map(toAppointmentResponseDto);
      return res.json({ success: true, count: dtos.length, data: dtos });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createAppointment(req: AuthenticatedRequest, res: Response) {
    try {
      const dto = req.body as CreateAppointmentDto;

      // Prevent patient from scheduling appointment under a different patient ID
      if (req.user && (req.user.role === 'PATIENT' || req.user.role === 'CUSTOMER')) {
        dto.patientId = req.user.id;
      }

      const appt = await clinicalService.createAppointment(dto);

      auditService.logAction({
        userId: req.user?.id ? Number(req.user.id) : null,
        userEmail: req.user?.email || 'reception@clinic.com',
        action: 'APPOINTMENT_SCHEDULED',
        resource: 'appointments',
        resourceId: appt.id,
        metadata: { patientId: appt.patientId, doctorId: appt.doctorId, dateTime: appt.dateTime, status: appt.status },
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null,
        userAgent: (req.headers['user-agent'] as string) || null,
      }).catch(() => {});

      return res.status(201).json({ success: true, data: toAppointmentResponseDto(appt) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updateAppointmentStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status is required' });
      }
      const updated = await clinicalService.updateAppointmentStatus(req.params.id, status);
      return res.json({ success: updated, message: updated ? 'Status updated' : 'Appointment not found' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Doctors ---
  public async getDoctors(req: AuthenticatedRequest, res: Response) {
    try {
      const doctors = await clinicalService.getDoctors();
      const dtos = doctors.map(toDoctorResponseDto);
      return res.json({ success: true, count: dtos.length, data: dtos });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updatePatient(req: AuthenticatedRequest, res: Response) {
    try {
      const requestedId = req.params.id;
      // Prevent horizontal privilege escalation
      if (req.user && (req.user.role === 'PATIENT' || req.user.role === 'CUSTOMER')) {
        const isOwn =
          requestedId === req.user.id ||
          requestedId === `usr-${req.user.id}` ||
          req.user.id === `usr-${requestedId}` ||
          requestedId.includes(req.user.id);
        if (!isOwn) {
          return res.status(403).json({
            success: false,
            error: 'Access forbidden: You cannot modify another patient\'s medical records.',
          });
        }
      }

      const patient = await clinicalService.updatePatient(requestedId, req.body);
      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }
      return res.json({ success: true, data: toPatientResponseDto(patient) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Invoices ---
  public async getInvoices(req: AuthenticatedRequest, res: Response) {
    try {
      let patientId = req.query.patientId as string;

      // If called by patient, enforce their own ID
      if (req.user && (req.user.role === 'PATIENT' || req.user.role === 'CUSTOMER')) {
        patientId = req.user.id;
      }

      const invoices = patientId
        ? await clinicalService.getInvoicesByPatient(patientId)
        : await clinicalService.getInvoices();
      const dtos = invoices.map(toInvoiceResponseDto);
      return res.json({ success: true, count: dtos.length, data: dtos });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async payInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount, paymentMethod } = req.body;
      const payAmount = Number(amount) || 0;
      if (payAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Valid payment amount is required' });
      }
      const updated = await clinicalService.payInvoice(req.params.id, payAmount, paymentMethod || 'Online');
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
      }
      return res.json({ success: true, message: 'Payment processed successfully', data: toInvoiceResponseDto(updated) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      const dto = req.body as CreateInvoiceDto;
      const invoice = await clinicalService.createInvoice(dto);
      return res.status(201).json({ success: true, data: toInvoiceResponseDto(invoice) });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Departments ---
  public async getDepartments(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.getDepartments();
      return res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getDepartmentById(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.getDepartmentById(req.params.id);
      if (!data) return res.status(404).json({ success: false, error: 'Department not found' });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, code, description, active } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Department name is required' });
      const data = await clinicalService.createDepartment({ name, code, description, active });
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updateDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.updateDepartment(req.params.id, req.body);
      if (!data) return res.status(404).json({ success: false, error: 'Department not found' });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async deleteDepartment(req: AuthenticatedRequest, res: Response) {
    try {
      const success = await clinicalService.deleteDepartment(req.params.id);
      if (!success) return res.status(404).json({ success: false, error: 'Department not found' });
      return res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- Designations ---
  public async getDesignations(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.getDesignations();
      return res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getDesignationById(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.getDesignationById(req.params.id);
      if (!data) return res.status(404).json({ success: false, error: 'Designation not found' });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createDesignation(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.createDesignation(req.body);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updateDesignation(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.updateDesignation(req.params.id, req.body);
      if (!data) return res.status(404).json({ success: false, error: 'Designation not found' });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async deleteDesignation(req: AuthenticatedRequest, res: Response) {
    try {
      const success = await clinicalService.deleteDesignation(req.params.id);
      if (!success) return res.status(404).json({ success: false, error: 'Designation not found' });
      return res.json({ success: true, message: 'Designation deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- User Archetypes ---
  public async getUserArchetypes(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.getUserArchetypes();
      return res.json({ success: true, count: data.length, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getUserArchetypeById(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.getUserArchetypeById(req.params.id);
      if (!data) return res.status(404).json({ success: false, error: 'Archetype not found' });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createUserArchetype(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.createUserArchetype(req.body);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async updateUserArchetype(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await clinicalService.updateUserArchetype(req.params.id, req.body);
      if (!data) return res.status(404).json({ success: false, error: 'Archetype not found' });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  public async deleteUserArchetype(req: AuthenticatedRequest, res: Response) {
    try {
      const success = await clinicalService.deleteUserArchetype(req.params.id);
      if (!success) return res.status(404).json({ success: false, error: 'Archetype not found' });
      return res.json({ success: true, message: 'Archetype deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const clinicalController = new ClinicalController();
