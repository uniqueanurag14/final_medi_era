-- Migration: 003_account_heads_and_finance.sql
-- Description: Financial Management System - Chart of Accounts, Account Groups, Account Heads, and Double-Entry Journal

-- 1. Account Groups (Assets, Liabilities, Equity, Income, Expenses)
CREATE TABLE IF NOT EXISTS account_groups (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(128) NOT NULL UNIQUE,
  category TEXT NOT NULL,
  normal_balance TEXT DEFAULT 'Debit' NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Account Heads (Sub-Ledgers / Specific Accounts)
CREATE TABLE IF NOT EXISTS account_heads (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  group_id VARCHAR(64) NOT NULL REFERENCES account_groups(id) ON DELETE CASCADE,
  code VARCHAR(32) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  currency TEXT DEFAULT 'USD' NOT NULL,
  current_balance NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
  is_system BOOLEAN DEFAULT FALSE NOT NULL,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Journal Entries (General Ledger Header)
CREATE TABLE IF NOT EXISTS journal_entries (
  id VARCHAR(64) PRIMARY KEY,
  entry_number VARCHAR(128) NOT NULL UNIQUE,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
  date VARCHAR(32) NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  description TEXT NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL,
  status TEXT DEFAULT 'Posted' NOT NULL,
  posted_by TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Journal Lines (Debits and Credits)
CREATE TABLE IF NOT EXISTS journal_lines (
  id SERIAL PRIMARY KEY,
  journal_entry_id VARCHAR(64) NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_head_id VARCHAR(64) NOT NULL REFERENCES account_heads(id) ON DELETE RESTRICT,
  type TEXT NOT NULL,
  debit NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
  credit NUMERIC(14, 2) DEFAULT 0.00 NOT NULL,
  description TEXT
);

-- Indexes for Financial Queries
CREATE INDEX IF NOT EXISTS idx_account_heads_group ON account_heads(group_id);
CREATE INDEX IF NOT EXISTS idx_account_heads_code ON account_heads(code);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_number ON journal_entries(entry_number);
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_lines(account_head_id);

-- 5. Seed Core System Account Groups (Idempotent: ON CONFLICT DO NOTHING)
INSERT INTO account_groups (id, code, name, category, normal_balance, description, is_system)
VALUES
  ('grp-assets', '1000', 'Assets', 'Asset', 'Debit', 'Economic resources owned and controlled by the medical facility', TRUE),
  ('grp-liabilities', '2000', 'Liabilities', 'Liability', 'Credit', 'Debts and financial obligations owed to external parties and vendors', TRUE),
  ('grp-equity', '3000', 'Equity', 'Equity', 'Credit', 'Net worth, owners capital, and retained earnings of the practice', TRUE),
  ('grp-income', '4000', 'Income', 'Revenue', 'Credit', 'Operating revenue from medical consultations, pharmacy, diagnostic tests', TRUE),
  ('grp-expenses', '5000', 'Expenses', 'Expense', 'Debit', 'Operational costs, clinical supplies, payroll, and maintenance', TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  normal_balance = EXCLUDED.normal_balance,
  description = EXCLUDED.description;

-- 6. Seed Standard System Account Heads (Idempotent: ON CONFLICT DO NOTHING)
INSERT INTO account_heads (id, organization_id, group_id, code, name, description, currency, current_balance, is_system, active)
VALUES
  -- Assets (1000)
  ('head-1010', 'org-mediera-01', 'grp-assets', '1010', 'Cash on Hand & Front Desk Till', 'Physical currency held at reception and cash counters', 'USD', 0.00, TRUE, TRUE),
  ('head-1020', 'org-mediera-01', 'grp-assets', '1020', 'Bank Operating Account', 'Primary commercial bank checking account for daily operations', 'USD', 0.00, TRUE, TRUE),
  ('head-1030', 'org-mediera-01', 'grp-assets', '1030', 'Accounts Receivable (Patients & TPAs)', 'Outstanding patient bills and pending insurance reimbursements', 'USD', 0.00, TRUE, TRUE),
  ('head-1040', 'org-mediera-01', 'grp-assets', '1040', 'Pharmacy Formulary Inventory Asset', 'Value of in-stock pharmaceuticals, consumables and vaccines', 'USD', 0.00, TRUE, TRUE),
  
  -- Liabilities (2000)
  ('head-2010', 'org-mediera-01', 'grp-liabilities', '2010', 'Accounts Payable (Suppliers & Vendors)', 'Unsettled invoices owed to pharmaceutical distributors and lab reagents suppliers', 'USD', 0.00, TRUE, TRUE),
  ('head-2020', 'org-mediera-01', 'grp-liabilities', '2020', 'Sales Tax & VAT Payable', 'Healthcare services tax and sales tax collected awaiting government remittance', 'USD', 0.00, TRUE, TRUE),
  
  -- Equity (3000)
  ('head-3010', 'org-mediera-01', 'grp-equity', '3010', 'Retained Earnings / Clinical Capital', 'Accumulated earnings retained for healthcare equipment and facility expansion', 'USD', 0.00, TRUE, TRUE),
  
  -- Income (4000)
  ('head-4010', 'org-mediera-01', 'grp-income', '4010', 'Physician Consultation Fees Revenue', 'Gross revenue earned from in-clinic, video and specialist doctor consultations', 'USD', 0.00, TRUE, TRUE),
  ('head-4020', 'org-mediera-01', 'grp-income', '4020', 'Pathology & Diagnostic Laboratory Revenue', 'Revenue from hematology, biochemistry, radiological imaging and rapid tests', 'USD', 0.00, TRUE, TRUE),
  ('head-4030', 'org-mediera-01', 'grp-income', '4030', 'Pharmacy & Dispensary Sales Revenue', 'Prescription drug dispensing and over-the-counter medical retail sales', 'USD', 0.00, TRUE, TRUE),
  ('head-4040', 'org-mediera-01', 'grp-income', '4040', 'Preventive Health Checkup Packages Revenue', 'Comprehensive executive wellness and preventive care package subscriptions', 'USD', 0.00, TRUE, TRUE),
  
  -- Expenses (5000)
  ('head-5010', 'org-mediera-01', 'grp-expenses', '5010', 'Medical Supplies & Reagents COGS', 'Cost of dispensed pharmaceuticals, syringes, test kits and gloves', 'USD', 0.00, TRUE, TRUE),
  ('head-5020', 'org-mediera-01', 'grp-expenses', '5020', 'Clinical Staff & Nursing Salaries', 'Salaries, nursing payroll, on-call doctor stipends and benefits', 'USD', 0.00, TRUE, TRUE),
  ('head-5030', 'org-mediera-01', 'grp-expenses', '5030', 'Clinic Facility Rent & Utility Expenses', 'Hospital building lease, electricity, medical waste disposal and water', 'USD', 0.00, TRUE, TRUE),
  ('head-5040', 'org-mediera-01', 'grp-expenses', '5040', 'Medical Equipment Maintenance & IT Licensing', 'Biomedical maintenance contracts, EHR software subscriptions and cloud backup', 'USD', 0.00, TRUE, TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_system = EXCLUDED.is_system;
