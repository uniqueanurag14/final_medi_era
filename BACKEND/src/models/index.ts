// Complete TypeScript models for CLINIC CRM (PostgreSQL & MySQL schema equivalent)

export type CoreUserType = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN'
  | 'CLINIC_ADMIN' 
  | 'MANAGER'
  | 'EMPLOYEE'
  | 'STAFF'
  | 'CUSTOMER'
  | 'DOCTOR' 
  | 'RECEPTIONIST' 
  | 'NURSE' 
  | 'LAB_TECHNICIAN' 
  | 'PHARMACIST' 
  | 'INVENTORY_MANAGER'
  | 'MEDICAL_STORE_MANAGER'
  | 'ACCOUNTANT' 
  | 'PATIENT';

export type PermissionCode =
  | 'all'
  // Organization
  | 'organization.view'
  | 'organization.create'
  | 'organization.update'
  | 'organization.delete'
  // Branch
  | 'branch.view'
  | 'branch.create'
  | 'branch.update'
  | 'branch.delete'
  // Employee
  | 'employee.view'
  | 'employee.create'
  | 'employee.update'
  | 'employee.delete'
  // Role
  | 'role.view'
  | 'role.create'
  | 'role.update'
  | 'role.delete'
  // Customer / Patient
  | 'customer.view'
  | 'customer.create'
  | 'customer.update'
  | 'customer.delete'
  | 'patients.read'
  | 'patients.create'
  | 'patients.update'
  | 'patients.delete'
  // Service
  | 'service.view'
  | 'service.create'
  | 'service.update'
  | 'service.delete'
  // Booking / Appointment
  | 'booking.view'
  | 'booking.create'
  | 'booking.update'
  | 'booking.cancel'
  | 'appointments.read'
  | 'appointments.create'
  | 'appointments.update'
  // Inventory
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.update'
  | 'inventory.import'
  // Settings
  | 'settings.view'
  | 'settings.update'
  | string;

export type AppointmentStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Checked In' 
  | 'Waiting' 
  | 'In Consultation' 
  | 'Completed' 
  | 'Cancelled' 
  | 'No Show' 
  | 'Rescheduled'
  | 'Scheduled';

export type VisitType = 'In Clinic' | 'Video Consultation' | 'Home Visit';

export type InvoiceStatus = 'Draft' | 'Issued' | 'Partially Paid' | 'Paid' | 'Cancelled' | 'Refunded';

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Card'
  | 'Online'
  | 'Insurance'
  | 'Google Pay'
  | 'PhonePe'
  | 'Paytm'
  | 'BHIM'
  | 'Debit Card'
  | 'Credit Card'
  | 'POS Machine'
  | 'Bank Transfer'
  | 'Cheque'
  | 'Payment Gateway';

export type LabOrderStatus = 'Ordered' | 'Sample Collected' | 'Processing' | 'Completed' | 'Reviewed' | 'Delivered' | 'In Progress' | 'Pending Sample';

export type LeadStatus = 
  | 'New' 
  | 'Contacted' 
  | 'Interested' 
  | 'Qualified'
  | 'Appointment Interested'
  | 'Appointment Scheduled'
  | 'Appointment Booked' 
  | 'Visited' 
  | 'Converted' 
  | 'Lost';

export type FollowUpStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Missed';

export type FollowUpType = 
  | 'Consultation Follow-up' 
  | 'Treatment Follow-up' 
  | 'Lab Follow-up' 
  | 'Appointment Follow-up' 
  | 'Payment Follow-up' 
  | 'Inactive Patient Follow-up'
  | 'Clinical Follow-up'
  | 'Patient Reactivation'
  | 'Other'
  | 'Feedback Follow-up'
  | 'Lead Follow-up'
  | 'Package Renewal'
  | 'Lab Result Review'
  | 'Chronic Care Monitoring'
  | 'Post-Consultation Routine';

export type PatientCategory = 
  | 'New' 
  | 'Returning' 
  | 'Inactive' 
  | 'Follow-up Due' 
  | 'Treatment Completed' 
  | 'High Value' 
  | 'Lead' 
  | 'Converted'
  | 'Regular'
  | 'VIP'
  | 'Senior Citizen'
  | 'Chronic Care';

