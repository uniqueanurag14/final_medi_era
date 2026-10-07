/**
 * Patient, Appointment & Invoice DTOs
 */

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  address?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  organizationId?: string;
  branchId?: string;
  medicalConditions?: string[];
  allergies?: string[];
}

export function validateCreatePatientDto(data: any): { valid: boolean; errors: string[]; dto?: CreatePatientDto } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const firstName = String(data.firstName || '').trim();
  const lastName = String(data.lastName || '').trim();
  const phone = String(data.phone || '').trim();

  if (!firstName) errors.push('First name is required');
  if (!lastName) errors.push('Last name is required');
  if (!phone) errors.push('Phone is required');

  return {
    valid: errors.length === 0,
    errors,
    dto: errors.length === 0 ? {
      firstName,
      lastName,
      phone,
      email: data.email ? String(data.email).trim() : undefined,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender || 'Other',
      bloodGroup: data.bloodGroup,
      address: data.address,
      city: data.city,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      organizationId: data.organizationId || 'org-01',
      branchId: data.branchId || 'branch-01',
      medicalConditions: Array.isArray(data.medicalConditions) ? data.medicalConditions : [],
      allergies: Array.isArray(data.allergies) ? data.allergies : [],
    } : undefined,
  };
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  dateTime: string;
  appointmentType?: string;
  specialty?: string;
  chiefComplaint?: string;
  organizationId?: string;
  branchId?: string;
  estimatedFee?: number;
}

export function validateCreateAppointmentDto(data: any): { valid: boolean; errors: string[]; dto?: CreateAppointmentDto } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.patientId) errors.push('patientId is required');
  if (!data.doctorId) errors.push('doctorId is required');

  const resolvedDateTime = data.dateTime || (data.date ? (data.timeSlot ? `${data.date} ${data.timeSlot}` : data.date) : (data.appointmentDate ? (data.appointmentTime ? `${data.appointmentDate} ${data.appointmentTime}` : data.appointmentDate) : undefined));
  if (!resolvedDateTime) errors.push('dateTime is required');

  return {
    valid: errors.length === 0,
    errors,
    dto: errors.length === 0 ? {
      patientId: String(data.patientId),
      doctorId: String(data.doctorId),
      dateTime: String(resolvedDateTime),
      appointmentType: data.appointmentType || 'General Consultation',
      specialty: data.specialty || 'General Practice',
      chiefComplaint: data.chiefComplaint || '',
      organizationId: data.organizationId || 'org-01',
      branchId: data.branchId || 'branch-01',
      estimatedFee: Number(data.estimatedFee || 0),
    } : undefined,
  };
}

export interface CreateInvoiceDto {
  patientId: string;
  appointmentId?: string;
  items: Array<{
    itemType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }>;
  discountAmount?: number;
  paidAmount?: number;
  paymentMethod?: string;
  organizationId?: string;
  branchId?: string;
}

export function validateCreateInvoiceDto(data: any): { valid: boolean; errors: string[]; dto?: CreateInvoiceDto } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  if (!data.patientId) errors.push('patientId is required');
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one line item is required');
  }

  return {
    valid: errors.length === 0,
    errors,
    dto: errors.length === 0 ? {
      patientId: String(data.patientId),
      appointmentId: data.appointmentId ? String(data.appointmentId) : undefined,
      items: data.items,
      discountAmount: Number(data.discountAmount || 0),
      paidAmount: Number(data.paidAmount || 0),
      paymentMethod: data.paymentMethod || 'Cash',
      organizationId: data.organizationId || 'org-01',
      branchId: data.branchId || 'branch-01',
    } : undefined,
  };
}

/**
 * Safe Response DTOs
 * Guarantees raw database models, password hashes, secrets,
 * or internal db fields are never exposed to React.
 */

export interface PatientResponseDto {
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
  status: string;
  createdAt?: string;
}

export function toPatientResponseDto(raw: any): PatientResponseDto {
  return {
    id: String(raw.id || ''),
    patientId: String(raw.patientId || raw.patient_id || ''),
    organizationId: String(raw.organizationId || raw.organization_id || 'org-mediera-01'),
    branchId: String(raw.branchId || raw.branch_id || 'br-main-01'),
    firstName: String(raw.firstName || raw.first_name || ''),
    lastName: String(raw.lastName || raw.last_name || ''),
    phone: String(raw.phone || ''),
    email: raw.email ? String(raw.email) : undefined,
    dateOfBirth: raw.dateOfBirth || raw.date_of_birth,
    gender: raw.gender || 'Other',
    bloodGroup: raw.bloodGroup || raw.blood_group,
    address: raw.address,
    city: raw.city,
    status: raw.status || 'Active',
    createdAt: raw.createdAt || raw.created_at,
  };
}

export interface AppointmentResponseDto {
  id: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  status: string;
  appointmentType: string;
  chiefComplaint?: string;
  patientName?: string;
  doctorName?: string;
  createdAt?: string;
}

export function toAppointmentResponseDto(raw: any): AppointmentResponseDto {
  return {
    id: String(raw.id || ''),
    organizationId: String(raw.organizationId || raw.organization_id || 'org-mediera-01'),
    branchId: String(raw.branchId || raw.branch_id || 'br-main-01'),
    patientId: String(raw.patientId || raw.patient_id || ''),
    doctorId: String(raw.doctorId || raw.doctor_id || ''),
    dateTime: String(raw.dateTime || raw.date_time || ''),
    status: raw.status || 'Scheduled',
    appointmentType: raw.appointmentType || raw.appointment_type || 'General Consultation',
    chiefComplaint: raw.chiefComplaint || raw.chief_complaint,
    patientName: raw.patientName || raw.patient_name,
    doctorName: raw.doctorName || raw.doctor_name,
    createdAt: raw.createdAt || raw.created_at,
  };
}

export interface DoctorResponseDto {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  qualification?: string;
  active: boolean;
}

export function toDoctorResponseDto(raw: any): DoctorResponseDto {
  return {
    id: String(raw.id || ''),
    organizationId: String(raw.organizationId || raw.organization_id || 'org-mediera-01'),
    name: String(raw.name || ''),
    email: String(raw.email || ''),
    phone: raw.phone ? String(raw.phone) : undefined,
    specialty: String(raw.specialty || 'General Practice'),
    qualification: raw.qualification ? String(raw.qualification) : undefined,
    active: raw.active !== false,
  };
}

export interface InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  appointmentId?: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
  createdAt?: string;
}

export function toInvoiceResponseDto(raw: any): InvoiceResponseDto {
  return {
    id: String(raw.id || ''),
    invoiceNumber: String(raw.invoiceNumber || raw.invoice_number || ''),
    organizationId: String(raw.organizationId || raw.organization_id || 'org-mediera-01'),
    branchId: String(raw.branchId || raw.branch_id || 'br-main-01'),
    patientId: String(raw.patientId || raw.patient_id || ''),
    appointmentId: raw.appointmentId || raw.appointment_id,
    totalAmount: Number(raw.totalAmount || raw.total_amount || 0),
    paidAmount: Number(raw.paidAmount || raw.paid_amount || 0),
    balanceAmount: Number(raw.balanceAmount || raw.balance_amount || 0),
    status: raw.status || 'Pending',
    createdAt: raw.createdAt || raw.created_at,
  };
}

