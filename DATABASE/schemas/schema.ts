import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  jsonb,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';

// ==========================================
// 1. ORGANIZATIONS & BRANCHES (MULTI-TENANT)
// ==========================================

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  legalName: varchar('legal_name', { length: 255 }),
  taxId: varchar('tax_id', { length: 100 }),
  email: text('email'),
  contactEmail: varchar('contact_email', { length: 255 }),
  phone: text('phone'),
  contactPhone: varchar('contact_phone', { length: 50 }),
  logoUrl: text('logo_url'),
  website: varchar('website', { length: 255 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 50 }),
  country: varchar('country', { length: 100 }).default('India'),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  settings: text('settings'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 100 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 50 }),
  zipCode: text('zip_code'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  workingHours: text('working_hours'),
  operatingHours: text('operating_hours'),
  isMainBranch: boolean('is_main_branch').default(false).notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  settings: text('settings'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 2. ROLES, PERMISSIONS & USERS
// ==========================================

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(), // Super Admin, Clinic Admin, Doctor, Receptionist, Nurse, Lab Technician, Pharmacist, Accountant, Patient
  displayName: text('display_name'),
  description: text('description'),
  isSystem: boolean('is_system').default(true),
  isSystemRole: boolean('is_system_role').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  resource: varchar('resource', { length: 255 }),
  action: varchar('action', { length: 255 }),
  code: text('code'),
  module: text('module'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id')
    .references(() => roles.id, { onDelete: 'cascade' })
    .notNull(),
  permissionId: integer('permission_id')
    .references(() => permissions.id, { onDelete: 'cascade' })
    .notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  roleId: integer('role_id')
    .references(() => roles.id)
    .notNull(),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  themePreference: varchar('theme_preference', { length: 50 }).default('system').notNull(),
  mustChangePassword: boolean('must_change_password').default(false).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  uid: text('uid'),
  organizationId: integer('organization_id'),
  branchId: integer('branch_id'),
  name: text('name'),
  phone: text('phone'),
});

export const userSessions = pgTable('user_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  userEmail: varchar('user_email', { length: 255 }),
  action: varchar('action', { length: 255 }).notNull(),
  resource: varchar('resource', { length: 255 }).notNull(),
  resourceId: varchar('resource_id', { length: 255 }),
  metadata: text('metadata'),
  ipAddress: varchar('ip_address', { length: 100 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 3. SPECIALTIES & DOCTORS
// ==========================================

export const specialties = pgTable('specialties', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  organizationId: integer('organization_id')
    .references(() => organizations.id, { onDelete: 'cascade' }),
  specialtyId: varchar('specialty_id', { length: 64 }),
  fullName: varchar('full_name', { length: 255 }),
  name: text('name'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  specialization: varchar('specialization', { length: 255 }),
  licenseNumber: varchar('license_number', { length: 100 }),
  qualification: text('qualification'),
  experienceYears: integer('experience_years').default(0),
  bio: text('bio'),
  consultationFee: integer('consultation_fee').default(0),
  avatarUrl: text('avatar_url'),
  roomNumber: text('room_number'),
  status: varchar('status', { length: 50 }).default('ACTIVE'),
  title: text('title'),
  regNumber: text('reg_number'),
  avatar: text('avatar'),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('4.9'),
  reviewCount: integer('review_count').default(0),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const doctorBranchAssignments = pgTable('doctor_branch_assignments', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id')
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id')
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  branchConsultationFee: integer('branch_consultation_fee'),
  roomNumber: varchar('room_number', { length: 100 }),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  effectiveFrom: timestamp('effective_from'),
  effectiveTo: timestamp('effective_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const doctorSchedules = pgTable('doctor_schedules', {
  id: serial('id').primaryKey(),
  doctorBranchAssignmentId: integer('doctor_branch_assignment_id')
    .references(() => doctorBranchAssignments.id, { onDelete: 'cascade' }),
  doctorId: integer('doctor_id')
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  branchId: integer('branch_id')
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  dayOfWeek: varchar('day_of_week', { length: 20 }).notNull(),
  sessionName: varchar('session_name', { length: 100 }),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),
  slotDurationMinutes: integer('slot_duration_minutes').default(15).notNull(),
  maxPatients: integer('max_patients').default(20).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ==========================================
// 4. PATIENTS & MEDICAL PROFILES
// ==========================================

export const patients = pgTable('patients', {
  id: varchar('id', { length: 64 }).primaryKey(),
  patientId: text('patient_id').notNull().unique(), // e.g. "PT-2026-001"
  userId: varchar('user_id', { length: 64 })
    .references(() => users.id, { onDelete: 'set null' }),
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'set null' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  gender: text('gender').notNull(), // Male, Female, Other
  bloodGroup: text('blood_group').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zipCode: text('zip_code').notNull(),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelation: text('emergency_contact_relation'),
  insuranceProvider: text('insurance_provider'),
  insurancePolicyNumber: text('insurance_policy_number'),
  allergies: jsonb('allergies').$type<string[]>().default([]),
  medicalConditions: jsonb('medical_conditions').$type<string[]>().default([]),
  currentMedications: jsonb('current_medications').$type<string[]>().default([]),
  category: text('category').default('Regular').notNull(), // Regular, VIP, Senior Citizen, Chronic Care, New
  registeredDate: text('registered_date').notNull(),
  totalVisits: integer('total_visits').default(0).notNull(),
  totalSpent: numeric('total_spent', { precision: 12, scale: 2 }).default('0.00').notNull(),
  notes: text('notes'),
  avatar: text('avatar'),
  status: text('status').default('Active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const vitals = pgTable('vitals', {
  id: varchar('id', { length: 64 }).primaryKey(),
  patientId: varchar('patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  recordedBy: text('recorded_by'),
  bloodPressureSys: integer('blood_pressure_sys'),
  bloodPressureDia: integer('blood_pressure_dia'),
  pulseRate: integer('pulse_rate'),
  temperature: numeric('temperature', { precision: 4, scale: 1 }),
  weightKg: numeric('weight_kg', { precision: 5, scale: 1 }),
  heightCm: numeric('height_cm', { precision: 5, scale: 1 }),
  bmi: numeric('bmi', { precision: 4, scale: 1 }),
  spo2: integer('spo2'),
  respiratoryRate: integer('respiratory_rate'),
  notes: text('notes'),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

// ==========================================
// 5. APPOINTMENTS & QUEUE MANAGEMENT
// ==========================================

export const appointments = pgTable('appointments', {
  id: varchar('id', { length: 64 }).primaryKey(),
  appointmentNumber: text('appointment_number').notNull().unique(), // e.g. "APT-2026-001"
  tokenNumber: integer('token_number').notNull(),                   // 1, 2, 3...
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  patientId: varchar('patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: varchar('doctor_id', { length: 64 })
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  date: text('date').notNull(), // "YYYY-MM-DD"
  timeSlot: text('time_slot').notNull(), // "10:30 AM"
  durationMinutes: integer('duration_minutes').default(15).notNull(),
  visitType: text('visit_type').default('In Clinic').notNull(), // In Clinic, Video Consultation, Home Visit
  status: text('status').default('Confirmed').notNull(), // Pending, Confirmed, Checked In, Waiting, In Consultation, Completed, Cancelled, No Show, Rescheduled
  chiefComplaint: text('chief_complaint').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const appointmentStatusHistory = pgTable('appointment_status_history', {
  id: serial('id').primaryKey(),
  appointmentId: varchar('appointment_id', { length: 64 })
    .references(() => appointments.id, { onDelete: 'cascade' })
    .notNull(),
  fromStatus: text('from_status'),
  toStatus: text('to_status').notNull(),
  changedBy: text('changed_by'),
  reason: text('reason'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// ==========================================
// 6. CONSULTATIONS & PRESCRIPTIONS
// ==========================================

export const consultations = pgTable('consultations', {
  id: varchar('id', { length: 64 }).primaryKey(),
  consultationNumber: text('consultation_number').notNull().unique(), // "CNS-2026-001"
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'cascade' }),
  appointmentId: varchar('appointment_id', { length: 64 })
    .references(() => appointments.id, { onDelete: 'set null' }),
  patientId: varchar('patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: varchar('doctor_id', { length: 64 })
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  date: text('date').notNull(),
  chiefComplaint: text('chief_complaint').notNull(),
  symptoms: jsonb('symptoms').$type<string[]>().default([]),
  clinicalExamination: text('clinical_examination'),
  diagnosis: text('diagnosis').notNull(),
  icdCode: text('icd_code'),
  treatmentPlan: text('treatment_plan'),
  doctorNotes: text('doctor_notes'),
  advice: text('advice'),
  investigationsRequired: jsonb('investigations_required').$type<string[]>().default([]),
  followUpDate: text('follow_up_date'),
  status: text('status').default('Completed').notNull(), // Draft, Completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const prescriptions = pgTable('prescriptions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  prescriptionNumber: text('prescription_number').notNull().unique(), // "RX-2026-001"
  consultationId: varchar('consultation_id', { length: 64 })
    .references(() => consultations.id, { onDelete: 'set null' }),
  appointmentId: varchar('appointment_id', { length: 64 })
    .references(() => appointments.id, { onDelete: 'set null' }),
  patientId: varchar('patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: varchar('doctor_id', { length: 64 })
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  diagnosis: text('diagnosis').notNull(),
  advice: text('advice'),
  followUpDate: text('follow_up_date'),
  doctorSignature: text('doctor_signature'),
  status: text('status').default('Issued').notNull(), // Draft, Issued, Cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const prescriptionItems = pgTable('prescription_items', {
  id: varchar('id', { length: 64 }).primaryKey(),
  prescriptionId: varchar('prescription_id', { length: 64 })
    .references(() => prescriptions.id, { onDelete: 'cascade' })
    .notNull(),
  medicineName: text('medicine_name').notNull(),
  genericName: text('generic_name'),
  strength: text('strength'),
  dosage: text('dosage').notNull(),
  route: text('route').default('Oral').notNull(),
  frequency: text('frequency').notNull(),
  duration: text('duration').notNull(),
  timing: text('timing').notNull(),
  instructions: text('instructions'),
});

// ==========================================
// 7. SERVICES, PACKAGES & LABS
// ==========================================

export const serviceItems = pgTable('service_items', {
  id: varchar('id', { length: 64 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // Consultation, Diagnostics, Procedures, Therapy, Vaccination, Lab
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer('duration_minutes').default(15).notNull(),
  active: boolean('active').default(true).notNull(),
});

export const healthPackages = pgTable('health_packages', {
  id: varchar('id', { length: 64 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  tagline: text('tagline').notNull(),
  description: text('description').notNull(),
  servicesIncluded: jsonb('services_included').$type<string[]>().default([]),
  originalPrice: numeric('original_price', { precision: 10, scale: 2 }).notNull(),
  discountedPrice: numeric('discounted_price', { precision: 10, scale: 2 }).notNull(),
  testCount: integer('test_count').notNull(),
  popular: boolean('popular').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
});

export const labTests = pgTable('lab_tests', {
  id: varchar('id', { length: 64 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  code: text('code').notNull(),
  category: text('category').notNull(), // Hematology, Biochemistry, Microbiology, Radiology, Pathology, Cardiology
  normalRange: text('normal_range').notNull(),
  units: text('units').notNull(),
  sampleType: text('sample_type').notNull(),
  tatHours: integer('tat_hours').default(24).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  active: boolean('active').default(true).notNull(),
});

export const labOrders = pgTable('lab_orders', {
  id: varchar('id', { length: 64 }).primaryKey(),
  orderNumber: text('order_number').notNull().unique(), // "LAB-2026-001"
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'cascade' }),
  patientId: varchar('patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: varchar('doctor_id', { length: 64 })
    .references(() => doctors.id, { onDelete: 'cascade' })
    .notNull(),
  appointmentId: varchar('appointment_id', { length: 64 })
    .references(() => appointments.id, { onDelete: 'set null' }),
  consultationId: varchar('consultation_id', { length: 64 })
    .references(() => consultations.id, { onDelete: 'set null' }),
  date: text('date').notNull(),
  status: text('status').default('Ordered').notNull(), // Ordered, Sample Collected, Processing, Completed, Reviewed, Delivered
  sampleCollectedAt: timestamp('sample_collected_at'),
  completedAt: timestamp('completed_at'),
  reviewedByDoctor: boolean('reviewed_by_doctor').default(false).notNull(),
  reportFileUrl: text('report_file_url'),
  totalCost: numeric('total_cost', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const labOrderItems = pgTable('lab_order_items', {
  id: serial('id').primaryKey(),
  labOrderId: varchar('lab_order_id', { length: 64 })
    .references(() => labOrders.id, { onDelete: 'cascade' })
    .notNull(),
  testId: varchar('test_id', { length: 64 })
    .references(() => labTests.id, { onDelete: 'set null' }),
  testName: text('test_name').notNull(),
  category: text('category'),
  resultValue: text('result_value'),
  normalRange: text('normal_range').notNull(),
  units: text('units').notNull(),
  isAbnormal: boolean('is_abnormal').default(false).notNull(),
  status: text('status').default('Ordered').notNull(),
  remarks: text('remarks'),
});

// ==========================================
// 8. BILLING, INVOICES & PAYMENTS
// ==========================================

export const invoices = pgTable('invoices', {
  id: varchar('id', { length: 64 }).primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(), // "INV-2026-001"
  receiptNumber: text('receipt_number'),                    // "REC-2026-001"
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  patientId: varchar('patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  appointmentId: varchar('appointment_id', { length: 64 })
    .references(() => appointments.id, { onDelete: 'set null' }),
  consultationId: varchar('consultation_id', { length: 64 })
    .references(() => consultations.id, { onDelete: 'set null' }),
  date: text('date').notNull(),
  dueDate: text('due_date').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  discountTotal: numeric('discount_total', { precision: 12, scale: 2 }).default('0.00').notNull(),
  taxTotal: numeric('tax_total', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  balanceAmount: numeric('balance_amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status').default('Issued').notNull(), // Draft, Issued, Partially Paid, Paid, Cancelled, Refunded
  paymentMethod: text('payment_method'),               // Cash, UPI, Card, Online, Insurance
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoiceItems = pgTable('invoice_items', {
  id: varchar('id', { length: 64 }).primaryKey(),
  invoiceId: varchar('invoice_id', { length: 64 })
    .references(() => invoices.id, { onDelete: 'cascade' })
    .notNull(),
  description: text('description').notNull(),
  type: text('type').default('Service').notNull(), // Consultation, Service, Lab, Medicine, Procedure, Package
  quantity: integer('quantity').default(1).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 }).default('0.00').notNull(),
  taxRate: numeric('tax_rate', { precision: 5, scale: 2 }).default('0.00').notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
});

export const payments = pgTable('payments', {
  id: varchar('id', { length: 64 }).primaryKey(),
  paymentNumber: text('payment_number').notNull().unique(), // "PAY-2026-001"
  invoiceId: varchar('invoice_id', { length: 64 })
    .references(() => invoices.id, { onDelete: 'cascade' })
    .notNull(),
  patientId: varchar('patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(), // Cash, UPI, Card, Online, Insurance
  transactionRef: text('transaction_ref'),
  receivedBy: text('received_by'),
  notes: text('notes'),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
});

// ==========================================
// 9. INVENTORY & PHARMACY
// ==========================================

export const inventoryItems = pgTable('inventory_items', {
  id: varchar('id', { length: 64 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  genericName: text('generic_name').notNull(),
  category: text('category').notNull(), // Antibiotics, Analgesics, Cardiovascular, Antidiabetic, etc.
  dosageForm: text('dosage_form').notNull(), // Tablet, Capsule, Syrup, Injection, Ointment, Drops
  sku: text('sku'),
  batchNumber: text('batch_number').notNull(),
  expiryDate: text('expiry_date').notNull(),
  currentStock: integer('current_stock').notNull(),
  minReorderLevel: integer('min_reorder_level').default(10).notNull(),
  unit: text('unit').default('Tablets').notNull(),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }).notNull(),
  sellingPrice: numeric('selling_price', { precision: 10, scale: 2 }).notNull(),
  supplier: text('supplier').notNull(),
  location: text('location'), // Shelf A-1
  status: text('status').default('In Stock').notNull(), // In Stock, Low Stock, Expiring Soon, Out of Stock
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==========================================
// 10. CRM LEADS & FOLLOW-UPS
// ==========================================

export const leads = pgTable('leads', {
  id: varchar('id', { length: 64 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  source: text('source').notNull(), // Website, Google, Facebook, Instagram, WhatsApp, Referral, Walk-in
  interestedService: text('interested_service'),
  assignedStaffName: text('assigned_staff_name'),
  status: text('status').default('New').notNull(), // New, Contacted, Interested, Appointment Booked, Visited, Converted, Lost
  notes: text('notes').notNull(),
  convertedPatientId: varchar('converted_patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const followups = pgTable('followups', {
  id: varchar('id', { length: 64 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'cascade' }),
  patientId: varchar('patient_id', { length: 64 })
    .references(() => patients.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: varchar('doctor_id', { length: 64 })
    .references(() => doctors.id, { onDelete: 'set null' }),
  appointmentId: varchar('appointment_id', { length: 64 })
    .references(() => appointments.id, { onDelete: 'set null' }),
  type: text('type').notNull(), // Post Consultation, Routine Checkup, Test Results, Treatment Review
  dueDate: text('due_date').notNull(),
  status: text('status').default('Pending').notNull(), // Pending, Contacted, Completed, Missed
  priority: text('priority').default('Medium').notNull(), // High, Medium, Low
  notes: text('notes'),
  assignedTo: text('assigned_to'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==========================================
// 12. FINANCIAL MANAGEMENT & ACCOUNT HEADS
// ==========================================

export const accountGroups = pgTable('account_groups', {
  id: varchar('id', { length: 64 }).primaryKey(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: text('name').notNull().unique(), // Assets, Liabilities, Equity, Income, Expenses
  category: text('category').notNull(),  // Asset, Liability, Equity, Revenue, Expense
  normalBalance: text('normal_balance').default('Debit').notNull(), // Debit, Credit
  description: text('description'),
  isSystem: boolean('is_system').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const accountHeads = pgTable('account_heads', {
  id: varchar('id', { length: 64 }).primaryKey(),
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  groupId: varchar('group_id', { length: 64 })
    .references(() => accountGroups.id, { onDelete: 'cascade' })
    .notNull(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  currency: text('currency').default('USD').notNull(),
  currentBalance: numeric('current_balance', { precision: 14, scale: 2 }).default('0.00').notNull(),
  isSystem: boolean('is_system').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const journalEntries = pgTable('journal_entries', {
  id: varchar('id', { length: 64 }).primaryKey(),
  entryNumber: text('entry_number').notNull().unique(), // e.g. "JRN-2026-0001"
  organizationId: varchar('organization_id', { length: 64 })
    .references(() => organizations.id, { onDelete: 'cascade' }),
  branchId: varchar('branch_id', { length: 64 })
    .references(() => branches.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  referenceType: text('reference_type'), // Invoice, Payment, Manual, Inventory, Payroll
  referenceId: text('reference_id'),
  description: text('description').notNull(),
  totalAmount: numeric('total_amount', { precision: 14, scale: 2 }).notNull(),
  status: text('status').default('Posted').notNull(), // Draft, Posted, Voided
  postedBy: text('posted_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const journalLines = pgTable('journal_lines', {
  id: serial('id').primaryKey(),
  journalEntryId: varchar('journal_entry_id', { length: 64 })
    .references(() => journalEntries.id, { onDelete: 'cascade' })
    .notNull(),
  accountHeadId: varchar('account_head_id', { length: 64 })
    .references(() => accountHeads.id, { onDelete: 'restrict' })
    .notNull(),
  type: text('type').notNull(), // DEBIT, CREDIT
  debit: numeric('debit', { precision: 14, scale: 2 }).default('0.00').notNull(),
  credit: numeric('credit', { precision: 14, scale: 2 }).default('0.00').notNull(),
  description: text('description'),
});

// ==========================================
// 13. RELATIONS DEFINITIONS
// ==========================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  branches: many(branches),
  users: many(users),
  specialties: many(specialties),
  doctors: many(doctors),
  patients: many(patients),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [branches.organizationId],
    references: [organizations.id],
  }),
  appointments: many(appointments),
  inventory: many(inventoryItems),
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
}));

export const patientsRelations = relations(patients, ({ many, one }) => ({
  appointments: many(appointments),
  consultations: many(consultations),
  vitals: many(vitals),
  prescriptions: many(prescriptions),
  invoices: many(invoices),
  labOrders: many(labOrders),
  organization: one(organizations, {
    fields: [patients.organizationId],
    references: [organizations.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
  branch: one(branches, {
    fields: [appointments.branchId],
    references: [branches.id],
  }),
}));

export const accountGroupsRelations = relations(accountGroups, ({ many }) => ({
  accountHeads: many(accountHeads),
}));

export const accountHeadsRelations = relations(accountHeads, ({ one, many }) => ({
  group: one(accountGroups, {
    fields: [accountHeads.groupId],
    references: [accountGroups.id],
  }),
  organization: one(organizations, {
    fields: [accountHeads.organizationId],
    references: [organizations.id],
  }),
  journalLines: many(journalLines),
}));

export const journalEntriesRelations = relations(journalEntries, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [journalEntries.organizationId],
    references: [organizations.id],
  }),
  branch: one(branches, {
    fields: [journalEntries.branchId],
    references: [branches.id],
  }),
  lines: many(journalLines),
}));

export const journalLinesRelations = relations(journalLines, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalLines.journalEntryId],
    references: [journalEntries.id],
  }),
  accountHead: one(accountHeads, {
    fields: [journalLines.accountHeadId],
    references: [accountHeads.id],
  }),
}));

// ==========================================
// 12. WORKSHOP & MARKETING MODULES
// ==========================================

export const serviceBookings = pgTable('service_bookings', {
  id: serial('id').primaryKey(),
  bookingId: varchar('booking_id', { length: 100 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),
  vehicleModel: varchar('vehicle_model', { length: 255 }).notNull(),
  vehicleRegNumber: varchar('vehicle_reg_number', { length: 100 }),
  serviceType: varchar('service_type', { length: 255 }).notNull(),
  preferredDate: varchar('preferred_date', { length: 100 }),
  preferredTime: varchar('preferred_time', { length: 100 }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).default('CONFIRMED').notNull(),
  progressPercent: integer('progress_percent').default(25).notNull(),
  currentStep: varchar('current_step', { length: 255 }).default('Booking Confirmed').notNull(),
  estimatedCompletion: varchar('estimated_completion', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pickupRequests = pgTable('pickup_requests', {
  id: serial('id').primaryKey(),
  requestId: varchar('request_id', { length: 100 }).notNull().unique(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),
  vehicleRegNumber: varchar('vehicle_reg_number', { length: 100 }),
  vehicleModel: varchar('vehicle_model', { length: 255 }),
  pickupAddress: text('pickup_address').notNull(),
  preferredDate: varchar('preferred_date', { length: 100 }).notNull(),
  preferredTime: varchar('preferred_time', { length: 100 }).notNull(),
  serviceRequirement: varchar('service_requirement', { length: 255 }).notNull(),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).default('REQUESTED').notNull(),
  assignedDriver: varchar('assigned_driver', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('ACTIVE').notNull(),
  unsubscribeToken: varchar('unsubscribe_token', { length: 255 }).notNull().unique(),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const newsletterCampaigns = pgTable('newsletter_campaigns', {
  id: serial('id').primaryKey(),
  subject: varchar('subject', { length: 255 }).notNull(),
  content: text('content').notNull(),
  campaignType: varchar('campaign_type', { length: 50 }).default('NEWSLETTER').notNull(),
  sentByUserId: integer('sent_by_user_id'),
  sentByEmail: varchar('sent_by_email', { length: 255 }),
  recipientCount: integer('recipient_count').default(0).notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

