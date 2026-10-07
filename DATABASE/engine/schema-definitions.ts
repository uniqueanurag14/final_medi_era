import bcrypt from 'bcryptjs';
import type { DatabaseClient } from './connection.ts';
import type { SupportedDialect } from './config.ts';

export const APPLICATION_TABLES = [
  'roles',
  'permissions',
  'role_permissions',
  'users',
  'user_sessions',
  'audit_logs',
  'password_reset_tokens',
  'system_settings',
  'service_bookings',
  'pickup_requests',
  'newsletter_subscribers',
  'newsletter_campaigns',
  'organizations',
  'branches',
  'doctors',
  'doctor_branch_assignments',
  'doctor_schedules',
  'inventory_items',
  'inventory_categories',
  'inventory_suppliers',
  'inventory_stock_movements',
  'inventory_adjustments',
  'inventory_purchase_orders',
  'inventory_purchase_order_items',
] as const;

export const TABLES_DROP_ORDER = [
  'doctor_schedules',
  'doctor_branch_assignments',
  'doctors',
  'branches',
  'organizations',
  'newsletter_campaigns',
  'newsletter_subscribers',
  'pickup_requests',
  'service_bookings',
  'user_sessions',
  'password_reset_tokens',
  'audit_logs',
  'users',
  'role_permissions',
  'permissions',
  'roles',
  'system_settings',
] as const;

export const SYSTEM_PERMISSIONS = [
  { name: 'users:read', description: 'View user listings and details', resource: 'users', action: 'read' },
  { name: 'users:create', description: 'Create new user accounts', resource: 'users', action: 'create' },
  { name: 'users:update', description: 'Update user profiles and roles', resource: 'users', action: 'update' },
  { name: 'users:delete', description: 'Delete / soft-delete user accounts', resource: 'users', action: 'delete' },
  { name: 'users:activate', description: 'Activate deactivated user accounts', resource: 'users', action: 'activate' },
  { name: 'users:deactivate', description: 'Deactivate or suspend user accounts', resource: 'users', action: 'deactivate' },

  { name: 'roles:read', description: 'View roles and associated permissions', resource: 'roles', action: 'read' },
  { name: 'roles:create', description: 'Create custom non-system roles', resource: 'roles', action: 'create' },
  { name: 'roles:update', description: 'Update roles and permission mappings', resource: 'roles', action: 'update' },
  { name: 'roles:delete', description: 'Delete custom non-system roles', resource: 'roles', action: 'delete' },

  { name: 'permissions:read', description: 'View system permissions list', resource: 'permissions', action: 'read' },

  { name: 'audit:read', description: 'Inspect security and audit event logs', resource: 'audit', action: 'read' },

  { name: 'sessions:read', description: 'View active login sessions', resource: 'sessions', action: 'read' },
  { name: 'sessions:revoke', description: 'Revoke active sessions for self or users', resource: 'sessions', action: 'revoke' },

  { name: 'profile:read', description: 'View authenticated user personal profile', resource: 'profile', action: 'read' },
  { name: 'profile:update', description: 'Update authenticated user profile information', resource: 'profile', action: 'update' },

  { name: 'settings:read', description: 'View system and security settings', resource: 'settings', action: 'read' },
  { name: 'settings:update', description: 'Update system and security settings', resource: 'settings', action: 'update' },

  { name: 'bookings:read', description: 'View service bookings and telemetry repair tracking', resource: 'bookings', action: 'read' },
  { name: 'bookings:manage', description: 'Create, update, and manage workshop service bookings', resource: 'bookings', action: 'manage' },
  { name: 'pickups:manage', description: 'Inspect and manage doorstep pickup & drop requests', resource: 'pickups', action: 'manage' },
  { name: 'newsletters:send', description: 'Broadcast newsletters, seasonal deals, and announcements to active subscribers', resource: 'newsletters', action: 'send' },

  { name: 'organizations:read', description: 'View organization profiles, legal info, and clinic settings', resource: 'organizations', action: 'read' },
  { name: 'organizations:manage', description: 'Create and configure organizations and clinic settings', resource: 'organizations', action: 'manage' },
  { name: 'branches:read', description: 'View clinic branches, addresses, and operating hours', resource: 'branches', action: 'read' },
  { name: 'branches:manage', description: 'Create and configure clinic branches and operating schedules', resource: 'branches', action: 'manage' },
  { name: 'doctors:read', description: 'View doctors directory, qualifications, and specialties', resource: 'doctors', action: 'read' },
  { name: 'doctors:manage', description: 'Create and update doctor profiles, credentials, and fees', resource: 'doctors', action: 'manage' },
  { name: 'schedules:read', description: 'View doctor branch assignments and duty schedules', resource: 'schedules', action: 'read' },
  { name: 'schedules:manage', description: 'Configure doctor branch assignments, rooms, and shift schedules', resource: 'schedules', action: 'manage' },
];

