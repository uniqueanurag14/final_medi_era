/**
 * Clinical & ERP Business Services
 * 
 * Implements business logic for Patients, Appointments, Doctors, and Invoices.
 * REAL DATA ONLY: All data comes from the real configured database via repositories.
 * Zero demo/dummy/mock data, no synthetic fallbacks.
 */

import { patientRepository, DbPatient } from '../repositories/patient.repository';
import { appointmentRepository, DbAppointment } from '../repositories/appointment.repository';
import { doctorRepository, DbDoctor, invoiceRepository, DbInvoice } from '../repositories/doctor-invoice.repository';
import { CreatePatientDto, CreateAppointmentDto, CreateInvoiceDto } from '../dtos/records.dto';
import { whatsappService } from './whatsapp.service';

export class ClinicalService {
  /**
   * List real patients from database
   */
  public async getPatients(): Promise<DbPatient[]> {
    return patientRepository.findAll();
  }

  /**
   * Get single real patient by ID
   */
  public async getPatientById(id: string): Promise<DbPatient | null> {
    return patientRepository.findById(id);
  }

  /**
   * Register a new real patient into the database
   */
  public async createPatient(dto: CreatePatientDto): Promise<DbPatient> {
    const id = `pat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const patientNumber = `PAT-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newPatient: DbPatient = {
      id,
      patientId: patientNumber,
      organizationId: dto.organizationId || 'org-mediera-01',
      branchId: dto.branchId || 'br-main-01',
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      email: dto.email,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      address: dto.address,
      city: dto.city,
      status: 'Active',
    };

    return patientRepository.create(newPatient);
  }

  /**
   * List real appointments from database
   */
  public async getAppointments(): Promise<DbAppointment[]> {
    return appointmentRepository.findAll();
  }

  /**
   * Schedule a new real appointment in database
   */
  public async createAppointment(dto: CreateAppointmentDto): Promise<DbAppointment> {
    const id = `appt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newAppt: DbAppointment = {
      id,
      organizationId: dto.organizationId || 'org-mediera-01',
      branchId: dto.branchId || 'br-main-01',
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      dateTime: dto.dateTime,
      status: 'Scheduled',
      appointmentType: dto.appointmentType || 'General Consultation',
      chiefComplaint: dto.chiefComplaint,
    };

    const created = await appointmentRepository.create(newAppt);

    // Automatically trigger WhatsApp confirmation and schedule 24h/2h reminders
    try {
      const fullAppt = await appointmentRepository.findById(id);
      if (fullAppt) {
        await whatsappService.scheduleAppointmentNotifications({
          id: fullAppt.id,
          patientId: fullAppt.patientId,
          dateTime: fullAppt.dateTime,
          patientPhone: fullAppt.patientPhone,
          patientName: fullAppt.patientName,
          doctorName: fullAppt.doctorName,
          branchName: fullAppt.branchName,
          status: fullAppt.status,
        });
      }
    } catch (notifErr: any) {
      console.error('[WhatsApp Appointment Auto-Schedule Error]', notifErr.message);
      // Non-blocking: failure in notification scheduling does NOT block appointment creation
    }

    return created;
  }

  /**
   * Update real appointment status in database
   */
  public async updateAppointmentStatus(id: string, status: string): Promise<boolean> {
    const updated = await appointmentRepository.updateStatus(id, status);
    if (updated) {
      // If cancelled or completed, automatically cancel pending reminders
      try {
        await whatsappService.handleAppointmentStatusChange(id, status);
      } catch (err: any) {
        console.error('[WhatsApp Status Change Error]', err.message);
      }
    }
    return updated;
  }

  /**
   * List real doctors from database
   */
  public async getDoctors(): Promise<DbDoctor[]> {
    return doctorRepository.findAll();
  }

  /**
   * List real invoices from database
   */
  public async getInvoices(): Promise<DbInvoice[]> {
    return invoiceRepository.findAll();
  }

  /**
   * Create a real invoice in database
   */
  public async createInvoice(dto: CreateInvoiceDto): Promise<DbInvoice> {
    const id = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoiceNumber = `INV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalAmount = Math.max(0, subtotal - (dto.discountAmount || 0));
    const paidAmount = dto.paidAmount || 0;
    const balanceAmount = Math.max(0, totalAmount - paidAmount);
    const status = balanceAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Pending';

    const newInvoice: DbInvoice = {
      id,
      invoiceNumber,
      organizationId: dto.organizationId || 'org-mediera-01',
      branchId: dto.branchId || 'br-main-01',
      patientId: dto.patientId,
      appointmentId: dto.appointmentId,
      totalAmount,
      paidAmount,
      balanceAmount,
      status,
    };

    return invoiceRepository.create(newInvoice);
  }

  /**
   * Update patient profile information
   */
  public async updatePatient(id: string, updates: Partial<DbPatient>): Promise<DbPatient | null> {
    return patientRepository.update(id, updates);
  }

  /**
   * Get invoices for a specific patient
   */
  public async getInvoicesByPatient(patientId: string): Promise<DbInvoice[]> {
    return invoiceRepository.findByPatientId(patientId);
  }

  /**
   * Process payment for an invoice
   */
  public async payInvoice(id: string, amount: number, paymentMethod: string = 'Online'): Promise<DbInvoice | null> {
    return invoiceRepository.recordPayment(id, amount, paymentMethod);
  }

  // --- Departments ---
  public async getDepartments() {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.getDepartments();
  }

  public async getDepartmentById(id: string) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.getDepartmentById(id);
  }

  public async createDepartment(data: { name: string; code?: string; description?: string; active?: boolean }) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.createDepartment(data);
  }

  public async updateDepartment(id: string, data: any) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.updateDepartment(id, data);
  }

  public async deleteDepartment(id: string) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.deleteDepartment(id);
  }

  // --- Designations ---
  public async getDesignations() {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.getDesignations();
  }

  public async getDesignationById(id: string) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.getDesignationById(id);
  }

  public async createDesignation(data: any) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.createDesignation(data);
  }

  public async updateDesignation(id: string, data: any) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.updateDesignation(id, data);
  }

  public async deleteDesignation(id: string) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.deleteDesignation(id);
  }

  // --- User Archetypes ---
  public async getUserArchetypes() {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.getUserArchetypes();
  }

  public async getUserArchetypeById(id: string) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.getUserArchetypeById(id);
  }

  public async createUserArchetype(data: any) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.createUserArchetype(data);
  }

  public async updateUserArchetype(id: string, data: any) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.updateUserArchetype(id, data);
  }

  public async deleteUserArchetype(id: string) {
    const { clinicalEntitiesRepository } = await import('../repositories/clinical-entities.repository');
    return clinicalEntitiesRepository.deleteUserArchetype(id);
  }
}

export const clinicalService = new ClinicalService();
