-- Migration: 002_authentication_and_system_roles.sql
-- Description: Core System Roles, Permissions, and Default Super Admin Account

-- 1. Insert Standard System Roles (Idempotent: ON CONFLICT DO NOTHING)
INSERT INTO roles (id, name, display_name, description, is_system)
VALUES 
  ('role-super-admin', 'SUPER_ADMIN', 'Super Administrator', 'Full unrestricted platform and multi-tenant access', TRUE),
  ('role-accountant', 'ACCOUNTANT', 'Chief Accountant / Financial Officer', 'Revenue cycle, invoices, journal entries, account heads and reconciliation', TRUE),
  ('role-data-entry', 'DATA_ENTRY', 'Data Entry & Records Clerk', 'Standard records input, patient profiles, and transaction registration', TRUE),
  ('role-admin', 'ADMIN', 'Practice Administrator', 'Branch administrative management, clinical operations and reports', TRUE),
  ('role-doctor', 'DOCTOR', 'Physician / Consultant', 'Clinical queue, consultation notes, SOAP diagnosis and digital prescriptions', TRUE),
  ('role-receptionist', 'RECEPTIONIST', 'Front Desk Receptionist', 'Daily token dispenser, patient check-in, bookings and cash POS', TRUE),
  ('role-nurse', 'NURSE', 'Clinical Nurse', 'Triage vitals, nursing notes, and treatment assistance', TRUE),
  ('role-patient', 'PATIENT', 'Patient Portal User', 'Self-service appointment booking, medical records and prescription viewer', TRUE)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;

-- 2. Insert Core Permissions (Idempotent: ON CONFLICT DO NOTHING)
INSERT INTO permissions (id, code, module, action, description)
VALUES
  ('perm-org-all', 'organization.all', 'Organization', 'manage', 'Full multi-branch organization control'),
  ('perm-patient-read', 'patients.read', 'Patients', 'read', 'View patient directories and records'),
  ('perm-patient-create', 'patients.create', 'Patients', 'create', 'Register new walk-in or portal patients'),
  ('perm-patient-update', 'patients.update', 'Patients', 'update', 'Edit patient demographic and contact details'),
  ('perm-apt-read', 'appointments.read', 'Appointments', 'read', 'View appointment schedules and live queues'),
  ('perm-apt-create', 'appointments.create', 'Appointments', 'create', 'Schedule new clinical consultations'),
  ('perm-cns-create', 'consultations.create', 'Consultations', 'create', 'Record SOAP clinical notes and diagnoses'),
  ('perm-rx-create', 'prescriptions.create', 'Prescriptions', 'create', 'Issue and sign digital e-prescriptions'),
  ('perm-billing-all', 'billing.all', 'Billing', 'manage', 'Invoice generation, multi-tender POS and accounting adjustments'),
  ('perm-finance-all', 'finance.all', 'Finance', 'manage', 'Account heads, chart of accounts, journal entries and ledger'),
  ('perm-settings-all', 'settings.all', 'Settings', 'manage', 'System technical configurations and audit trails')
ON CONFLICT (code) DO NOTHING;

-- 3. Seed Primary Organization & Main Branch If Not Exists
INSERT INTO organizations (id, name, legal_name, tax_id, email, phone, logo_url, website, address, settings)
VALUES (
  'org-mediera-01',
  'MediEra Health Systems',
  'MediEra Clinical Healthcare Inc.',
  'MED-US-2026-TX',
  'contact@mediera.com',
  '+1 (800) 555-6334',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
  'https://mediera.clinic',
  '100 Medical Center Parkway, Suite 400, New York, NY 10001',
  '{"currency": "USD ($)", "taxRate": 5.0, "timeZone": "America/New_York"}'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO branches (id, organization_id, name, code, address, city, state, zip_code, phone, email, operating_hours, is_main_branch, active)
VALUES (
  'br-main-01',
  'org-mediera-01',
  'MediEra Central Hospital & Specialty Campus',
  'MED-MAIN',
  '100 Medical Center Parkway, Suite 400',
  'New York',
  'NY',
  '10001',
  '+1 (800) 555-6334',
  'central@mediera.com',
  'Monday - Saturday: 08:00 AM - 08:00 PM, Sunday: 09:00 AM - 02:00 PM',
  TRUE,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Protected Super Admin User (Never Deleted By Cleanup)
INSERT INTO users (id, uid, organization_id, branch_id, role_id, email, name, phone, status)
VALUES (
  'usr-admin-01',
  'uid-admin-01',
  'org-mediera-01',
  'br-main-01',
  'role-super-admin',
  'admin@mediera.com',
  'System Super Administrator',
  '+1 (800) 555-0100',
  'Active'
)
ON CONFLICT (email) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  status = 'Active';
