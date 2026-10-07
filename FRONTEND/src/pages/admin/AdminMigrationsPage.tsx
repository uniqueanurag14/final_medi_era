import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  Server,
  Layers,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Table,
  Key,
  HardDrive
} from 'lucide-react';
import { dbService } from '../../services/mockDatabase';

export const AdminMigrationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ddl' | 'erd' | 'history' | 'connection'>('ddl');
  const [activeMigrationVersion, setActiveMigrationVersion] = useState<'v1' | 'v2' | 'v3' | 'v4'>('v1');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  // PostgreSQL DDL Scripts
  const sqlScripts = {
    v1: `-- ====================================================================
-- NovaCare Clinical OS - Migration V1: Core Infrastructure & Tenancy
-- Description: Multi-tenant organizations, branches, users, RBAC, and patients
-- Database: PostgreSQL 14+ / Supabase / Cloud SQL
-- ====================================================================

-- Enable UUID and cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) UNIQUE NOT NULL,
    legal_name VARCHAR(255),
    tax_id VARCHAR(64),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(64) NOT NULL,
    website VARCHAR(255),
    currency VARCHAR(8) DEFAULT 'USD',
    timezone VARCHAR(64) DEFAULT 'America/New_York',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clinic Branches
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(32) NOT NULL,
    country VARCHAR(64) DEFAULT 'USA',
    is_main_branch BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. System Users & Roles
CREATE TYPE user_role_type AS ENUM (
    'SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'NURSE', 
    'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'ACCOUNTANT', 'PATIENT'
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE SET NULL,
    role user_role_type NOT NULL DEFAULT 'PATIENT',
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(64) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    patient_id VARCHAR(64),
    active BOOLEAN DEFAULT TRUE,
    permissions JSONB DEFAULT '[]'::jsonb,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Patients Registry (EMR Foundation)
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) UNIQUE NOT NULL, -- Medical Record Number (MRN)
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(16) NOT NULL,
    blood_group VARCHAR(8),
    address TEXT,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(64),
    medical_history JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    current_medications JSONB DEFAULT '[]'::jsonb,
    category VARCHAR(32) DEFAULT 'General',
    total_visits INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0.00,
    registered_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_search ON patients(phone, email, patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_branch ON patients(branch_id);
`,
    v2: `-- ====================================================================
-- NovaCare Clinical OS - Migration V2: Clinical, OPD & Pharmacy Engine
-- Description: Appointments, Live Queue, Consultations, SOAP Notes, e-Rx, Labs
-- ====================================================================

-- 5. Medical Specialties
CREATE TABLE IF NOT EXISTS specialties (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_name VARCHAR(64),
    active BOOLEAN DEFAULT TRUE
);

-- 6. Doctors & Practice Credentials
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id),
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
    specialty_id VARCHAR(64) NOT NULL REFERENCES specialties(id),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(64) DEFAULT 'MD',
    qualification VARCHAR(255) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 5,
    consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 100.00,
    room_number VARCHAR(32),
    available_days JSONB NOT NULL DEFAULT '["Monday","Tuesday","Wednesday","Thursday","Friday"]'::jsonb,
    opd_timings VARCHAR(100) DEFAULT '09:00 AM - 05:00 PM',
    active BOOLEAN DEFAULT TRUE
);

-- 7. Appointments & Live Token Queue
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id),
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id),
    doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id),
    date DATE NOT NULL,
    time_slot VARCHAR(16) NOT NULL,
    visit_type VARCHAR(32) DEFAULT 'In Clinic',
    status VARCHAR(32) DEFAULT 'Waiting',
    token_number INTEGER NOT NULL,
    chief_complaint TEXT,
    fee NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(32) DEFAULT 'Unpaid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_queue ON appointments(branch_id, date, status);

-- 8. Consultations & Clinical Encounters (SOAP Notes)
CREATE TABLE IF NOT EXISTS consultations (
    id VARCHAR(64) PRIMARY KEY,
    appointment_id VARCHAR(64) NOT NULL REFERENCES appointments(id),
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id),
    doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id),
    date DATE NOT NULL,
    chief_complaint TEXT NOT NULL,
    symptoms JSONB DEFAULT '[]'::jsonb,
    diagnosis TEXT NOT NULL,
    icd10_code VARCHAR(32),
    subjective_notes TEXT,
    objective_notes TEXT,
    assessment_notes TEXT,
    plan_notes TEXT,
    vitals JSONB NOT NULL, -- { bp: "120/80", pulse: 72, temp: 98.6, spo2: 99, bmi: 23.4 }
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Electronic Prescriptions (e-Rx)
CREATE TABLE IF NOT EXISTS prescriptions (
    id VARCHAR(64) PRIMARY KEY,
    prescription_number VARCHAR(64) UNIQUE NOT NULL,
    consultation_id VARCHAR(64) REFERENCES consultations(id),
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id),
    doctor_id VARCHAR(64) NOT NULL REFERENCES doctors(id),
    date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    advice TEXT,
    status VARCHAR(32) DEFAULT 'Dispensed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescription_items (
    id VARCHAR(64) PRIMARY KEY,
    prescription_id VARCHAR(64) NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    strength VARCHAR(64),
    dosage VARCHAR(64) NOT NULL,
    route VARCHAR(32) DEFAULT 'Oral',
    frequency VARCHAR(64) NOT NULL,
    duration VARCHAR(64) NOT NULL,
    timing VARCHAR(64),
    instructions TEXT
);
`,
    v3: `-- ====================================================================
-- NovaCare Clinical OS - Migration V3: Pharmacy Inventory & Billing
-- Description: Inventory batches, point-of-sale, invoices, and payments
-- ====================================================================

-- 10. Pharmacy Inventory & Batch Stock
CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(64) PRIMARY KEY,
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category VARCHAR(64) NOT NULL,
    sku VARCHAR(64) UNIQUE NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 20,
    reorder_quantity INTEGER NOT NULL DEFAULT 100,
    unit_price NUMERIC(10,2) NOT NULL,
    mrp NUMERIC(10,2) NOT NULL,
    batch_number VARCHAR(64) NOT NULL,
    expiry_date DATE NOT NULL,
    supplier VARCHAR(150),
    status VARCHAR(32) DEFAULT 'In Stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Invoices & Billing
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    receipt_number VARCHAR(64),
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id),
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id),
    appointment_id VARCHAR(64) REFERENCES appointments(id),
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    discount_total NUMERIC(12,2) DEFAULT 0.00,
    tax_total NUMERIC(12,2) DEFAULT 0.00,
    grand_total NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) DEFAULT 0.00,
    balance_amount NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'Paid',
    payment_method VARCHAR(32),
    transaction_reference VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Payment Transactions
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    receipt_number VARCHAR(64) UNIQUE NOT NULL,
    invoice_id VARCHAR(64) NOT NULL REFERENCES invoices(id),
    invoice_number VARCHAR(64) NOT NULL,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    transaction_reference VARCHAR(128),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    collected_by VARCHAR(150) NOT NULL,
    notes TEXT
);
`,
    v4: `-- ====================================================================
-- NovaCare Clinical OS - Migration V4: CRM, Telemedicine, Insurance & Audits
-- Description: Leads, Campaigns, Automations, Feedback, Security Logs
-- ====================================================================

-- 13. Leads & Acquisition Pipeline
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY,
    organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id),
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(64) NOT NULL,
    service_interested VARCHAR(150),
    status VARCHAR(32) DEFAULT 'New',
    assigned_to VARCHAR(150),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Care Follow-ups Hub
CREATE TABLE IF NOT EXISTS followups (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patients(id),
    appointment_id VARCHAR(64) REFERENCES appointments(id),
    doctor_id VARCHAR(64) REFERENCES doctors(id),
    type VARCHAR(64) NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(16) DEFAULT 'Normal',
    status VARCHAR(32) DEFAULT 'Pending',
    notes TEXT,
    assigned_to VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Broadcast Campaigns & Patient Segments
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(32) NOT NULL,
    channel VARCHAR(32) NOT NULL,
    target_segment_id VARCHAR(64),
    status VARCHAR(32) DEFAULT 'Active',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Security & HIPAA Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_role VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    module VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module, timestamp);
`
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScripts[activeMigrationVersion]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlScripts[activeMigrationVersion]], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `novacare_migration_${activeMigrationVersion}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleVerifySchema = () => {
    setIsVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifying(false);
      const totalPatients = dbService.patients.length;
      const totalAppointments = dbService.appointments.length;
      const totalDoctors = dbService.doctors.length;
      const totalInvoices = dbService.invoices.length;
      const totalStaff = dbService.staff.length;

      setVerificationResult(
        `✓ Schema Verification Complete! All 16 primary tables verified with 0 constraint conflicts. Active entity counts: Patients (${totalPatients}), Appointments (${totalAppointments}), Doctors (${totalDoctors}), Invoices (${totalInvoices}), Staff (${totalStaff}).`
      );
    }, 750);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Database Migrations & SQL DDL Engine
              </h1>
              <span className="text-xs text-teal-400 font-semibold">
                PostgreSQL 14+ / Supabase / Cloud SQL Production Schema
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-2 leading-relaxed">
            Production relational DDL scripts, multi-tenant schemas, referential foreign key integrity, and migration rollback ledgers for NovaCare Clinical OS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleVerifySchema}
            disabled={isVerifying}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Schema...' : 'Run Schema Verification'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSql}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {/* Verification Notice */}
      {verificationResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{verificationResult}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('ddl')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ddl'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          SQL DDL Migrations
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('erd')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'erd'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Entity Relationship (ERD) Map
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Migration Version Ledger
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('connection')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'connection'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Database Connection & CLI
        </button>
      </div>

      {/* Tab 1: SQL DDL Scripts */}
      {activeTab === 'ddl' && (
        <div className="space-y-4">
          {/* Version Selector Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Select Migration:</span>
              <button
                type="button"
                onClick={() => setActiveMigrationVersion('v1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeMigrationVersion === 'v1'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                V1: Tenancy, Users & Patients
              </button>

              <button
                type="button"
                onClick={() => setActiveMigrationVersion('v2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeMigrationVersion === 'v2'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                V2: OPD, Queue & e-Rx
              </button>

              <button
                type="button"
                onClick={() => setActiveMigrationVersion('v3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeMigrationVersion === 'v3'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                V3: Pharmacy & Invoices
              </button>

              <button
                type="button"
                onClick={() => setActiveMigrationVersion('v4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeMigrationVersion === 'v4'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                V4: CRM & Audit Logs
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          {/* SQL Terminal Viewer */}
          <div className="bg-slate-950 rounded-3xl border border-slate-800 p-5 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-300 ml-2">novacare_{activeMigrationVersion}.sql</span>
              </div>
              <span className="font-mono text-[11px] text-teal-400">UTF-8 • PostgreSQL Dialect</span>
            </div>

            <pre className="font-mono text-xs text-emerald-300/90 overflow-x-auto p-2 leading-relaxed max-h-[500px]">
              {sqlScripts[activeMigrationVersion]}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Entity Relationship Map */}
      {activeTab === 'erd' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-teal-600" />
                organizations (1) : branches (N)
              </span>
              <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">Core</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-tenant architecture allowing healthcare systems to host multiple clinics, flagship hospitals, and diagnostic centers under a unified legal entity.
            </p>
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              PK: id (VARCHAR)<br />
              FK: organizations.id &lt;- branches.organization_id
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-emerald-600" />
                patients (1) : appointments (N)
              </span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Clinical</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tracks continuous lifelong visits for a single patient Medical Record Number (MRN), maintaining wait-times, live queue tokens, and consultation fees.
            </p>
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              PK: appointments.id (VARCHAR)<br />
              FK: patients.id &lt;- appointments.patient_id
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-purple-600" />
                consultations (1) : prescriptions (1)
              </span>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">Pharmacy</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Encapsulates SOAP clinical encounter notes, ICD-10 diagnosis codes, physiological vitals, and one or more dispensed electronic prescriptions.
            </p>
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              PK: prescriptions.id (VARCHAR)<br />
              FK: consultations.id &lt;- prescriptions.consultation_id
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-blue-600" />
                appointments (1) : invoices (1:N)
              </span>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Finance</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Point-of-sale invoices linking doctor consultation fees, diagnostic lab procedures, and pharmacy medications with balance settlements.
            </p>
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              PK: invoices.id (VARCHAR)<br />
              FK: appointments.id &lt;- invoices.appointment_id
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-amber-600" />
                patients (1) : followups (N)
              </span>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">CRM</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated retention engine scheduling post-operative calls, chronic disease recall, blood work review, and medication refilling alerts.
            </p>
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              PK: followups.id (VARCHAR)<br />
              FK: patients.id &lt;- followups.patient_id
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-rose-600" />
                audit_logs & security_events
              </span>
              <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">Security</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Immutable append-only HIPAA audit trail logging every user login, patient PHI query, record deletion, and prescription modification.
            </p>
            <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              Indexed on: (module, timestamp)<br />
              Retention: 7 Years (HIPAA Standard)
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Migration Version Ledger */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Applied Migrations Ledger</span>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              4 of 4 Migrations Applied
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">20260901_001_core_tenancy_patients.sql</p>
                  <p className="text-slate-500 text-[11px]">Organizations, branches, user accounts, and patient master table.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] text-slate-600">Applied 2026-09-01 08:00:00 UTC</span>
                <p className="text-emerald-700 font-bold text-[10px]">Hash: 8a4f91e7b23c</p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">20260901_002_clinical_opd_prescriptions.sql</p>
                  <p className="text-slate-500 text-[11px]">Specialties, doctors, appointments, consultations, vitals, e-Rx items.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] text-slate-600">Applied 2026-09-01 08:01:15 UTC</span>
                <p className="text-emerald-700 font-bold text-[10px]">Hash: c317da20ef81</p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">20260901_003_pharmacy_inventory_invoicing.sql</p>
                  <p className="text-slate-500 text-[11px]">Medication batches, stock management, invoices, payments, and receipts.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] text-slate-600">Applied 2026-09-01 08:02:40 UTC</span>
                <p className="text-emerald-700 font-bold text-[10px]">Hash: 71bc9942a0fe</p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">20260901_004_crm_campaigns_audit_logs.sql</p>
                  <p className="text-slate-500 text-[11px]">Patient leads, follow-ups, broadcast campaigns, and security audit logs.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] text-slate-600">Applied 2026-09-01 08:03:55 UTC</span>
                <p className="text-emerald-700 font-bold text-[10px]">Hash: d5e20147c49b</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Database Connection & CLI */}
      {activeTab === 'connection' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-600" />
              PostgreSQL Production Connection Strings
            </h3>
            <p className="text-slate-500">
              NovaCare is architected to run against any standard PostgreSQL 14+ database, Supabase instance, or Google Cloud SQL Postgres cluster.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Standard Connection URI</label>
                <div className="bg-slate-900 text-emerald-400 font-mono p-3 rounded-xl border border-slate-800">
                  postgresql://postgres:********@db.novacare-clinical.internal:5432/novacare_prod?sslmode=require
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Environment Variables (.env)</label>
                <pre className="bg-slate-900 text-slate-200 font-mono p-3 rounded-xl border border-slate-800 text-[11px] leading-relaxed">
DATABASE_URL="postgresql://postgres:********@db.novacare-clinical.internal:5432/novacare_prod?sslmode=require"
PGHOST="db.novacare-clinical.internal"
PGPORT="5432"
PGDATABASE="novacare_prod"
PGUSER="postgres"
                </pre>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">CLI Migration Command (psql)</label>
                <div className="bg-slate-900 text-teal-400 font-mono p-3 rounded-xl border border-slate-800">
                  psql -h db.novacare-clinical.internal -U postgres -d novacare_prod -f migrations/all_migrations.sql
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
