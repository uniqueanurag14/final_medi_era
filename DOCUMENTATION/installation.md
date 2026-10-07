# MediEra Medical CRM & ERP — Production Installation & Deployment Guide

## 1. System Architecture Overview
MediEra is an enterprise-grade Medical Practice Management, Clinic CRM, and Clinical ERP platform engineered for multi-branch healthcare centers, specialty clinics, and hospital networks.

### Architecture Highlights:
- **Client Tier**: High-performance React 18+ Single Page Application with Tailwind CSS and Lucide React.
- **Data & Persistence Layer**: Singleton service architecture with dual PostgreSQL 16 / MySQL 8.0 relational schema support, local storage fallback, and complete Super Admin control over demo/sample data.
- **Empty Database Ready**: Functions with zero business records upon first boot.
- **Demo Data Lifecycle**: Isolated demo/sample datasets with idempotent "Check & Update, Don't Duplicate" safe seeding mechanism.

---

## 2. Hardware & Software Prerequisites

| Component | Minimum Specification | Recommended Production |
| :--- | :--- | :--- |
| **Node.js** | v18.17.0 LTS | v20.x or v22.x LTS |
| **Package Manager**| npm v9+ or bun v1.1+ | npm v10+ / bun v1.1+ |
| **Database** | SQLite 3 / PostgreSQL 14+ | PostgreSQL 16 or MySQL 8.0 |
| **Memory (RAM)** | 2 GB | 4 GB - 8 GB |
| **CPU** | 1 vCPU | 2 - 4 vCPU |
| **Disk Storage** | 10 GB SSD | 50 GB SSD (NVMe) |
| **Network** | Port 3000 exposed | Reverse proxy (Nginx / Cloud Run) on Port 80/443 |

---

## 3. Step-by-Step Installation

### Step 1: Clone or Extract Codebase
```bash
git clone https://github.com/organization/mediera-crm-erp.git
cd mediera-crm-erp
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the provided `.env.example` template:
```bash
cp .env.example .env
```

Edit `.env` with your production parameters:
```env
# Single Source of Truth Database Configuration (MySQL or PostgreSQL)
CURRENT_DATABASE=PostgreSQL
DATABASE_URL="postgresql://postgres:SecurePassword123@localhost:5432/mediera_clinic_db"

PGHOST=localhost
PGPORT=5432
PGDATABASE=mediera_clinic_db
PGUSER=postgres
PGPASSWORD=SecurePassword123
PGSSL=require

# Application Secrets
JWT_SECRET="generate-a-secure-random-64-character-secret"
JWT_REFRESH_SECRET="generate-another-secure-random-64-character-secret"
API_URL="https://clinic.yourdomain.com/api"
FRONTEND_URL="https://clinic.yourdomain.com"

# Notification & Gateways
NOTIFICATIONS_ENABLED=true
ENABLE_EMAIL_NOTIFICATIONS=true
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER="apikey"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_EMAIL="appointments@yourclinic.com"
```

---

## 4. Database Initialization & Migrations

MediEra provides a single standard command for initializing and maintaining the application database across its lifecycle:

### Single Standard Initialization Command:
```bash
npm run db-init
```

### What `npm run db-init` Performs:
1. **Connects to configured database** (PostgreSQL or MySQL as specified in `.env`).
2. **Initializes migration tracking table** (`_schema_migrations`) to maintain strict migration history.
3. **Discovers and applies pending migrations** in `src/db/migrations/`:
   - `001_initial_schema.sql`: Creates core organizations, branches, patients, appointments, billing, prescriptions, lab tests, inventory, and audit log tables.
   - `002_authentication_and_system_roles.sql`: Seeds system roles (`SUPER_ADMIN`, `ACCOUNTANT`, `DATA_ENTRY`, `ADMIN`, `DOCTOR`, `RECEPTIONIST`, `NURSE`, `PATIENT`), permissions, default organization and main branch, and the primary Super Admin account.
   - `003_account_heads_and_finance.sql`: Creates `account_groups`, `account_heads`, `journal_entries`, `journal_lines`, and initializes the 5 core Chart of Accounts groups (`Assets`, `Liabilities`, `Equity`, `Income`, `Expenses`) and standard ledger account heads.
4. **Guarantees Idempotency**:
   - Safe to run on a brand-new empty database.
   - Safe to run repeatedly on an active production database.
   - Never drops tables or destroys existing clinical/financial data.
   - Checks and updates records without creating duplicates.

---

## 5. Development Database Cleanup: `npm run clean-table`

For development and automated QA testing, MediEra provides a safe cleanup utility:

```bash
# Development / Staging Cleanup (Requires explicit confirmation)
npm run clean-table -- --confirm
```

### Safety Rules & Protections:
- **Refuses in Production**: Blocks execution automatically if `NODE_ENV=production` or `APP_ENV=production`.
- **Explicit Confirmation Required**: Prompts user in interactive terminal or requires `--confirm` / `--yes` flag.
- **Preserves Schema Structure**: No tables, columns, indexes, foreign keys, or constraints are dropped.
- **Preserves Migration History**: `_schema_migrations` table remains untouched.
- **Preserves System Records**:
  - Super Admin account (`usr-admin-01` / `admin@mediera.com`) is 100% protected and preserved.
  - System roles (`SUPER_ADMIN`, `ACCOUNTANT`, `DATA_ENTRY`, etc.) are preserved.
  - System account groups and Chart of Accounts heads are preserved.
  - Organization profiles and main branch are preserved.
- **Deletes Only Test/Dummy Data**: Purges test appointments, demo invoices, test patients, test bookings, and temporary cache in safe foreign-key dependency order.

---

## 6. Demo Data Management & Production Clean Boot

MediEra provides Super Admins with full control over demo sample data:

### Pure Production (Zero Demo Records):
1. Log in as **Super Admin**.
2. Navigate to **Administration & Technical Configuration** (`admin-settings`).
3. Under the **Demo Data Management** tab:
   - Click **Disable Demo Data**.
   - The application immediately filters out all sample data (`WHERE is_demo = false`).
   - If desired, click **Reset to Empty Production DB** to reset all patient, appointment, billing, and inventory business tables to zero (`0`) records.
4. The system is now 100% clean and ready to record live patients.

### Safe Demo Seeding (For Staff Training / Staging):
- Click **Seed Demo Data Safely**.
- The system checks existing records by Unique Patient ID, Email, and Phone number.
- **Directive Enforcement**: Updates matching demo records in place and only creates missing sample records. Existing production patients and transactions are never overwritten or duplicated.

---

## 6. Building for Production

### Verify Code Integrity & Types:
```bash
npm run lint
```

### Build Production Bundle:
```bash
npm run build
```
The compiled, optimized static assets will be output to `/dist`.

### Launch Production Server:
```bash
npm run start
```

---

## 7. Containerization (Docker)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "run", "start"]
```

---

## 8. Post-Installation Verification Checklist
- [x] Application loads at `http://localhost:3000` with zero header gap.
- [x] Public landing page, doctor directory, and services catalog load without errors.
- [x] Super Admin login succeeds.
- [x] Toggle Demo Data On/Off functions instantly.
- [x] Creating a walk-in patient succeeds and persists with `[PROD]` tag.
- [x] Itemized invoice generates receipt with accurate tax calculation.
