/**
 * MediEra Application Global Configuration
 */

export const APP_CONFIG = {
  name: 'MediEra',
  displayName: 'MediEra | Healthcare, Clinic Management & Hospital ERP',
  version: '1.0.0',
  description: 'Enterprise clinic and hospital management system: multi-branch, role-based dashboards, real-time queue, consultations, prescriptions, billing, medical records, CRM & inventory analytics.',
  ports: {
    server: 3000,
    database: 5432,
  },
  directories: {
    backend: 'BACKEND',
    frontend: 'FRONTEND',
    database: 'DATABASE',
    public: 'PUBLIC',
    config: 'CONFIG',
    scripts: 'SCRIPTS',
    documentation: 'DOCUMENTATION',
    tests: 'TESTS',
  },
  defaultBranchId: 'br-main-01',
  defaultOrganizationId: 'org-mediera-01',
};