export const SYSTEM_ROLES = [
  { name: 'superadmin', description: 'Full administrative access across all modules and settings', isSystemRole: true },
  { name: 'admin', description: 'User management, audit log review, and operational roles', isSystemRole: true },
  { name: 'doctor', description: 'Licensed medical practitioner with consultation and schedule rights', isSystemRole: true },
  { name: 'receptionist', description: 'Front-desk staff managing patient registration, queue, and appointments', isSystemRole: true },
  { name: 'nurse', description: 'Clinical nursing staff assisting doctors and recording vitals', isSystemRole: true },
  { name: 'accountant', description: 'Finance officer managing invoices, payments, and billing', isSystemRole: true },
  { name: 'manager', description: 'Operations and facility manager overseeing clinic branches', isSystemRole: true },
  { name: 'staff', description: 'General support and administrative staff', isSystemRole: true },
  { name: 'patient', description: 'Registered clinic patient with self-service portal access', isSystemRole: true },
  { name: 'user', description: 'Standard user with profile and session management capabilities', isSystemRole: true },
];

export const DEFAULT_SETTINGS = [
  { key: 'session_timeout_minutes', value: '60', description: 'Inactivity session timeout duration' },
  { key: 'password_min_length', value: '8', description: 'Minimum password character length' },
  { key: 'require_special_char', value: 'true', description: 'Require special character in password' },
  { key: 'max_failed_logins', value: '5', description: 'Max failed login attempts before temporary lockout' },
];

/**
 * Creates missing tables in PostgreSQL
 */
async function createPostgresTables(client: DatabaseClient): Promise<void> {
  const ddl = `
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      is_system_role BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      resource VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      id SERIAL PRIMARY KEY,
      role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      role_id INTEGER NOT NULL REFERENCES roles(id),
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE NOT NULL,
      theme_preference VARCHAR(50) DEFAULT 'system' NOT NULL,
      must_change_password BOOLEAN DEFAULT FALSE NOT NULL,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      deleted_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token_hash TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP,
      ip_address VARCHAR(100),
      user_agent TEXT,
      last_used_at TIMESTAMP DEFAULT NOW() NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      user_email VARCHAR(255),
      action VARCHAR(255) NOT NULL,
      resource VARCHAR(255) NOT NULL,
      resource_id VARCHAR(255),
      metadata TEXT,
      ip_address VARCHAR(100),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) NOT NULL UNIQUE,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_bookings (
      id SERIAL PRIMARY KEY,
      booking_id VARCHAR(100) NOT NULL UNIQUE,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      vehicle_model VARCHAR(255) NOT NULL,
      vehicle_reg_number VARCHAR(100),
      service_type VARCHAR(255) NOT NULL,
      preferred_date VARCHAR(100),
      preferred_time VARCHAR(100),
      notes TEXT,
      status VARCHAR(50) DEFAULT 'CONFIRMED' NOT NULL,
      progress_percent INTEGER DEFAULT 25 NOT NULL,
      current_step VARCHAR(255) DEFAULT 'Booking Confirmed' NOT NULL,
      estimated_completion VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pickup_requests (
      id SERIAL PRIMARY KEY,
      request_id VARCHAR(100) NOT NULL UNIQUE,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      vehicle_reg_number VARCHAR(100),
      vehicle_model VARCHAR(255),
      pickup_address TEXT NOT NULL,
      preferred_date VARCHAR(100) NOT NULL,
      preferred_time VARCHAR(100) NOT NULL,
      service_requirement VARCHAR(255) NOT NULL,
      notes TEXT,
      status VARCHAR(50) DEFAULT 'REQUESTED' NOT NULL,
      assigned_driver VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      unsubscribe_token VARCHAR(255) NOT NULL UNIQUE,
      subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL,
      unsubscribed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter_campaigns (
      id SERIAL PRIMARY KEY,
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      campaign_type VARCHAR(50) DEFAULT 'NEWSLETTER' NOT NULL,
      sent_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      sent_by_email VARCHAR(255),
      recipient_count INTEGER DEFAULT 0 NOT NULL,
      sent_at TIMESTAMP DEFAULT NOW() NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organizations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      legal_name VARCHAR(255) NOT NULL,
      logo_url TEXT,
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(50) NOT NULL,
      website VARCHAR(255),
      tax_id VARCHAR(100),
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(50) NOT NULL,
      country VARCHAR(100) DEFAULT 'India' NOT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      settings TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(50) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      working_hours TEXT,
      is_main_branch BOOLEAN DEFAULT FALSE NOT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      settings TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      specialization VARCHAR(255) NOT NULL,
      license_number VARCHAR(100) NOT NULL,
      qualification VARCHAR(255) NOT NULL,
      experience_years INTEGER DEFAULT 0 NOT NULL,
      bio TEXT,
      consultation_fee INTEGER DEFAULT 0 NOT NULL,
      avatar_url TEXT,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctor_branch_assignments (
      id SERIAL PRIMARY KEY,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      branch_consultation_fee INTEGER,
      room_number VARCHAR(100),
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      effective_from TIMESTAMP,
      effective_to TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS doctor_schedules (
      id SERIAL PRIMARY KEY,
      doctor_branch_assignment_id INTEGER NOT NULL REFERENCES doctor_branch_assignments(id) ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
      branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
      day_of_week VARCHAR(20) NOT NULL,
      session_name VARCHAR(100) NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      slot_duration_minutes INTEGER DEFAULT 15 NOT NULL,
      max_patients INTEGER DEFAULT 20 NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `;

  await client.execute(ddl);
}

