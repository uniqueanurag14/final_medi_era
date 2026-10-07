-- Migration: 007_organization_branch_rbac_hierarchy.sql
-- Description: Complete MediEra Enterprise Hierarchy: Super Admin -> Organization -> Branch -> Users -> Roles -> Permissions & Branch Settings

-- 1. Extend Organizations Table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS pincode VARCHAR(50);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'Asia/Kolkata';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD-MM-YYYY';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';

-- 2. Extend Branches Table
ALTER TABLE branches ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
ALTER TABLE branches ADD COLUMN IF NOT EXISTS pincode VARCHAR(50);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'Asia/Kolkata';
ALTER TABLE branches ADD COLUMN IF NOT EXISTS working_hours JSON;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS settings JSON;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';

-- 3. Extend Roles Table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';

-- 4. Extend Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS employee_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS designation VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(100) DEFAULT 'Staff';
ALTER TABLE users ADD COLUMN IF NOT EXISTS setup_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS setup_token_expires_at TIMESTAMP;

-- 5. User Branches Table (Branch assignments & branch-specific roles)
CREATE TABLE IF NOT EXISTS user_branches (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  role_id VARCHAR(64) REFERENCES roles(id) ON DELETE SET NULL,
  is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  status VARCHAR(50) DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT uq_user_branch UNIQUE (user_id, branch_id)
);

-- 6. User Roles Table (Multiple roles per user at organization level)
CREATE TABLE IF NOT EXISTS user_roles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
);

-- 7. Granular System Permissions
INSERT INTO permissions (id, code, module, action, description)
VALUES
  ('perm-org-view', 'organization.view', 'Organization', 'view', 'View organization details and configuration'),
  ('perm-org-create', 'organization.create', 'Organization', 'create', 'Create new healthcare organizations'),
  ('perm-org-edit', 'organization.edit', 'Organization', 'edit', 'Modify organization profiles and defaults'),
  ('perm-org-delete', 'organization.delete', 'Organization', 'delete', 'Archive or remove organizations'),

  ('perm-branch-view', 'branch.view', 'Branch', 'view', 'View branch listings and schedules'),
  ('perm-branch-create', 'branch.create', 'Branch', 'create', 'Create clinic branches'),
  ('perm-branch-edit', 'branch.edit', 'Branch', 'edit', 'Update branch configurations and hours'),
  ('perm-branch-delete', 'branch.delete', 'Branch', 'delete', 'Archive or delete branches'),

  ('perm-user-view', 'user.view', 'User', 'view', 'View user and employee directory'),
  ('perm-user-create', 'user.create', 'User', 'create', 'Onboard and create new users'),
  ('perm-user-edit', 'user.edit', 'User', 'edit', 'Update user profiles, roles, and branch assignments'),
  ('perm-user-deact', 'user.deactivate', 'User', 'deactivate', 'Deactivate or suspend user accounts'),

  ('perm-role-view', 'role.view', 'Role', 'view', 'View roles and assigned permissions'),
  ('perm-role-create', 'role.create', 'Role', 'create', 'Create custom roles'),
  ('perm-role-edit', 'role.edit', 'Role', 'edit', 'Edit roles and update permission matrix'),
  ('perm-role-delete', 'role.delete', 'Role', 'delete', 'Remove custom roles'),

  ('perm-patient-view', 'patient.view', 'Patient', 'view', 'View patient clinical dossiers and MRNs'),
  ('perm-patient-cr', 'patient.create', 'Patient', 'create', 'Register walk-in and online patients'),
  ('perm-patient-ed', 'patient.edit', 'Patient', 'edit', 'Update patient charts and demographics'),

  ('perm-doc-view', 'doctor.view', 'Doctor', 'view', 'View doctor directory and specialties'),
  ('perm-doc-create', 'doctor.create', 'Doctor', 'create', 'Add medical practitioners to clinic'),
  ('perm-doc-edit', 'doctor.edit', 'Doctor', 'edit', 'Update practitioner qualifications and fees'),

  ('perm-apt-vw', 'appointment.view', 'Appointment', 'view', 'View appointment calendar and queues'),
  ('perm-apt-cr', 'appointment.create', 'Appointment', 'create', 'Schedule patient consultations'),
  ('perm-apt-ed', 'appointment.edit', 'Appointment', 'edit', 'Reschedule appointments'),
  ('perm-apt-del', 'appointment.cancel', 'Appointment', 'cancel', 'Cancel appointments'),

  ('perm-inv-view', 'inventory.view', 'Inventory', 'view', 'View pharmacy formulary and stock items'),
  ('perm-inv-create', 'inventory.create', 'Inventory', 'create', 'Add new medicines and supplies'),
  ('perm-inv-edit', 'inventory.edit', 'Inventory', 'edit', 'Update inventory item metadata and pricing'),
  ('perm-inv-delete', 'inventory.delete', 'Inventory', 'delete', 'Archive or remove inventory items'),
  ('perm-inv-adj', 'inventory.stock_adjust', 'Inventory', 'stock_adjust', 'Perform physical stock counts and adjustments'),
  ('perm-inv-trans', 'inventory.transfer', 'Inventory', 'transfer', 'Transfer stock between clinic branches'),

  ('perm-store-view', 'medical_store.view', 'Medical Store', 'view', 'Access pharmacy point-of-sale and dispensary'),
  ('perm-store-create', 'medical_store.create', 'Medical Store', 'create', 'Create dispensary sales and orders'),
  ('perm-store-edit', 'medical_store.edit', 'Medical Store', 'edit', 'Update dispensing orders'),

  ('perm-bill-view', 'billing.view', 'Billing', 'view', 'View patient invoices and payment ledgers'),
  ('perm-bill-create', 'billing.create', 'Billing', 'create', 'Generate invoices and collect payments'),
  ('perm-bill-edit', 'billing.edit', 'Billing', 'edit', 'Modify invoices, write-offs and discounts'),

  ('perm-rep-view', 'reports.view', 'Reports', 'view', 'Access executive analytics, BI, and audits')
ON CONFLICT (code) DO NOTHING;

-- 8. Insert Additional Operational Roles
INSERT INTO roles (id, name, display_name, description, is_system, status)
VALUES
  ('role-inv-mgr', 'INVENTORY_MANAGER', 'Inventory Manager', 'Medical inventory controller managing formulary, stock adjustments, and suppliers', TRUE, 'Active'),
  ('role-med-store-mgr', 'MEDICAL_STORE_MANAGER', 'Medical Store Manager', 'Dispensary and pharmacy head managing OTC sales and prescriptions', TRUE, 'Active'),
  ('role-pharmacist', 'PHARMACIST', 'Pharmacist', 'Licensed pharmacist dispensing medications against physician e-Prescriptions', TRUE, 'Active'),
  ('role-manager', 'MANAGER', 'Clinic Operations Manager', 'Branch operations, facility oversight, and clinic administration', TRUE, 'Active'),
  ('role-staff', 'STAFF', 'Clinical Support Staff', 'General clinic administration and support associate', TRUE, 'Active')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;