export interface Organization {
  id: string;
  name: string;
  code: string;
  tagline: string;
  logo: string;
  taxNumber: string;
  registrationNumber?: string;
  phone: string;
  email: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website: string;
  status?: 'Active' | 'Inactive' | 'Archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  zipCode: string;
  postalCode?: string;
  managerName?: string;
  operatingHours?: string;
  status?: 'Active' | 'Inactive' | 'Archived';
  isMainBranch: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string | number;
  organizationId?: string;
  branchId?: string;
  role: UserRole | string;
  roleId?: number | string;
  roleName?: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  avatarUrl?: string;
  phone?: string;
  doctorId?: string;
  patientId?: string;
  active?: boolean;
  status?: string;
  emailVerified?: boolean;
  themePreference?: string;
  lastLogin?: string;
  lastLoginAt?: string;
  activeSessionsCount?: number;
  mustChangePassword?: boolean;
  permissions: string[];
  isSuperAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface Role {
  id: number | string;
  name: string;
  displayName?: string;
  description?: string;
  isSystemRole?: boolean;
  is_system_role?: boolean;
  permissionsCount?: number | string;
  usersCount?: number;
  permissions?: Permission[];
  createdAt?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  totalRoles: number;
  activeSessions: number;
  recentAuditLogs?: Array<{
    id: number | string;
    action: string;
    resource?: string;
    resourceId?: string;
    userEmail?: string;
    createdAt?: string;
    metadata?: any;
    details?: string;
  }>;
}

export interface SystemSetting {
  id?: number | string;
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
  message?: string;
}

export interface Vitals {
  id?: string;
  bloodPressure?: string;
  bloodPressureSys: number;
  bloodPressureDia: number;
  pulseRate: number;
  temperature: number; // in °F or °C
  weightKg: number;
  heightCm: number;
  bmi: number;
  spO2: number; // %
  respiratoryRate: number; // breaths/min
  recordedAt: string;
  recordedBy?: string;
}

export interface Patient {
  id: string;
  patientId: string; // e.g. PAT-2026-0001
  organizationId: string;
  branchId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email: string;
  address: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies: string[];
  medicalConditions: string[];
  currentMedications: string[];
  category: PatientCategory | 'Regular' | 'VIP' | 'Senior Citizen' | 'Chronic Care' | 'New';
  status?: 'Active' | 'Inactive' | 'Archived';
  registeredDate: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: string;
  notes?: string;
  avatar?: string;
  vitals?: Vitals[];
  tags?: string[];
  source?: string;
  referralSource?: string;
  referredByPatientId?: string;
  isDemo?: boolean;
}

export interface Specialty {
  id: string;
  name: string;
  code: string;
  description: string;
  iconName: string;
  color: string;
  active: boolean;
}

export interface DoctorSchedule {
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  dayName: string;
  startTime: string; // '09:00'
  endTime: string;   // '17:00'
  slotDurationMinutes: number; // 15, 20, 30
  breakStart?: string;
  breakEnd?: string;
  isAvailable: boolean;
}

export interface Doctor {
  id: string;
  organizationId: string;
  branchId: string;
  userId?: string;
  name: string;
  title: string; // Dr. John Doe, MD
  specialtyId: string;
  specialtyName: string;
  specialty?: string; // alias for specialtyName
  qualification: string;
  experienceYears: number;
  registrationNumber: string;
  consultationFee: number;
  bio: string;
  photo: string;
  languages: string[];
  rating: number;
  reviewCount: number;
  schedules: DoctorSchedule[];
  roomNumber?: string;
  phone?: string;
  email?: string;
  availableDays?: string[];
  active: boolean;
  isDemo?: boolean;
}

export type Service = ServiceItem;

export interface ServiceItem {
  id: string;
  organizationId: string;
  name: string;
  code?: string;
  type?: string;
  description: string;
  category: 'Consultation' | 'Diagnostics' | 'Procedures' | 'Therapy' | 'Vaccination' | 'Lab';
  departmentId?: string;
  departmentName?: string;
  assignedDoctorIds?: string[];
  branchIds?: string[];
  price: number;
  durationMinutes: number;
  taxRate: number; // % e.g. 5
  active: boolean;
  supportsHomeVisit?: boolean;
  preparationInstructions?: string;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthPackage {
  id: string;
  name: string;
  code?: string;
  tagline: string;
  description: string;
  servicesIncluded: string[];
  originalPrice: number;
  discountedPrice: number;
  validityDays: number;
  recommendedFor: string;
  badge?: string;
  active: boolean;
  departmentName?: string;
  branchIds?: string[];
  preparationInstructions?: string;
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  appointmentNumber: string; // APT-2026-001
  organizationId: string;
  branchId: string;
  branchName?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  specialtyId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm (e.g. 09:30)
  visitType: VisitType;
  status: AppointmentStatus;
  tokenNumber: number; // Daily Queue Token #1, #2, etc.
  chiefComplaint?: string;
  fee: number;
  paymentStatus: 'Pending' | 'Paid';
  notes?: string;
  homeVisitAddress?: string;
  homeVisitNotes?: string;
  createdAt: string;
  checkedInAt?: string;
  consultationStartedAt?: string;
  consultationCompletedAt?: string;
  isDemo?: boolean;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  strength?: string; // e.g. "500 mg", "10 ml"
  dosage: string;   // e.g. "1 Tablet", "2 Puffs"
  route: 'Oral' | 'Topical' | 'Inhalation' | 'Intravenous' | 'Intramuscular' | 'Ophthalmic';
  frequency: 'Once Daily' | 'Once Daily (1-0-0)' | 'Twice Daily (1-0-1)' | 'Thrice Daily (1-1-1)' | 'Four Times (1-1-1-1)' | 'As Needed (SOS)' | 'Every 8 Hours' | 'Bedtime (0-0-1)' | string;
  duration: string; // e.g. "5 Days", "2 Weeks", "1 Month"
  timing: 'Before Food' | 'After Food' | 'With Food' | 'Empty Stomach' | 'Bedtime' | string;
  instructions?: string; // e.g. "Drink with plenty of water"
}

export interface Prescription {
  id: string;
  prescriptionNumber: string; // RX-2026-001
  consultationId?: string;
  appointmentId?: string;
  patientId: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName?: string;
  doctorQualification?: string;
  doctorRegNumber?: string;
  date?: string;
  diagnosis: string;
  items: PrescriptionItem[];
  advice?: string;
  followUpDate?: string;
  status?: 'Draft' | 'Issued' | 'Cancelled';
  doctorSignature?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Consultation {
  id: string;
  consultationNumber?: string; // CNS-2026-001
  organizationId?: string;
  appointmentId: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  branchId?: string;
  date: string;
  chiefComplaint: string;
  symptoms: string[];
  vitals?: Vitals;
  examinationNotes?: string;
  pastMedicalHistory?: string;
  allergies?: string[];
  clinicalExamination?: string;
  diagnosis: string;
  icdCode?: string;
  investigationsRequired?: string[]; // Lab tests ordered
  prescription?: Prescription;
  treatmentPlan?: string;
  doctorNotes?: string; // Confidential clinical notes
  advice?: string;
  followUpDate?: string;
  status?: 'Draft' | 'Completed';
  isDemo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabTest {
  id?: string;
  testName?: string;
  name?: string;
  code?: string;
  category?: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Radiology' | 'Pathology' | 'Cardiology' | string;
  resultValue?: string;
  normalRange: string;
  units: string;
  isAbnormal?: boolean;
  sampleType?: 'Blood' | 'Urine' | 'Serum' | 'Swab' | 'Saliva' | 'Tissue';
  tatHours?: number; // Turnaround time in hours
  price?: number;
  active?: boolean;
}

export interface LabOrderItem {
  testId?: string;
  testName: string;
  category?: string;
  resultValue?: string;
  normalRange: string;
  units: string;
  isAbnormal?: boolean;
  status?: LabOrderStatus;
}

export interface LabOrder {
  id: string;
  orderNumber: string; // LAB-2026-001
  organizationId?: string;
  branchId?: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName?: string;
  appointmentId?: string;
  consultationId?: string;
  date?: string;
  tests: LabOrderItem[];
  status?: LabOrderStatus;
  sampleCollectedAt?: string;
  completedAt?: string;
  reviewedByDoctor?: boolean;
  doctorRemarks?: string;
  reportFileUrl?: string;
  totalCost?: number;
  isDemo?: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  type?: 'Consultation' | 'Service' | 'Lab' | 'Medicine' | 'Procedure' | 'Package';
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-2026-001
  receiptNumber?: string; // REC-2026-001
  organizationId: string;
  branchId: string;
  branchName?: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAddress?: string;
  appointmentId?: string;
  date?: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  transactionReference?: string;
  notes?: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  provider?: string;
  transactionReference: string;
  externalReference?: string;
  posTerminalId?: string;
  posTerminalName?: string;
  utrNumber?: string;
  paymentStatus?: 'Pending' | 'Initiated' | 'Awaiting Confirmation' | 'Paid' | 'Partially Paid' | 'Failed' | 'Cancelled' | 'Refunded' | 'Partially Refunded' | 'Reconciled' | 'Disputed';
  date: string;
  collectedBy: string;
  branchId?: string;
  branchName?: string;
  reconciled?: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  refundAmount?: number;
  refundReason?: string;
  refundReference?: string;
  refundDate?: string;
  refundApprovedBy?: string;
  refundProcessedBy?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  organizationId: string;
  branchId: string;
  name?: string;
  medicineName?: string;
  genericName: string;
  category: 'Antibiotics' | 'Analgesics' | 'Cardiovascular' | 'Antidiabetic' | 'Vitamins & Supplements' | 'Injectables' | 'Surgical Consumables' | 'Tablets' | 'Syrups' | 'Injections' | 'Ointments' | 'Consumables' | string;
  dosageForm?: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Drops' | string;
  sku?: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  minReorderLevel?: number;
  minimumThreshold?: number;
  unit?: string;
  unitCost?: number;
  costPrice?: number;
  sellingPrice: number;
  supplier: string;
  location?: string; // Shelf A-1
  status?: 'In Stock' | 'Low Stock' | 'Expiring Soon' | 'Out of Stock' | string;
  isDemo?: boolean;
}

// --- PHASE 5 CRM, COMMUNICATIONS, CAMPAIGNS & ENGAGEMENT MODELS ---

export type LeadStage = 
  | 'New' 
  | 'Contacted' 
  | 'Interested'
  | 'Qualified' 
  | 'Appointment Interested' 
  | 'Appointment Scheduled'
  | 'Appointment Booked' 
  | 'Visited' 
  | 'Converted' 
  | 'Lost';

export type LeadPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type LeadSource = 
  | 'Website' 
  | 'Website Form'
  | 'Google' 
  | 'Facebook' 
  | 'Instagram' 
  | 'WhatsApp' 
  | 'Referral' 
  | 'Walk-in' 
  | 'Phone' 
  | 'Partner' 
  | 'Campaign' 
  | 'Other';

export interface LeadStageHistory {
  id: string;
  previousStage: LeadStage;
  newStage: LeadStage;
  changedBy: string;
  timestamp: string;
  reason?: string;
}

export interface Lead {
  id: string;
  organizationId?: string;
  branchId?: string;
  name: string;
  phone: string;
  email: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  source: LeadSource;
  interestedService?: string;
  interestedSpecialty?: string;
  preferredDoctorId?: string;
  preferredDoctorName?: string;
  preferredBranchId?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  status: LeadStatus;
  stage?: LeadStage;
  priority?: LeadPriority;
  notes: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  estimatedValue?: number;
  convertedPatientId?: string;
  convertedAt?: string;
  convertedBy?: string;
  lostReason?: string;
  stageHistory?: LeadStageHistory[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CrmActivityType = 
  | 'Call' 
  | 'Email' 
  | 'SMS' 
  | 'WhatsApp' 
  | 'Note' 
  | 'Meeting' 
  | 'Appointment' 
  | 'Follow-up' 
  | 'Task' 
  | 'Payment reminder' 
  | 'Feedback request' 
  | 'Other';

export interface CrmActivity {
  id: string;
  organizationId?: string;
  branchId?: string;
  entityType: 'Lead' | 'Patient';
  entityId: string;
  entityName?: string;
  userId?: string;
  userName?: string;
  performedBy?: string; // alias for userName
  userRole?: UserRole;
  type: CrmActivityType;
  subject?: string;
  title?: string; // alias for subject
  description: string;
  status?: 'Completed' | 'Pending' | 'Cancelled';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export type CrmTaskPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type CrmTaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue';
export type CrmTaskCategory = 
  | 'Follow-up' 
  | 'Lead Outreach' 
  | 'No-Show Recovery' 
  | 'Payment Reminder' 
  | 'Service Recovery' 
  | 'Reactivation' 
  | 'Feedback Request' 
  | 'General';

export interface CrmTask {
  id: string;
  organizationId?: string;
  branchId?: string;
  title: string;
  category: CrmTaskCategory;
  assignedUserId: string;
  assignedUserName: string;
  assignedUserRole?: UserRole;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  dueDate: string;
  dueTime?: string;
  priority: CrmTaskPriority;
  status: CrmTaskStatus;
  notes?: string;
  resolutionNotes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PatientTag {
  id: string;
  name: string;
  color: string;
  category?: 'Clinical' | 'Financial' | 'VIP / Status' | 'Engagement' | 'General';
  description?: string;
  patientCount?: number;
  createdAt?: string;
}

export interface PatientSegmentCondition {
  id: string;
  field: 
    | 'lastVisitDays' 
    | 'totalVisits' 
    | 'totalRevenue' 
    | 'outstandingBalance' 
    | 'ageMin' 
    | 'ageMax' 
    | 'gender' 
    | 'branchId' 
    | 'doctorSpecialty' 
    | 'hasTags' 
    | 'noShowCount' 
    | 'hasPendingFollowup' 
    | 'leadSource';
  operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'contains' | 'is_true' | 'is_false';
  value: any;
  label?: string;
}

export interface PatientSegment {
  id: string;
  name: string;
  description: string;
  conditionLogic?: 'AND' | 'OR';
  conditions?: PatientSegmentCondition[];
  criteria?: any; // criteria alias
  memberCount?: number;
  category?: 'Reactivation' | 'Retention' | 'VIP' | 'Clinical Care' | 'Custom';
  createdAt?: string;
  updatedAt?: string;
}

export type ExtendedFollowUpType = 
  | 'Clinical Follow-up' 
  | 'Appointment Follow-up' 
  | 'Payment Follow-up' 
  | 'Lab Follow-up' 
  | 'Treatment Follow-up' 
  | 'No-show Recovery' 
  | 'Patient Reactivation' 
  | 'Feedback Follow-up' 
  | 'Lead Follow-up' 
  | 'Package Renewal' 
  | 'Consultation Follow-up' 
  | 'Inactive Patient Follow-up' 
  | 'Other';

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  type: ExtendedFollowUpType | FollowUpType;
  date: string;
  timeSlot?: string;
  assignedDoctorOrStaff: string;
  assignedStaffId?: string;
  status: FollowUpStatus;
  priority?: 'Normal' | 'High' | 'Urgent';
  notes: string;
  outcomeNotes?: string;
  appointmentId?: string;
  channel?: 'Phone Call' | 'WhatsApp' | 'SMS' | 'Email' | 'In Clinic';
  isDemo?: boolean;
  createdAt: string;
  completedAt?: string;
}

export type AutomationEvent = 
  | 'appointment.completed' 
  | 'appointment.cancelled' 
  | 'appointment.no_show' 
  | 'prescription.issued' 
  | 'invoice.overdue' 
  | 'patient.inactive' 
  | 'feedback.negative' 
  | 'lead.created';

export type AutomationTriggerEvent = AutomationEvent;

export type AutomationAction = 
  | 'create_followup' 
  | 'create_task' 
  | 'send_notification' 
  | 'send_payment_reminder' 
  | 'create_recovery_task' 
  | 'send_campaign';

export type AutomationActionType = AutomationAction | 'schedule_followup';

export interface AutomationRuleActionItem {
  id: string;
  type: AutomationActionType;
  delayMinutes?: number;
  config?: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  event?: AutomationEvent;
  triggerEvent?: AutomationTriggerEvent;
  conditions: { field?: string; operator?: string; value?: any }[];
  action?: AutomationAction;
  actions?: AutomationRuleActionItem[];
  actionPayload?: any;
  delayDays?: number;
  delayHours?: number;
  delayMinutes?: number;
  status?: 'Active' | 'Paused';
  isActive?: boolean;
  organizationId?: string;
  branchId?: string;
  triggerCount?: number;
  createdAt?: string;
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  event: AutomationEvent;
  triggerEvent?: string;
  entityId: string;
  entityType: 'Appointment' | 'Patient' | 'Invoice' | 'Lead' | 'Feedback';
  patientId?: string;
  patientName?: string;
  actionsExecuted?: string[];
  idempotencyKey: string;
  executedAt: string;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Skipped';
  details: string;
  error?: string;
}

export type CommunicationChannel = 
  | 'Email' 
  | 'SMS' 
  | 'WhatsApp' 
  | 'Push Notification'
  | 'email'
  | 'sms'
  | 'whatsapp'
  | 'push';

export interface CommunicationTemplate {
  id: string;
  name: string;
  channel: CommunicationChannel;
  eventTrigger: string;
  subject?: string;
  body: string;
  variables: string[]; // e.g. ["patient_name", "doctor_name", "appointment_date", "appointment_time", "clinic_name", "invoice_number", "amount", "followup_date"]
  status?: 'Active' | 'Draft' | 'Inactive';
  isActive?: boolean;
  category?: 'Transactional' | 'Promotional' | 'Reminders' | 'Clinical';
  branchId?: string;
  organizationId?: string;
  createdAt?: string;
}

export interface CommunicationLog {
  id: string;
  patientId?: string;
  patientName?: string;
  leadId?: string;
  leadName?: string;
  recipient: string; // phone or email
  recipientContact?: string; // alias for recipient
  channel: CommunicationChannel;
  templateName: string;
  eventTrigger?: string;
  subject?: string;
  content: string;
  status: 'Queued' | 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Cancelled';
  providerMessageId?: string;
  failureReason?: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export type CampaignType = 
  | 'Health Package' 
  | 'Health Checkup' 
  | 'Patient Reactivation' 
  | 'Birthday' 
  | 'Seasonal' 
  | 'Preventive Care' 
  | 'Appointment Reminder' 
  | 'Follow-up' 
  | 'Feedback' 
  | 'Referral' 
  | 'Clinic Announcement';

export type CampaignGoal = 
  | 'Reactivation' 
  | 'Awareness' 
  | 'Checkup Booking' 
  | 'Feedback' 
  | 'Revenue' 
  | 'General'
  | 'Patient Reactivation'
  | 'Preventive Checkups'
  | 'Service Promotion'
  | 'Review Generation'
  | 'Recall';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  campaignType?: CampaignType;
  channel: CommunicationChannel | 'Multi-Channel';
  segmentId?: string;
  segmentName?: string;
  audienceCriteria?: any;
  templateId?: string;
  templateSubject?: string;
  templateBody?: string;
  goal?: string;
  budget?: number;
  scheduleType?: 'Instant' | 'Scheduled';
  scheduledAt?: string;
  timezone?: string; // Asia/Kolkata default
  status: 'Draft' | 'Scheduled' | 'Running' | 'Completed' | 'Paused' | 'Cancelled';
  audienceCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  appointmentsGenerated: number;
  revenueGenerated: number;
  createdBy?: string;
  createdAt: string;
}

export type FeedbackCategory = 
  | 'Doctor' 
  | 'Reception' 
  | 'Waiting Time' 
  | 'Cleanliness' 
  | 'Service' 
  | 'Overall Experience' 
  | 'Billing'
  | 'Doctor Care'
  | 'Wait Time'
  | 'Staff Friendliness'
  | 'Facility Cleanliness'
  | 'Other';

export interface PatientFeedback {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId?: string;
  doctorName?: string;
  branchId?: string;
  branchName?: string;
  appointmentId?: string;
  appointmentNumber?: string;
  rating: number; // 1 to 5
  category: FeedbackCategory;
  comment: string;
  externalReviewTriggered?: boolean;
  serviceRecoveryTaskId?: string;
  isResolved?: boolean;
  createdAt: string;
}

export interface ServiceRecoveryTask {
  id: string;
  feedbackId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  rating: number;
  issueSummary: string;
  assignedStaffId: string;
  assignedStaffName: string;
  priority: 'Urgent' | 'High' | 'Normal';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  resolutionNotes?: string;
  slaDue: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface PatientReferral {
  id: string;
  referringPatientId?: string;
  referringPatientName?: string;
  referrerPatientId?: string; // alias
  referrerPatientName?: string; // alias
  newPatientName?: string;
  referredName?: string; // alias
  newPatientPhone?: string;
  referredPhone?: string; // alias
  newPatientEmail?: string;
  newPatientId?: string;
  referralDate?: string;
  status: 'Referred' | 'Contacted' | 'Booked' | 'Completed' | 'Reward Issued' | 'Converted' | 'Pending Contact';
  rewardStatus?: 'Eligible' | 'Credited' | 'None' | 'Issued' | 'Pending' | 'Rewarded';
  rewardAmount?: number;
  rewardDescription?: string;
  notes?: string;
  createdAt: string;
}

export interface PatientConsentRecord {
  type: 'Marketing Consent' | 'WhatsApp Consent' | 'Email Consent' | 'SMS Consent' | 'Data Sharing' | 'Standard Care Communications';
  granted: boolean;
  grantedAt: string;
  source: 'Online Form' | 'Front Desk' | 'Patient Portal' | 'Phone Consent' | 'System';
  version: string;
}

export interface PatientCommunicationPreferences {
  patientId: string;
  emailAllowed: boolean;
  smsAllowed: boolean;
  whatsappAllowed: boolean;
  pushAllowed: boolean;
  promotionalAllowed: boolean;
  appointmentRemindersAllowed: boolean;
  marketingAllowed: boolean;
  allowSms?: boolean;
  allowWhatsApp?: boolean;
  allowEmail?: boolean;
  allowPromotional?: boolean;
  consents: PatientConsentRecord[];
  updatedAt: string;
}

export interface Staff {
  id: string;
  organizationId: string;
  branchId: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  email: string;
  joiningDate: string;
  shift: 'Morning (08:00 - 16:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 08:00)' | 'General (09:00 - 18:00)';
  status: 'Active' | 'On Leave' | 'Inactive';
  isDemo?: boolean;
}

export interface AuditLog {
  id: string | number;
  userId?: string | number;
  userName?: string;
  userRole?: UserRole | string;
  userEmail?: string;
  action: string; // e.g. "COMPLETED_CONSULTATION", "ISSUED_INVOICE", "CHECKED_IN_PATIENT"
  module?: 'Appointments' | 'Consultations' | 'Prescriptions' | 'Billing' | 'Patients' | 'Inventory' | 'Settings' | 'Auth' | 'CRM' | 'Communications' | 'Campaigns' | string;
  entity?: string;
  entityId?: string | number;
  resource?: string;
  resourceId?: string | number;
  details?: string;
  timestamp?: string;
  createdAt?: string;
  ipAddress?: string;
  entityType?: string;
  metadata?: any;
}

export interface SystemNotification {
  id: string;
  userId?: string; // or target role
  targetRole?: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'appointment' | 'payment' | 'prescription' | 'report' | 'followup' | 'system' | 'inventory' | 'lead' | 'feedback' | 'campaign';
  read?: boolean;
  createdAt?: string;
  link?: string;
}

export interface PatientDocument {
  id: string;
  patientId: string;
  consultationId?: string;
  title: string;
  category: 'Prescription' | 'Lab Report' | 'X-Ray / Scan' | 'Medical Certificate' | 'Insurance' | 'Referral Letter' | 'Discharge Summary' | 'Other' | 'Radiology';
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  visibility?: 'Doctor Only' | 'Clinic Staff' | 'Patient Visible';
}

export interface DoctorLeave {
  id: string;
  doctorId: string;
  doctorName?: string;
  branchId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  doctorId: string;
  branchId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  reason: 'Meeting' | 'Emergency' | 'Maintenance' | 'Personal' | string;
  createdAt: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string; // e.g. "Acute Upper Respiratory Infection", "Type 2 Diabetes Routine"
  category: string;
  diagnosisDefault: string;
  items: PrescriptionItem[];
  adviceDefault: string;
  doctorId?: string;
  organizationId?: string;
}

export interface MedicalCertificate {
  id: string;
  certificateNumber: string;
  type: 'Medical Certificate' | 'Fitness Certificate' | 'Sick Leave' | 'Referral Letter';
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  consultationId?: string;
  issuedDate: string;
  diagnosis: string;
  restDays?: number;
  startDate?: string;
  endDate?: string;
  content: string;
  status: 'Draft' | 'Issued' | 'Cancelled';
  createdAt: string;
}

export interface OperationalQueueItem {
  tokenNumber: number;
  tokenCode: string; // e.g. "A001"
  appointmentId: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  specialtyName: string;
  visitType: VisitType;
  checkInTime: string;
  status: 'Checked In' | 'Waiting' | 'Called' | 'In Consultation' | 'Completed' | 'No Show' | 'Cancelled';
  waitTimeMinutes: number;
  roomNumber?: string;
  isWalkIn?: boolean;
}

// ============================================================
// PHASE 7: ADVANCED ADMINISTRATION, HR & MULTI-BRANCH MODELS
// ============================================================

export interface Department {
  id: string;
  organizationId: string;
  branchId: string;
  name: string;
  code: string;
  description: string;
  headId?: string;
  headName?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type EmploymentType = 'Full Time' | 'Full-Time' | 'Part Time' | 'Contract' | 'Intern' | 'Other';
export type StaffStatus = 'Active' | 'Inactive' | 'On Leave' | 'Suspended';

export interface EmployeeProfile {
  id: string;
  employeeId: string; // EMP-2026-001
  organizationId: string;
  branchId: string;
  branchName: string;
  name: string;
  photo?: string;
  avatar?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship?: string;
  emergencyContact?: string;
  departmentId: string;
  departmentName: string;
  role: UserRole;
  designation?: string;
  joiningDate: string;
  dateOfJoining?: string;
  employmentType: EmploymentType;
  status: StaffStatus;
  notes?: string;
  createdAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  title: string;
  category: 'ID Document' | 'Contract' | 'Certificate' | 'Qualification' | 'Other';
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface EmployeeShift {
  id: string;
  name: string; // Morning, General, Evening, Night
  startTime: string; // 08:00
  endTime: string;   // 16:00
  breakMinutes: number;
  gracePeriodMinutes: number;
  branchId: string;
  status: 'Active' | 'Inactive';
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave' | 'Holiday' | 'Weekend' | 'Remote';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  clockIn?: string; // HH:mm
  clockOut?: string; // HH:mm
  workedDurationMinutes?: number;
  status: AttendanceStatus;
  notes?: string;
}

export interface LeaveType {
  id: string;
  name: string; // Casual, Sick, Earned, Unpaid
  code: string;
  daysAllowed: number;
  carryForward: boolean;
  status: 'Active' | 'Inactive';
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  branchId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface EmployeeCompensation {
  id: string;
  employeeId: string;
  employeeName: string;
  currency: string;
  baseSalary: number;
  paymentFrequency: 'Monthly' | 'Bi-Weekly' | 'Hourly';
  allowances: { name: string; amount: number; isTaxable: boolean }[];
  deductions: { name: string; amount: number }[];
  effectiveDate: string;
  status: 'Active' | 'Superseded';
  bankAccountMasked?: string;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
}

export interface UserBranchAccess {
  userId: string;
  primaryBranchId: string;
  authorizedBranchIds: string[];
}

export interface UserSession {
  id: string | number;
  userId: string | number;
  userName?: string;
  userRole?: UserRole | string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  location?: string;
  lastActive?: string;
  lastUsedAt?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt?: string;
  isCurrent?: boolean;
}

export interface LoginHistoryRecord {
  id: string | number;
  userId?: string | number;
  email: string;
  role?: string;
  timestamp: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  loginMethod: 'Password' | '2FA' | 'SSO' | 'Token' | string;
  failureReason?: string;
}

export interface SecurityEvent {
  id: string | number;
  type: 'PASSWORD_CHANGE' | '2FA_TOGGLED' | 'SESSION_REVOKED' | 'FAILED_LOGIN_SPIKE' | 'ROLE_MODIFIED';
  userId?: string | number;
  userName?: string;
  details: string;
  ipAddress?: string;
  timestamp?: string;
}

export interface BackupJob {
  id: string;
  provider: 'Local Storage' | 'GCS Cloud' | 'AWS S3' | 'SFTP';
  schedule: 'Daily' | 'Weekly' | 'Manual';
  retentionDays: number;
  encryptionEnabled: boolean;
  status: 'Completed' | 'Running' | 'Failed' | 'Scheduled';
  sizeBytes: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface ExportJob {
  id: string;
  type: 'Patients' | 'Appointments' | 'Billing' | 'CRM' | 'Lab' | 'Pharmacy' | 'Inventory' | 'HR' | 'Audit Logs';
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed' | 'Expired';
  requestedBy: string;
  format: 'CSV' | 'JSON' | 'ZIP';
  rowCount?: number;
  downloadUrl?: string;
  expiresAt: string;
  createdAt: string;
}

export interface IntegrationConfig {
  id: string;
  key: 'email' | 'sms' | 'whatsapp' | 'payment_gateway' | 'storage' | 'backup' | 'telemedicine';
  name: string;
  provider: string;
  isEnabled: boolean;
  isConnected: boolean;
  configMasked: Record<string, string>;
  lastTestedAt?: string;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyMasked: string;
  scope: string[];
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  status: 'Active' | 'Revoked';
}

export interface WebhookRecord {
  id: string;
  name: string;
  endpointUrl: string;
  events: string[];
  status: 'Active' | 'Disabled';
  signingSecretMasked: string;
  lastDeliveryAt?: string;
  successCount: number;
  failureCount: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  isGlobalEnabled: boolean;
  organizationOverrides?: Record<string, boolean>;
}

export interface SaaSPlan {
  id: string;
  name: 'Starter' | 'Professional' | 'Enterprise';
  priceMonthly: number;
  maxBranches: number;
  maxUsers: number;
  maxDoctors: number;
  maxPatients: number;
  maxAppointmentsMonthly: number;
  maxStorageGB: number;
  features: string[];
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  planId: string;
  planName: string;
  status: 'Trial' | 'Active' | 'Past Due' | 'Suspended' | 'Cancelled';
  startDate: string;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
}

export interface UsageMetricRecord {
  organizationId: string;
  metric: 'users' | 'doctors' | 'branches' | 'patients' | 'appointments_this_month' | 'storage_gb' | 'campaigns';
  currentUsage: number;
  planLimit: number;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  targetOrganizationIds: string[];
  startAt: string;
  endAt: string;
  status: 'Active' | 'Draft' | 'Expired' | 'Archived';
}

// ============================================================
// PHASE 8: TELEMEDICINE, INSURANCE & CLINICAL SAFETY MODELS
// ============================================================

export type TelemedicineStatus = 
  | 'Scheduled' 
  | 'Waiting for Doctor' 
  | 'Waiting for Patient' 
  | 'Doctor Joined' 
  | 'Patient Joined' 
  | 'In Progress' 
  | 'Completed' 
  | 'No Show' 
  | 'Cancelled' 
  | 'Expired';

export interface TelemedicineRoom {
  id: string;
  appointmentId: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  scheduledStartTime: string;
  status: TelemedicineStatus;
  roomId: string;
  roomTokenDoctor: string;
  roomTokenPatient: string;
  doctorJoinedAt?: string;
  patientJoinedAt?: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  durationMinutes?: number;
  consultationNotes?: string;
  prescriptionId?: string;
  consultationId?: string;
}

export interface TelemedicineMessage {
  id: string;
  roomId: string;
  senderRole: 'DOCTOR' | 'PATIENT' | 'SYSTEM';
  senderName: string;
  content: string;
  timestamp: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface TelemedicineEvent {
  id: string;
  roomId: string;
  eventType: 'ROOM_CREATED' | 'DOCTOR_JOINED' | 'PATIENT_JOINED' | 'CALL_STARTED' | 'CALL_ENDED' | 'SCREEN_SHARE_TOGGLED';
  timestamp: string;
  details?: string;
  metadata?: any;
}

// --- Insurance & TPA ---
export interface InsuranceProvider {
  id: string;
  name: string;
  code: string;
  tpaName: string;
  contactPerson: string;
  phone: string;
  email: string;
  portalUrl?: string;
  claimSubmissionMethod: 'Online Portal' | 'Email EDI' | 'API' | 'Physical Dispatch';
  status: 'Active' | 'Inactive';
}

export interface InsurancePolicy {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  tpaName?: string;
  policyNumber: string;
  memberId: string;
  planName: string;
  coverageLimit: number;
  remainingBalance: number;
  validFrom: string;
  validUntil: string;
  status: 'Active' | 'Expired' | 'Suspended' | 'Pending Verification';
}

export type PreAuthStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Partially Approved' | 'Rejected' | 'Expired' | 'Cancelled';

export interface PreAuthorization {
  id: string;
  preauthNumber: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  policyNumber: string;
  requestedProcedure: string;
  estimatedCost: number;
  doctorId: string;
  doctorName: string;
  clinicalJustification: string;
  documents: string[];
  status: PreAuthStatus;
  approvedAmount?: number;
  approvalNumber?: string;
  validUntil?: string;
  reviewerRemarks?: string;
  submittedAt?: string;
  decidedAt?: string;
  createdAt: string;
}

export type ClaimStatus = 
  | 'Draft' 
  | 'Ready for Submission' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Query Raised' 
  | 'Approved' 
  | 'Partially Approved' 
  | 'Rejected' 
  | 'Settled' 
  | 'Closed';

export interface InsuranceClaim {
  id: string;
  claimNumber: string; // CLM-2026-001
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  policyNumber: string;
  memberId: string;
  invoiceId: string;
  invoiceNumber: string;
  servicesSummary: string;
  totalClaimAmount: number;
  approvedAmount?: number;
  patientCopayAmount?: number;
  rejectedAmount?: number;
  settlementStatus: 'Unsettled' | 'Partially Settled' | 'Settled';
  status: ClaimStatus;
  queryDetails?: string;
  queryResponse?: string;
  submissionDate?: string;
  settlementDate?: string;
  paymentReference?: string;
  documents: { title: string; fileUrl: string; category: string }[];
  createdAt: string;
}

export interface ClaimSettlement {
  id: string;
  claimId: string;
  claimNumber: string;
  invoiceId: string;
  totalInvoice: number;
  approvedByInsurance: number;
  patientCopay: number;
  rejectedPortion: number;
  insuranceSettlementRef: string;
  settledAt: string;
  recordedBy: string;
}

// --- Doctor Shifts & Roster ---
export type ShiftType = 'Morning' | 'General' | 'Evening' | 'Night' | 'On Call' | 'Emergency';

export interface DoctorShift {
  id: string;
  shiftType: ShiftType;
  date: string; // YYYY-MM-DD
  startTime: string; // 08:00
  endTime: string;   // 16:00
  doctorId: string;
  doctorName: string;
  branchId: string;
  branchName: string;
  departmentId?: string;
  departmentName?: string;
  isOnCall: boolean;
  status: 'Scheduled' | 'Active' | 'Completed' | 'Swapped' | 'Cancelled';
}

export interface OnCallRoster {
  id: string;
  date: string;
  department: string;
  branchId: string;
  branchName: string;
  primaryDoctorId: string;
  primaryDoctorName: string;
  primaryDoctorPhone: string;
  backupDoctorId: string;
  backupDoctorName: string;
  backupDoctorPhone: string;
  status: 'Published' | 'Draft';
}

export interface ShiftConflict {
  type: 'LEAVE_CONFLICT' | 'APPOINTMENT_OVERLAP' | 'DOUBLE_BOOKING' | 'BRANCH_MISMATCH';
  message: string;
  shiftId?: string;
  doctorId: string;
}

// --- Prescription Clinical Safety Checks ---
export type WarningSeverity = 'Information' | 'Warning' | 'High' | 'Critical';
export type SafetyWarningType = 'ALLERGY' | 'INTERACTION' | 'DUPLICATE_THERAPY' | 'DOSAGE_RANGE';

export interface DrugSafetyWarning {
  id: string;
  prescriptionItemId?: string;
  medicineName: string;
  warningType: SafetyWarningType;
  severity: WarningSeverity;
  reason: string;
  relatedMedicationOrAllergen: string;
  recommendation: string;
  isDismissed: boolean;
  isOverridden: boolean;
  overrideReason?: string;
  overriddenByDoctorId?: string;
  overriddenAt?: string;
}

export interface DrugSafetyEvent {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  prescriptionId?: string;
  medicineName: string;
  warningType: string;
  severity: string;
  reason: string;
  actionTaken: 'REVIEWED' | 'DISMISSED' | 'MEDICINE_CHANGED' | 'OVERRIDDEN';
  overrideReason?: string;
  timestamp: string;
}

// --- Observability & Background Jobs ---
export interface BackgroundJobRecord {
  id: string;
  queue: 'Notifications' | 'Campaigns' | 'Appointment Reminders' | 'Data Exports' | 'Telemedicine Events' | 'Insurance Sync';
  jobName: string;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Retrying';
  attemptCount: number;
  maxAttempts: number;
  payloadSummary: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface SystemHealthCheck {
  service: 'API Server' | 'Database' | 'Redis Queue' | 'Object Storage' | 'Email Provider' | 'SMS Provider' | 'WhatsApp Gateway' | 'Payment Gateway' | 'Telemedicine WebRTC';
  status: 'Healthy' | 'Warning' | 'Down';
  latencyMs: number;
  lastCheckedAt: string;
  message?: string;
}

// ==========================================
// PHASE 10: ADVANCED PATIENT EXPERIENCE & OPERATIONAL WORKFLOWS
// ==========================================

// 1. Flexible Employee & Responsibility Model
export interface EmployeeResponsibilityAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  role: UserRole;
  responsibilities: string[]; // e.g. Triage Nurse, Phlebotomist, Cashier, OPD Coordinator, Vaccinator
  departmentIds: string[];
  departmentNames: string[];
  branchIds: string[];
  branchNames: string[];
  shiftIds: string[];
  shiftNames: string[];
  customPermissions: string[];
  currentAssignmentStatus: 'Available' | 'Assigned' | 'In Consultation' | 'On Break' | 'Offline';
  workloadScore: number; // Active tasks count
  maxConcurrentTasks: number;
  contactPhone: string;
  contactEmail: string;
  updatedAt: string;
}

export interface OperationalTaskQueueItem {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  category: 'Clinical Triage' | 'Phlebotomy' | 'Dispensing' | 'Payment Collection' | 'Service Recovery' | 'Record Request' | 'Follow-up Call' | 'Administrative' | 'Pre-Auth';
  requiredResponsibility: string;
  branchId: string;
  branchName: string;
  departmentId: string;
  departmentName: string;
  shiftName?: string;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Escalated' | 'Cancelled';
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  patientId?: string;
  patientName?: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  escalationLevel: number; // 0=None, 1=Level 1, 2=Level 2, 3=Level 3
  escalatedTo?: string;
  escalationReason?: string;
  reassignmentHistory: {
    fromEmployeeId?: string;
    fromEmployeeName?: string;
    toEmployeeId: string;
    toEmployeeName: string;
    reason: string;
    reassignedBy: string;
    timestamp: string;
  }[];
}

// 2. Digital Patient Intake
export interface DigitalPatientIntake {
  id: string;
  intakeNumber: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship: string;
  appointmentId?: string;
  preferredDoctorId?: string;
  submittedAt: string;
  status: 'Draft' | 'Submitted' | 'Verified' | 'Attached to Chart';
  chiefComplaint: string;
  symptomDuration: string;
  painScale: number; // 0-10
  medicalConditions: string[];
  allergies: string[];
  currentMedications: { name: string; dose: string; frequency: string }[];
  pastSurgeries: string[];
  familyHistory: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  consentSigned: boolean;
  consentSignedAt?: string;
  consentSignatureName?: string;
  documentsUploaded: { id: string; name: string; url: string; category: string }[];
  verifiedBy?: string;
  verifiedAt?: string;
}

// 3. Care Plans & Chronic Care
export interface CarePlanGoal {
  id: string;
  description: string;
  targetMetric: string;
  currentValue: string;
  targetDate: string;
  status: 'In Progress' | 'Achieved' | 'Off Track';
}

export interface CarePlanTask {
  id: string;
  title: string;
  frequency: 'Daily' | 'Twice Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly';
  instructions: string;
  assignedRole: 'Patient' | 'Nurse' | 'Doctor';
  status: 'Active' | 'Completed';
  lastLoggedDate?: string;
}

export interface CarePlan {
  id: string;
  planNumber: string;
  patientId: string;
  patientName: string;
  condition: string;
  category: 'Chronic Disease Management' | 'Post-Op Recovery' | 'Preventive Wellness' | 'Maternal Care';
  managingDoctorId: string;
  managingDoctorName: string;
  startDate: string;
  endDate?: string;
  reviewIntervalDays: number;
  nextReviewDate: string;
  status: 'Active' | 'Under Review' | 'Achieved' | 'Suspended' | 'Discontinued';
  goals: CarePlanGoal[];
  tasks: CarePlanTask[];
  medications: { medicineName: string; dosage: string; frequency: string; notes: string }[];
  investigations: { testName: string; schedule: string; lastDoneDate?: string }[];
  patientInstructions: string;
  monitoringMetrics: { metricName: string; unit: string; targetRange: string }[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 4. Clinical Referrals (Internal & External)
export interface ClinicalReferral {
  id: string;
  referralNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  referralType: 'Internal' | 'External';
  referringDoctorId: string;
  referringDoctorName: string;
  referringBranchId: string;
  referringBranchName: string;
  targetSpecialty: string;
  targetDoctorName?: string;
  externalFacilityName?: string;
  externalContactPhone?: string;
  reason: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Pending' | 'Sent' | 'Accepted' | 'Consultation Scheduled' | 'Completed' | 'Rejected';
  clinicalSummary: string;
  attachments: { title: string; fileUrl: string }[];
  linkedAppointmentId?: string;
  feedbackFromReceivingDoctor?: string;
  createdDate: string;
  scheduledDate?: string;
  completedDate?: string;
}

// 5. Medical Record Requests
export interface MedicalRecordRequest {
  id: string;
  requestNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  requestType: 'Complete Medical History' | 'Diagnostic Lab Reports' | 'Prescription Records' | 'Discharge Summary' | 'Insurance Claim Abstract' | 'Vaccination Certificate';
  dateRange: string;
  purpose: 'Personal Records' | 'Insurance Claim' | 'Second Medical Opinion' | 'Legal / Regulatory' | 'Employment / Travel';
  deliveryChannel: 'Patient Portal Download' | 'Encrypted Email' | 'Physical Pickup at Branch';
  pickupBranchId?: string;
  pickupBranchName?: string;
  status: 'Submitted' | 'Under Review' | 'Processing' | 'Approved & Dispatched' | 'Rejected';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  dispatchedAt?: string;
  downloadUrl?: string;
  idProofAttached: boolean;
  notes?: string;
}

// 6. Configurable Notification Engine Models
export interface NotificationEngineConfig {
  notificationsEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsAppEnabled: boolean;
  defaultChannel: 'Email' | 'In-App' | 'WhatsApp' | 'SMS';
  whatsAppProvider: 'simulation' | 'meta-cloud-api' | 'twilio-whatsapp';
  whatsAppAccessToken?: string;
  whatsAppPhoneNumberId?: string;
  whatsAppBusinessAccountId?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
  posPaymentsEnabled: boolean;
  posProvider?: string;
  posTerminalId?: string;
  posMerchantId?: string;
  posCurrency: string;
  upiPaymentsEnabled: boolean;
  upiMerchantName?: string;
  upiMerchantVpa?: string;
  upiProvider?: string;
  paymentGatewayEnabled: boolean;
  paymentGatewayProvider?: string;
  paymentGatewayMerchantId?: string;
  paymentGatewayEnvironment: 'sandbox' | 'production';
}

export interface SystemNotificationEntry {
  id: string;
  event: string;
  recipient: string;
  recipientName?: string;
  recipientType: 'PATIENT' | 'DOCTOR' | 'STAFF' | 'ADMIN' | 'BACKOFFICE';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  channel: 'In-App' | 'Email' | 'WhatsApp' | 'SMS';
  templateName: string;
  subject?: string;
  content: string;
  createdTime: string;
  sentTime?: string;
  deliveryStatus: 'Queued' | 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Skipped';
  readStatus: boolean;
  failureReason?: string;
  retryCount: number;
  providerResponse?: string;
  relatedPatientId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// 7. POS Terminals & Payment Reconciliation
export interface PosTerminalConfig {
  id: string;
  terminalId: string;
  merchantId: string;
  branchId: string;
  branchName: string;
  counterName: string;
  provider: string; // e.g. "Pine Labs Plutus", "HDFC Ingenico", "Paytm Smart POS"
  status: 'Active' | 'Maintenance' | 'Offline';
  dailyBatchNumber: string;
  totalTransactionsToday: number;
  totalCollectedToday: number;
}

export interface PaymentReconciliationBatch {
  id: string;
  batchNumber: string;
  date: string;
  branchId: string;
  branchName: string;
  settlementMethod: 'UPI' | 'POS Card' | 'Cash' | 'Payment Gateway' | 'Bank Transfer';
  totalTransactions: number;
  recordedAmount: number;
  bankSettledAmount: number;
  variance: number;
  status: 'Reconciled' | 'Discrepancy Detected' | 'Pending Review' | 'Adjusted';
  notes?: string;
  reconciledBy: string;
  reconciledAt: string;
}

export interface PaymentRefundRecord {
  id: string;
  refundNumber: string;
  paymentRecordId: string;
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  originalAmount: number;
  refundAmount: number;
  refundType: 'Full Refund' | 'Partial Refund';
  refundMethod: 'Original Payment Method' | 'Bank Transfer' | 'Cash' | 'Clinic Credit';
  reason: string;
  originalTransactionRef: string;
  refundTransactionRef: string;
  status: 'Requested' | 'Approved' | 'Processed' | 'Rejected';
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  processedAt?: string;
  auditNotes: string;
  createdAt: string;
}

// 8. Visual Workflow & Deterministic Rules
export interface DeterministicWorkflowRule {
  id: string;
  name: string;
  category: 'Appointment' | 'Registration' | 'Check-in' | 'Consultation' | 'Lab' | 'Pharmacy' | 'Billing' | 'Payment' | 'Refund' | 'Referral' | 'Follow-up' | 'Medical Records' | 'Complaints' | 'Backoffice Alert';
  triggerEvent: string;
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'is_true' | 'is_false' | 'contains';
    value: any;
  }[];
  actions: {
    type: 'send_patient_notification' | 'send_staff_notification' | 'send_backoffice_whatsapp' | 'create_staff_task' | 'update_invoice_balance' | 'generate_receipt' | 'schedule_followup' | 'apply_tag';
    config: Record<string, any>;
  }[];
  priority: 'Normal' | 'High' | 'Critical';
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: string;
}

// 9. System Technical Settings & Demo Data Management
export interface SystemTechnicalSettings {
  demoDataEnabled: boolean;
  clinicName?: string;
  defaultTaxRate?: number;
  billingCurrency?: string;
  slotDurationMinutes?: number;
  databaseEngine?: 'postgresql' | 'mysql' | 'sqlite';
  databaseHost?: string;
  databasePort?: number;
  databaseName?: string;
  databaseUser?: string;
  sslMode?: 'require' | 'verify-full' | 'prefer' | 'disable';
  connectionPoolMax?: number;
  slowQueryThresholdMs?: number;
  backupAutomated?: boolean;
  databaseConfig?: {
    driver: 'PostgreSQL' | 'MySQL';
    host: string;
    port: number;
    database: string;
    user: string;
    ssl: boolean;
    poolMax: number;
    connectionTimeoutMillis: number;
  };
  emailConfig?: {
    enabled: boolean;
    provider: 'smtp-nodemailer-ses' | 'sendgrid' | 'resend';
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    senderName: string;
    senderEmail: string;
    replyToEmail: string;
  };
  smsConfig?: {
    enabled: boolean;
    provider: 'twilio-sms' | 'aws-sns' | 'simulation';
    accountSid: string;
    fromNumber: string;
  };
  whatsAppConfig?: {
    enabled: boolean;
    provider: 'meta-whatsapp-business-api' | 'twilio' | 'simulation';
    phoneNumberId: string;
    businessAccountId: string;
  };
  securityConfig?: {
    sessionTimeoutMinutes: number;
    enforceMfa: boolean;
    passwordMinLength: number;
    maxLoginAttempts: number;
    ipAllowlist: string[];
    enableRateLimiting: boolean;
  };
  integrationsConfig?: {
    posEnabled: boolean;
    posTerminalId: string;
    posMerchantId: string;
    upiEnabled: boolean;
    upiMerchantVpa: string;
    gatewayEnabled: boolean;
    gatewayProvider: string;
    storageProvider: string;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface DemoDataStats {
  demoDataEnabled: boolean;
  isDemoDataEnabled?: boolean;
  patients?: { total: number; demo: number; production: number };
  appointments?: { total: number; demo: number; production: number };
  invoices?: { total: number; demo: number; production: number };
  doctors?: { total: number; demo: number; production: number };
  inventory?: { total: number; demo: number; production: number };
  leads?: { total: number; demo: number; production: number };
  staff?: { total: number; demo: number; production: number };
  totalPatients?: number;
  demoPatients?: number;
  prodPatients?: number;
  totalAppointments?: number;
  demoAppointments?: number;
  prodAppointments?: number;
  totalInvoices?: number;
  demoInvoices?: number;
  prodInvoices?: number;
  totalDoctors?: number;
  demoDoctors?: number;
  prodDoctors?: number;
  totalInventory?: number;
  demoInventory?: number;
  prodInventory?: number;
  totalLeads?: number;
  demoLeads?: number;
  prodLeads?: number;
  totalStaff?: number;
  demoStaff?: number;
  prodStaff?: number;
}