/**
 * Creates missing tables in MySQL
 */
async function createMySqlTables(client: DatabaseClient): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS roles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      is_system_role BOOLEAN DEFAULT FALSE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      resource VARCHAR(255) NOT NULL,
      action VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS role_permissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      role_id INT NOT NULL,
      permission_id INT NOT NULL,
      KEY idx_rp_role (role_id),
      KEY idx_rp_perm (permission_id),
      CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      avatar_url TEXT DEFAULT NULL,
      role_id INT NOT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE NOT NULL,
      theme_preference VARCHAR(50) DEFAULT 'system' NOT NULL,
      must_change_password BOOLEAN DEFAULT FALSE NOT NULL,
      last_login_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      deleted_at DATETIME DEFAULT NULL,
      KEY idx_user_role (role_id),
      CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS user_sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id INT NOT NULL,
      refresh_token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked_at DATETIME DEFAULT NULL,
      ip_address VARCHAR(100) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      KEY idx_session_user (user_id),
      CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT NULL,
      user_email VARCHAR(255) DEFAULT NULL,
      action VARCHAR(255) NOT NULL,
      resource VARCHAR(255) NOT NULL,
      resource_id VARCHAR(255) DEFAULT NULL,
      metadata TEXT DEFAULT NULL,
      ip_address VARCHAR(100) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      KEY idx_audit_user (user_id),
      CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      KEY idx_prt_user (user_id),
      CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(255) NOT NULL UNIQUE,
      \`value\` TEXT NOT NULL,
      description TEXT DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS service_bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id VARCHAR(100) NOT NULL UNIQUE,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      vehicle_model VARCHAR(255) NOT NULL,
      vehicle_reg_number VARCHAR(100) DEFAULT NULL,
      service_type VARCHAR(255) NOT NULL,
      preferred_date VARCHAR(100) DEFAULT NULL,
      preferred_time VARCHAR(100) DEFAULT NULL,
      notes TEXT DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'CONFIRMED' NOT NULL,
      progress_percent INT DEFAULT 25 NOT NULL,
      current_step VARCHAR(255) DEFAULT 'Booking Confirmed' NOT NULL,
      estimated_completion VARCHAR(100) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS pickup_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      request_id VARCHAR(100) NOT NULL UNIQUE,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      vehicle_reg_number VARCHAR(100) DEFAULT NULL,
      vehicle_model VARCHAR(255) DEFAULT NULL,
      pickup_address TEXT NOT NULL,
      preferred_date VARCHAR(100) NOT NULL,
      preferred_time VARCHAR(100) NOT NULL,
      service_requirement VARCHAR(255) NOT NULL,
      notes TEXT DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'REQUESTED' NOT NULL,
      assigned_driver VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      unsubscribe_token VARCHAR(255) NOT NULL UNIQUE,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      unsubscribed_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS newsletter_campaigns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      campaign_type VARCHAR(50) DEFAULT 'NEWSLETTER' NOT NULL,
      sent_by_user_id INT DEFAULT NULL,
      sent_by_email VARCHAR(255) DEFAULT NULL,
      recipient_count INT DEFAULT 0 NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      KEY idx_camp_user (sent_by_user_id),
      CONSTRAINT fk_camp_user FOREIGN KEY (sent_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS organizations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      legal_name VARCHAR(255) NOT NULL,
      logo_url TEXT DEFAULT NULL,
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(50) NOT NULL,
      website VARCHAR(255) DEFAULT NULL,
      tax_id VARCHAR(100) DEFAULT NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(50) NOT NULL,
      country VARCHAR(100) DEFAULT 'India' NOT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      settings TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      postal_code VARCHAR(50) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      working_hours TEXT DEFAULT NULL,
      is_main_branch BOOLEAN DEFAULT FALSE NOT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      settings TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      KEY idx_branch_org (organization_id),
      CONSTRAINT fk_branch_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS doctors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organization_id INT NOT NULL,
      user_id INT DEFAULT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      specialization VARCHAR(255) NOT NULL,
      license_number VARCHAR(100) NOT NULL,
      qualification VARCHAR(255) NOT NULL,
      experience_years INT DEFAULT 0 NOT NULL,
      bio TEXT DEFAULT NULL,
      consultation_fee INT DEFAULT 0 NOT NULL,
      avatar_url TEXT DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      KEY idx_doctor_org (organization_id),
      KEY idx_doctor_user (user_id),
      CONSTRAINT fk_doctor_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS doctor_branch_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_id INT NOT NULL,
      branch_id INT NOT NULL,
      branch_consultation_fee INT DEFAULT NULL,
      room_number VARCHAR(100) DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
      effective_from DATETIME DEFAULT NULL,
      effective_to DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      KEY idx_dba_doctor (doctor_id),
      KEY idx_dba_branch (branch_id),
      CONSTRAINT fk_dba_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      CONSTRAINT fk_dba_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS doctor_schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doctor_branch_assignment_id INT NOT NULL,
      doctor_id INT NOT NULL,
      branch_id INT NOT NULL,
      day_of_week VARCHAR(20) NOT NULL,
      session_name VARCHAR(100) NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      slot_duration_minutes INT DEFAULT 15 NOT NULL,
      max_patients INT DEFAULT 20 NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      KEY idx_ds_dba (doctor_branch_assignment_id),
      KEY idx_ds_doctor (doctor_id),
      KEY idx_ds_branch (branch_id),
      CONSTRAINT fk_ds_dba FOREIGN KEY (doctor_branch_assignment_id) REFERENCES doctor_branch_assignments(id) ON DELETE CASCADE,
      CONSTRAINT fk_ds_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
      CONSTRAINT fk_ds_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
  ];

  for (const stmt of statements) {
    await client.execute(stmt);
  }
}

/**
 * Creates or updates tables for the active dialect without deleting existing data
 */
export async function syncTables(client: DatabaseClient): Promise<void> {
  if (client.config.dialect === 'mysql') {
    await createMySqlTables(client);
  } else {
    await createPostgresTables(client);
  }
}

export interface BaselineResult {
  roles: any[];
  permissions: any[];
  superAdminEmail: string;
}

/**
 * Seeds baseline permissions, roles, and administrative user if they do not exist
 */
export async function seedBaselineData(client: DatabaseClient): Promise<BaselineResult> {
  const isMysql = client.config.dialect === 'mysql';

  // 1. Sync permissions
  const permMap = new Map<string, number>();
  for (const perm of SYSTEM_PERMISSIONS) {
    const existing = await client.query<{ id: number }>(
      isMysql ? 'SELECT id FROM permissions WHERE name = ? LIMIT 1' : 'SELECT id FROM permissions WHERE name = $1 LIMIT 1',
      [perm.name]
    );

    if (existing.length === 0) {
      if (isMysql) {
        const res = await client.execute(
          'INSERT INTO permissions (name, description, resource, action) VALUES (?, ?, ?, ?)',
          [perm.name, perm.description, perm.resource, perm.action]
        );
        permMap.set(perm.name, res.insertId);
      } else {
        const res = await client.query<{ id: number }>(
          'INSERT INTO permissions (name, description, resource, action) VALUES ($1, $2, $3, $4) RETURNING id',
          [perm.name, perm.description, perm.resource, perm.action]
        );
        permMap.set(perm.name, res[0].id);
      }
    } else {
      permMap.set(perm.name, existing[0].id);
    }
  }

  // 2. Sync roles
  const roleMap = new Map<string, number>();
  for (const role of SYSTEM_ROLES) {
    const existing = await client.query<{ id: number }>(
      isMysql ? 'SELECT id FROM roles WHERE name = ? LIMIT 1' : 'SELECT id FROM roles WHERE name = $1 LIMIT 1',
      [role.name]
    );

    if (existing.length === 0) {
      if (isMysql) {
        const res = await client.execute(
          'INSERT INTO roles (name, description, is_system_role) VALUES (?, ?, ?)',
          [role.name, role.description, role.isSystemRole]
        );
        roleMap.set(role.name, res.insertId);
      } else {
        const res = await client.query<{ id: number }>(
          'INSERT INTO roles (name, description, is_system_role) VALUES ($1, $2, $3) RETURNING id',
          [role.name, role.description, role.isSystemRole]
        );
        roleMap.set(role.name, res[0].id);
      }
    } else {
      roleMap.set(role.name, existing[0].id);
    }
  }

  const superadminRoleId = roleMap.get('superadmin');
  const adminRoleId = roleMap.get('admin');
  const userRoleId = roleMap.get('user');

  // 3. Map permissions to roles
  if (superadminRoleId) {
    for (const [, permId] of permMap) {
      const existing = await client.query(
        isMysql
          ? 'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1'
          : 'SELECT id FROM role_permissions WHERE role_id = $1 AND permission_id = $2 LIMIT 1',
        [superadminRoleId, permId]
      );
      if (existing.length === 0) {
        await client.execute(
          isMysql
            ? 'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)'
            : 'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
          [superadminRoleId, permId]
        );
      }
    }
  }

  if (adminRoleId) {
    const adminPermNames = [
      'users:read', 'users:create', 'users:update', 'users:delete', 'users:activate', 'users:deactivate',
      'roles:read', 'permissions:read', 'audit:read', 'sessions:read', 'sessions:revoke',
      'profile:read', 'profile:update', 'settings:read',
      'bookings:read', 'bookings:manage', 'pickups:manage', 'newsletters:send',
      'organizations:read', 'organizations:manage',
      'branches:read', 'branches:manage',
      'doctors:read', 'doctors:manage',
      'schedules:read', 'schedules:manage'
    ];
    for (const name of adminPermNames) {
      const permId = permMap.get(name);
      if (permId) {
        const existing = await client.query(
          isMysql
            ? 'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1'
            : 'SELECT id FROM role_permissions WHERE role_id = $1 AND permission_id = $2 LIMIT 1',
          [adminRoleId, permId]
        );
        if (existing.length === 0) {
          await client.execute(
            isMysql
              ? 'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)'
              : 'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [adminRoleId, permId]
          );
        }
      }
    }
  }

  if (userRoleId) {
    const userPermNames = ['profile:read', 'profile:update', 'sessions:read', 'sessions:revoke'];
    for (const name of userPermNames) {
      const permId = permMap.get(name);
      if (permId) {
        const existing = await client.query(
          isMysql
            ? 'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1'
            : 'SELECT id FROM role_permissions WHERE role_id = $1 AND permission_id = $2 LIMIT 1',
          [userRoleId, permId]
        );
        if (existing.length === 0) {
          await client.execute(
            isMysql
              ? 'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)'
              : 'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
            [userRoleId, permId]
          );
        }
      }
    }
  }

  // Healthcare specific role permissions mapping
  const rolePermissionConfig: Record<string, string[]> = {
    doctor: ['profile:read', 'profile:update', 'sessions:read', 'organizations:read', 'branches:read', 'doctors:read', 'doctors:manage', 'schedules:read', 'schedules:manage'],
    receptionist: ['profile:read', 'profile:update', 'sessions:read', 'organizations:read', 'branches:read', 'doctors:read', 'schedules:read', 'users:read', 'users:create'],
    nurse: ['profile:read', 'profile:update', 'sessions:read', 'organizations:read', 'branches:read', 'doctors:read', 'schedules:read'],
    accountant: ['profile:read', 'profile:update', 'sessions:read', 'organizations:read', 'branches:read', 'doctors:read', 'schedules:read'],
    manager: ['profile:read', 'profile:update', 'sessions:read', 'organizations:read', 'branches:read', 'branches:manage', 'doctors:read', 'schedules:read', 'schedules:manage', 'users:read'],
    staff: ['profile:read', 'profile:update', 'sessions:read', 'organizations:read', 'branches:read', 'doctors:read', 'schedules:read'],
    patient: ['profile:read', 'profile:update', 'sessions:read', 'organizations:read', 'branches:read', 'doctors:read', 'schedules:read'],
  };

  for (const [rName, pNames] of Object.entries(rolePermissionConfig)) {
    const rId = roleMap.get(rName);
    if (rId) {
      for (const pName of pNames) {
        const permId = permMap.get(pName);
        if (permId) {
          const existing = await client.query(
            isMysql
              ? 'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1'
              : 'SELECT id FROM role_permissions WHERE role_id = $1 AND permission_id = $2 LIMIT 1',
            [rId, permId]
          );
          if (existing.length === 0) {
            await client.execute(
              isMysql
                ? 'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)'
                : 'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
              [rId, permId]
            );
          }
        }
      }
    }
  }

  // 4. Default settings
  for (const s of DEFAULT_SETTINGS) {
    const existing = await client.query(
      isMysql
        ? 'SELECT id FROM system_settings WHERE `key` = ? LIMIT 1'
        : 'SELECT id FROM system_settings WHERE key = $1 LIMIT 1',
      [s.key]
    );
    if (existing.length === 0) {
      await client.execute(
        isMysql
          ? 'INSERT INTO system_settings (\`key\`, \`value\`, description) VALUES (?, ?, ?)'
          : 'INSERT INTO system_settings (key, value, description) VALUES ($1, $2, $3)',
        [s.key, s.value, s.description]
      );
    }
  }

  // 5. Initial Super Admin user if no users exist
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'AdminSecurePassword123!';

  const existingUsers = await client.query<{ id: number }>(
    isMysql ? 'SELECT id FROM users WHERE email = ? LIMIT 1' : 'SELECT id FROM users WHERE email = $1 LIMIT 1',
    [superAdminEmail]
  );

  if (existingUsers.length === 0 && superadminRoleId) {
    const passwordHash = await bcrypt.hash(superAdminPassword, 12);
    const names = superAdminName.split(' ');
    const firstName = names[0] || 'Super';
    const lastName = names.slice(1).join(' ') || 'Admin';

    if (isMysql) {
      await client.execute(
        `INSERT INTO users (
          email, password_hash, first_name, last_name, display_name,
          role_id, status, email_verified, theme_preference, must_change_password
        ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 1, 'system', 0)`,
        [superAdminEmail, passwordHash, firstName, lastName, superAdminName, superadminRoleId]
      );
      await client.execute(
        `INSERT INTO audit_logs (user_email, action, resource, resource_id, metadata)
         VALUES (?, 'SYSTEM_BOOTSTRAP', 'users', ?, ?)`,
        [superAdminEmail, superAdminEmail, JSON.stringify({ message: 'Initial super admin account created via db:init' })]
      );
    } else {
      await client.execute(
        `INSERT INTO users (
          email, password_hash, first_name, last_name, display_name,
          role_id, status, email_verified, theme_preference, must_change_password
        ) VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', true, 'system', false)`,
        [superAdminEmail, passwordHash, firstName, lastName, superAdminName, superadminRoleId]
      );
      await client.execute(
        `INSERT INTO audit_logs (user_email, action, resource, resource_id, metadata)
         VALUES ($1, 'SYSTEM_BOOTSTRAP', 'users', $2, $3)`,
        [superAdminEmail, superAdminEmail, JSON.stringify({ message: 'Initial super admin account created via db:init' })]
      );
    }
  }

  // 6. Seed Baseline Healthcare Organization & Branches if empty
  const existingOrgs = await client.query<{ id: number }>(
    isMysql ? 'SELECT id FROM organizations LIMIT 1' : 'SELECT id FROM organizations LIMIT 1'
  );

  if (existingOrgs.length === 0) {
    let orgId: number;
    const orgSettings = JSON.stringify({
      currency: 'USD',
      timezone: 'America/New_York',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '12h',
      registrationNumber: 'MED-REG-2024-9981',
    });

    const orgValues = [
      'MediEra Healthcare Group',
      'MediEra Integrated Health Systems Ltd.',
      null,
      'contact@mediera.health',
      '+1 (800) 555-0199',
      'https://mediera.health',
      'TAX-US-9428172',
      '450 Lexington Medical Plaza, Suite 800',
      'New York',
      'NY',
      '10017',
      'United States',
      'ACTIVE',
      orgSettings,
    ];

    if (isMysql) {
      await client.execute(
        `INSERT INTO organizations (
          name, legal_name, logo_url, contact_email, contact_phone,
          website, tax_id, address, city, state, postal_code, country, status, settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        orgValues
      );
      const [res] = await client.query<{ id: number }>('SELECT id FROM organizations ORDER BY id DESC LIMIT 1');
      orgId = res.id;
    } else {
      const rows = await client.query<{ id: number }>(
        `INSERT INTO organizations (
          name, legal_name, logo_url, contact_email, contact_phone,
          website, tax_id, address, city, state, postal_code, country, status, settings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id`,
        orgValues
      );
      orgId = rows[0].id;
    }

    // Seed 2 Branches
    const branch1Values = [
      orgId,
      'Downtown Central Clinic',
      'BR-CENTRAL',
      '100 Park Avenue, Floor 3',
      'New York',
      'NY',
      '10017',
      '+1 (800) 555-0101',
      'downtown@mediera.health',
      JSON.stringify({
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '08:00', close: '18:00', isOpen: true },
        saturday: { open: '09:00', close: '14:00', isOpen: true },
        sunday: { open: '09:00', close: '13:00', isOpen: false },
      }),
      true,
      'ACTIVE',
    ];

    const branch2Values = [
      orgId,
      'Metropolitan Health Hub',
      'BR-METRO',
      '750 Broadway Boulevard',
      'New York',
      'NY',
      '10003',
      '+1 (800) 555-0102',
      'metro@mediera.health',
      JSON.stringify({
        monday: { open: '08:30', close: '17:30', isOpen: true },
        tuesday: { open: '08:30', close: '17:30', isOpen: true },
        wednesday: { open: '08:30', close: '17:30', isOpen: true },
        thursday: { open: '08:30', close: '17:30', isOpen: true },
        friday: { open: '08:30', close: '17:30', isOpen: true },
        saturday: { open: '09:00', close: '13:00', isOpen: true },
        sunday: { open: '09:00', close: '13:00', isOpen: false },
      }),
      false,
      'ACTIVE',
    ];

    let b1Id: number;
    let b2Id: number;

    if (isMysql) {
      await client.execute(
        `INSERT INTO branches (organization_id, name, code, address, city, state, postal_code, phone, email, working_hours, is_main_branch, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        branch1Values
      );
      const [r1] = await client.query<{ id: number }>('SELECT id FROM branches WHERE code = "BR-CENTRAL"');
      b1Id = r1.id;

      await client.execute(
        `INSERT INTO branches (organization_id, name, code, address, city, state, postal_code, phone, email, working_hours, is_main_branch, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        branch2Values
      );
      const [r2] = await client.query<{ id: number }>('SELECT id FROM branches WHERE code = "BR-METRO"');
      b2Id = r2.id;
    } else {
      const r1 = await client.query<{ id: number }>(
        `INSERT INTO branches (organization_id, name, code, address, city, state, postal_code, phone, email, working_hours, is_main_branch, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        branch1Values
      );
      b1Id = r1[0].id;

      const r2 = await client.query<{ id: number }>(
        `INSERT INTO branches (organization_id, name, code, address, city, state, postal_code, phone, email, working_hours, is_main_branch, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        branch2Values
      );
      b2Id = r2[0].id;
    }
  }

  return {
    roles: Array.from(roleMap.entries()),
    permissions: Array.from(permMap.entries()),
    superAdminEmail,
  };
}
