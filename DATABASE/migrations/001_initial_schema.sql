-- Migration: 001_initial_schema.sql
-- Description: Core Schema for MediEra Medical CRM + ERP Multi-Tenant Architecture

-- 1. Organizations & Branches
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  logo_url TEXT,
  website TEXT,
  address TEXT,
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(64) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  zip_code VARCHAR(32) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  operating_hours TEXT,
  is_main_branch BOOLEAN DEFAULT FALSE NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Roles, Permissions & Users
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(128) NOT NULL UNIQUE,
  module VARCHAR(128) NOT NULL,
  action VARCHAR(64) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(64) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  uid VARCHAR(128) UNIQUE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE SET NULL,
  role_id VARCHAR(64) NOT NULL REFERENCES roles(id),
  email VARCHAR(255) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone VARCHAR(64),
  avatar_url TEXT,
  status VARCHAR(64) DEFAULT 'Active' NOT NULL,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Specialties & Doctors
CREATE TABLE IF NOT EXISTS specialties (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  specialty_id VARCHAR(64) NOT NULL REFERENCES specialties(id),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  qualification TEXT NOT NULL,
  reg_number VARCHAR(128) NOT NULL,
  experience_years INTEGER NOT NULL,
  consultation_fee NUMERIC(10, 2) NOT NULL,
  room_number VARCHAR(64),
  bio TEXT NOT NULL,
  avatar TEXT NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 4.90,
  review_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id VARCHAR(64) PRIMARY KEY,
  doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time VARCHAR(32) NOT NULL,
  end_time VARCHAR(32) NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 15 NOT NULL,
  max_patients INTEGER DEFAULT 24 NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 4. Patients & Medical Profiles
CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(128) NOT NULL UNIQUE,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth VARCHAR(32) NOT NULL,
  gender VARCHAR(32) NOT NULL,
  blood_group VARCHAR(16) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  zip_code VARCHAR(32) NOT NULL,
  emergency_contact_name TEXT,
  emergency_contact_phone VARCHAR(64),
  emergency_contact_relation VARCHAR(64),
  insurance_provider TEXT,
  insurance_policy_number VARCHAR(128),
  allergies JSON,
  medical_conditions JSON,
  current_medications JSON,
  category VARCHAR(64) DEFAULT 'Regular' NOT NULL,
  registered_date VARCHAR(32) NOT NULL,
  total_visits INTEGER DEFAULT 0 NOT NULL,
  total_spent NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  notes TEXT,
  avatar TEXT,
  status VARCHAR(64) DEFAULT 'Active' NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS vitals (
  id VARCHAR(64) PRIMARY KEY,
  patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by TEXT,
  blood_pressure_sys INTEGER,
  blood_pressure_dia INTEGER,
  pulse_rate INTEGER,
  temperature NUMERIC(4, 1),
  weight_kg NUMERIC(5, 1),
  height_cm NUMERIC(5, 1),
  bmi NUMERIC(4, 1),
  spo2 INTEGER,
  respiratory_rate INTEGER,
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Appointments & Queue Management
CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(64) PRIMARY KEY,
  appointment_number VARCHAR(128) NOT NULL UNIQUE,
  token_number INTEGER NOT NULL,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date VARCHAR(32) NOT NULL,
  time_slot VARCHAR(32) NOT NULL,
  duration_minutes INTEGER DEFAULT 15 NOT NULL,
  visit_type VARCHAR(64) DEFAULT 'In Clinic' NOT NULL,
  status VARCHAR(64) DEFAULT 'Confirmed' NOT NULL,
  chief_complaint TEXT NOT NULL,
  notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS appointment_status_history (
  id SERIAL PRIMARY KEY,
  appointment_id VARCHAR(64) NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  from_status VARCHAR(64),
  to_status VARCHAR(64) NOT NULL,
  changed_by TEXT,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Consultations & Prescriptions
CREATE TABLE IF NOT EXISTS consultations (
  id VARCHAR(64) PRIMARY KEY,
  consultation_number VARCHAR(128) NOT NULL UNIQUE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
  appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date VARCHAR(32) NOT NULL,
  chief_complaint TEXT NOT NULL,
  symptoms JSON,
  clinical_examination TEXT,
  diagnosis TEXT NOT NULL,
  icd_code VARCHAR(64),
  treatment_plan TEXT,
  doctor_notes TEXT,
  advice TEXT,
  investigations_required JSON,
  follow_up_date VARCHAR(32),
  status VARCHAR(64) DEFAULT 'Completed' NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id VARCHAR(64) PRIMARY KEY,
  prescription_number VARCHAR(128) NOT NULL UNIQUE,
  consultation_id VARCHAR(64) REFERENCES consultations(id) ON DELETE SET NULL,
  appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  advice TEXT,
  follow_up_date VARCHAR(32),
  doctor_signature TEXT,
  status VARCHAR(64) DEFAULT 'Issued' NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id VARCHAR(64) PRIMARY KEY,
  prescription_id VARCHAR(64) NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  generic_name TEXT,
  strength VARCHAR(64),
  dosage VARCHAR(64) NOT NULL,
  route VARCHAR(64) DEFAULT 'Oral' NOT NULL,
  frequency VARCHAR(64) NOT NULL,
  duration VARCHAR(64) NOT NULL,
  timing VARCHAR(64) NOT NULL,
  instructions TEXT
);

-- 7. Services, Packages & Labs
CREATE TABLE IF NOT EXISTS service_items (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(64) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER DEFAULT 15 NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS health_packages (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(64) NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  services_included JSON,
  original_price NUMERIC(10, 2) NOT NULL,
  discounted_price NUMERIC(10, 2) NOT NULL,
  test_count INTEGER NOT NULL,
  popular BOOLEAN DEFAULT FALSE NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_tests (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  normal_range TEXT NOT NULL,
  units VARCHAR(64) NOT NULL,
  sample_type VARCHAR(64) NOT NULL,
  tat_hours INTEGER DEFAULT 24 NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(128) NOT NULL UNIQUE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
  patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE SET NULL,
  consultation_id VARCHAR(64) REFERENCES consultations(id) ON DELETE SET NULL,
  date VARCHAR(32) NOT NULL,
  status VARCHAR(64) DEFAULT 'Ordered' NOT NULL,
  sample_collected_at TIMESTAMP,
  completed_at TIMESTAMP,
  reviewed_by_doctor BOOLEAN DEFAULT FALSE NOT NULL,
  report_file_url TEXT,
  total_cost NUMERIC(10, 2) NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS lab_order_items (
  id SERIAL PRIMARY KEY,
  lab_order_id VARCHAR(64) NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  test_id VARCHAR(64) REFERENCES lab_tests(id) ON DELETE SET NULL,
  test_name TEXT NOT NULL,
  category VARCHAR(64),
  result_value TEXT,
  normal_range TEXT NOT NULL,
  units VARCHAR(64) NOT NULL,
  is_abnormal BOOLEAN DEFAULT FALSE NOT NULL,
  status VARCHAR(64) DEFAULT 'Ordered' NOT NULL,
  remarks TEXT
);

-- 8. Billing, Invoices & Payments
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  invoice_number VARCHAR(128) NOT NULL UNIQUE,
  receipt_number VARCHAR(128),
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE SET NULL,
  consultation_id VARCHAR(64) REFERENCES consultations(id) ON DELETE SET NULL,
  date VARCHAR(32) NOT NULL,
  due_date VARCHAR(32) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount_total NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  tax_total NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  paid_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  balance_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(64) DEFAULT 'Issued' NOT NULL,
  payment_method VARCHAR(64),
  notes TEXT,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id VARCHAR(64) PRIMARY KEY,
  invoice_id VARCHAR(64) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  type VARCHAR(64) DEFAULT 'Service' NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
  tax_rate NUMERIC(5, 2) DEFAULT 0.00 NOT NULL,
  total NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  payment_number VARCHAR(128) NOT NULL UNIQUE,
  invoice_id VARCHAR(64) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(64) NOT NULL,
  transaction_ref VARCHAR(128),
  received_by TEXT,
  notes TEXT,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Inventory & Pharmacy
CREATE TABLE IF NOT EXISTS inventory_items (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  category VARCHAR(64) NOT NULL,
  dosage_form VARCHAR(64) NOT NULL,
  sku VARCHAR(128),
  batch_number VARCHAR(128) NOT NULL,
  expiry_date VARCHAR(32) NOT NULL,
  current_stock INTEGER NOT NULL,
  min_reorder_level INTEGER DEFAULT 10 NOT NULL,
  unit VARCHAR(64) DEFAULT 'Tablets' NOT NULL,
  cost_price NUMERIC(10, 2) NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL,
  supplier TEXT NOT NULL,
  location VARCHAR(128),
  status VARCHAR(64) DEFAULT 'In Stock' NOT NULL,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. CRM Leads & Follow-ups
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone VARCHAR(64) NOT NULL,
  email VARCHAR(255) NOT NULL,
  source VARCHAR(64) NOT NULL,
  interested_service VARCHAR(128),
  assigned_staff_name TEXT,
  status VARCHAR(64) DEFAULT 'New' NOT NULL,
  notes TEXT NOT NULL,
  converted_patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE SET NULL,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS followups (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
  patient_id VARCHAR(64) NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id VARCHAR(64) REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE SET NULL,
  type VARCHAR(64) NOT NULL,
  due_date VARCHAR(32) NOT NULL,
  status VARCHAR(64) DEFAULT 'Pending' NOT NULL,
  priority VARCHAR(64) DEFAULT 'Medium' NOT NULL,
  notes TEXT,
  assigned_to TEXT,
  completed_at TIMESTAMP,
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Audit Logs & System Settings
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR(64),
  branch_id VARCHAR(64),
  user_id VARCHAR(128),
  user_email VARCHAR(255),
  user_role VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  module VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  entity_id VARCHAR(128),
  ip_address VARCHAR(64),
  user_agent TEXT,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS system_settings (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  clinic_name TEXT NOT NULL,
  legal_name TEXT,
  currency VARCHAR(32) DEFAULT 'USD ($)' NOT NULL,
  default_tax_rate NUMERIC(5, 2) DEFAULT 5.00 NOT NULL,
  opd_slot_duration_minutes INTEGER DEFAULT 15 NOT NULL,
  enable_sms_reminders BOOLEAN DEFAULT TRUE NOT NULL,
  enable_email_reminders BOOLEAN DEFAULT TRUE NOT NULL,
  enable_whatsapp BOOLEAN DEFAULT TRUE NOT NULL,
  address TEXT,
  phone VARCHAR(64),
  email VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for Fast Lookups & Foreign Key Joins
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient_id ON lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_followups_due_date ON followups(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
