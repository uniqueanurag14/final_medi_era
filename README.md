# MediEra — Enterprise Medical CRM & ERP Platform

> **Product Name:** MediEra  
> **Copyright:** © 2026 MediEra. Powered by [YantraEra](https://yantraera.com/)  
> **All Rights Reserved.**

---

## 🌟 Executive Summary

**MediEra** is an enterprise-grade, multi-branch **Medical CRM & ERP Platform** engineered for outpatient polyclinics, specialized medical centers, diagnostic laboratories, and hospital networks. Originally conceived as AutoEra, the system has been transformed into a healthcare operating engine with three distinct user tiers:

1. **Super Admin & Administrators**: Full organizational governance, multi-branch control, employee responsibility assignments, role & permission matrices, menu structuring, database settings, and system-wide audit controls.
2. **Employees & Clinical Staff**: Role-tailored operational workspaces (Doctors, Nurses, Receptionists, Lab Phlebotomists, Pharmacists, Billing Clerks) managing patients, electronic health charts, consultations, digital triage, appointments, service bookings, and inventory dispenses.
3. **Customers & Patients**: Self-service portal for scheduling appointments, completing digital intake forms, accessing prescriptions, viewing diagnostic laboratory reports, managing chronic care plans, and tracking payments.

---

## 🏗️ High-Level System Architecture

```text
                                MEDIERA MEDICAL CRM + ERP
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
    Super Admin                          Admin                            Employee
  (System Config)                  (Branch Governance)               (Clinical Operations)
         │                                 │                                 │
         └─────────────────────────────────┼─────────────────────────────────┘
                                           │
                           Role-Based Access Control (RBAC)
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
   Organization & Menus                   CRM                               ERP
         │                                 │                                 │
    ├─ Multi-Branch Network           ├─ Patients / 360° Profile        ├─ Inventory & Batches
    ├─ Employee Responsibilities      ├─ Service Bookings & OPD Queue   ├─ Excel / CSV Bulk Import
    ├─ Custom Role Permissions        ├─ Digital Intake Forms           ├─ Automated Stock Depletion
    ├─ Menu Navigation Hierarchy      ├─ Clinical Referrals             ├─ Reorder Level Warnings
    └─ Settings & Demo Login Toggle   └─ Chronic Care Plans             └─ POS & Billing Desks
                                           │
                               Central Database Adapter
                            (BACKEND/src/db/adapter.ts)
                                  /                 \
                       PostgreSQL (Default)        MySQL 8+
```

---

## 📊 Comprehensive Project Analysis

### ✅ What Has Been Completed & Built

| Domain | Implemented Features & Architectural Assets |
| :--- | :--- |
| **Organization Management** | Multi-branch architecture, branch profile customization, tax identification numbers, official contact hotlines, facility operating hours. |
| **Employee & Responsibility Engine** | Flexible multi-responsibility model (`EmployeeResponsibilityAssignment`), branch attachments, department memberships, shift scheduling, workload scoring, and real-time operational task queues. |
| **Role & Permission Management** | Granular RBAC supporting Super Admin, Admin, Doctor, Receptionist, Nurse, Lab Technician, Pharmacist, and Accountant roles with fine-grained capability checks. |
| **Customer / Patient CRM** | Comprehensive Patient 360° view, digital medical history, emergency contacts, insurance policies, visit timelines, demographic segmentation, customer tagging, and lifecycle stage tracking. |
| **Digital Patient Intake** | Online self-serve pre-visit questionnaires, chief complaint logs, pain rating scale, allergy declarations, current medications list, past surgeries, ID uploads, and digital consent signatures. |
| **Service Booking & OPD Queue** | Multi-specialty booking engine, real-time live OPD queue tokens, doctor calendar time-slots, patient status transitions (`Scheduled` → `Checked In` → `Triage` → `In Consultation` → `Completed`). |
| **Clinical Consultation & e-Rx** | SOAP clinical notes (Subjective, Objective, Assessment, Plan), ICD-10 diagnostic codes, electronic prescriptions with drug-drug interaction safety screening, and lab test ordering. |
| **Inventory ERP & Dispensing** | Centralized stock catalog, expiry date monitoring, automated reorder thresholds, unit cost & MRP tracking, batch numbers, and Excel/CSV bulk import engines. |
| **Navigation & Menu Hierarchy** | Dynamic multi-category navigation supporting front-office, back-office, clinical suites, and administrative governance with permission-based menu visibility. |
| **Billing, POS & Finance** | Itemized invoice generator, tax calculations, discounts, split payment methods (Cash, Card, UPI, POS Terminal, Insurance), refund logging, and daily batch reconciliations. |
| **Dual Database Adapter** | Centralized database interface (`BACKEND/src/db/adapter.ts`) supporting PostgreSQL and MySQL 8+ with environment toggling, connection pooling, and transactional integrity. |
| **Secure Database Cleanup** | `npm run clean-table` command with strict **Super Admin Protection Policies** preventing accidental account deletion, alteration, or permission revocation. |
| **System Settings & Demo Login** | Configurable settings API with an Admin switch to enable/disable Demo Login, protecting production deployments. |

---

### ⏳ What Is Planned & Next On The Roadmap

1. **Direct Bi-Directional WhatsApp Webhook Receiver**: Live inbound chat webhook parsing to let patients confirm, cancel, or reschedule appointments directly via WhatsApp conversational messaging.
2. **DICOM PACS Medical Imaging Integration**: Browser-based zero-footprint medical imaging viewer for X-Rays, CT scans, and MRIs with pan, zoom, and Hounsfield unit windowing.
3. **Automated Insurance Claims Clearinghouse**: Real-time ANSI X12 837/835 insurance claim submission and automated electronic remittance advice (ERA) parsing.
4. **Offline PWA Sync Engine**: Local IndexedDB offline queue for outpatient triage and emergency room check-in during temporary network interruptions.

---

## 📖 User Manuals by User Tier

### A. Super Admin & Admin Manual

#### 1. System Login & Security
- Access MediEra via the administrative console at `/` or by clicking **Super Admin Console**.
- Authenticate using your credentials.
- Super Admin accounts are permanently protected against automated cleanup scripts and external deletion.

#### 2. Organization & Multi-Branch Governance
- Navigate to **Admin Settings → Organization**.
- Modify corporate credentials, tax identifiers, legal business name, brand logo, and emergency hotlines.
- Access **Branches** to provision new outpatient centers, diagnostic wings, or regional dispensaries. Assign distinct physical addresses, timezones, and operating schedules.

#### 3. Employee & Responsibility Configuration
- Navigate to **Staff & Responsibilities**.
- Create employees, configure system roles (e.g., Nurse, Phlebotomist, Cashier), and multi-assign departments, shifts, and branches.
- Set concurrent task capacity thresholds to prevent staff overload.

#### 4. Menu & Navigation Administration
- Customize visible front-office and back-office navigation links.
- Reorder menu groupings and enforce permission gates per department.

#### 5. Demo Login & Security Hardening
- Go to **Admin Settings → Security & Access**.
- Toggle **Demo Login** `OFF` before deploying to staging or production. When disabled, demo buttons and credential shortcuts disappear immediately.

#### 6. Database Cleanup Routine (`clean-table`)
- When resetting staging or removing test mock data, execute:
  ```bash
  npm run clean-table
  ```
- **Super Admin Protection Guarantee**: The cleanup engine automatically protects the Super Admin username, email (`admin@mediera.com`), password, permissions, and active status while cleanly purging mock transactions, sample patients, and temporary logs.

---

### B. Employee & Clinical Staff Manual

#### 1. Shift Check-In & Queue Access
- Log in using your assigned staff credentials.
- Your personal console dynamically adapts to your clinical role:
  - **Doctors**: Direct access to OPD Consultation Queue, Patient Clinical History, and e-Prescription pad.
  - **Nurses**: Direct access to Vitals Triage, Bedside Observations, and Clinical Task Queues.
  - **Receptionists**: Access to Front Desk Walk-in Registration, Token Generation, and Cashier POS.
  - **Pharmacists**: Access to Dispensing Queue, Formulary Checks, and Batch Expiry Alerts.

#### 2. Patient Registration & 360° History
- Search existing patients by phone number, national ID, or patient MRN.
- Register new patients with demographic details, emergency contacts, and insurance coverage.
- View the unified **Patient 360° Drawer** to inspect previous diagnoses, lab trends, and active medications.

#### 3. Service Bookings & Appointments
- Schedule outpatient visits across available medical specialists and rooms.
- Update appointment statuses (`Checked In`, `Triage`, `In Consultation`, `Completed`).
- Review digital intake forms submitted by patients prior to their visit.

#### 4. Inventory & Dispensing Operations
- Search medication stock levels, view batch numbers, and verify expiry dates before dispensing.
- Dispensing a prescription automatically deducts units from the active inventory batch and logs audit history.

---

### C. Customer & Patient Manual

#### 1. Accessing the Patient Portal
- Open the MediEra portal in any modern web browser on desktop or mobile.
- Log in using your registered email or mobile phone with OTP/password.

#### 2. Booking a Doctor or Diagnostic Service
- Browse available medical specialties (Cardiology, Pediatrics, Dermatology, Orthopedics, etc.).
- Select your preferred physician, clinic branch, and appointment slot.
- Confirm your booking to receive an instant digital confirmation token.

#### 3. Pre-Visit Digital Intake Form
- Prior to your appointment, complete the online intake questionnaire.
- Fill in your current symptoms, pain rating, existing health conditions, drug allergies, and current medications.
- Sign the digital treatment consent form to eliminate waiting room paperwork.

#### 4. Managing Your Health Records & Care Plans
- Download completed doctor prescription notes, medication guidelines, and dosage schedules.
- Access verified diagnostic laboratory reports as soon as they are signed off by the pathologist.
- Track personalized chronic disease care goals (blood pressure, fasting glucose, activity targets).

---

## ⚙️ Environment Configuration

### PostgreSQL Engine
```env
CURRENT_DATABASE=PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/mediera_clinic_db"

PGHOST=localhost
PGPORT=5432
PGDATABASE=mediera_clinic_db
PGUSER=postgres
PGPASSWORD=your_password
PGSSL=false
```

### MySQL 8+ Engine
```env
CURRENT_DATABASE=MySQL
DATABASE_URL="mysql://root:your_password@localhost:3306/mediera_clinic_db"

MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLDATABASE=mediera_clinic_db
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQLSSL=false
```

---

## 🛠️ Developer Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the MediEra dev server on `http://0.0.0.0:3000` |
| `npm run build` | Compiles the production build into `dist/` |
| `npm run lint` | Performs strict TypeScript type checks (`tsc --noEmit`) |
| `npm run db-init` | **Single standard command** for database initialization, migrations, schema creation, system roles, and Chart of Accounts seeding (idempotent) |
| `npm run clean-table -- --confirm` | Safely purges development test/demo data while protecting Super Admin, system roles, chart of accounts, and migrations |
| `npm run del-table -- --confirm` | Drops application tables while protecting system tables and schema migrations (blocked in production) |
| `npm run free-port` | Cross-platform port management utility to terminate orphaned processes listening on port 3000 (PowerShell/CMD/Bash) |
| `npm run preview` | Previews the compiled production bundle locally |

### Database Initialization & Migration
```bash
# Run database schema migrations, indexes, constraints, and seed system records
npm run db-init
```

### Development Database Cleanup
```bash
# Reset development/testing dummy data (requires explicit confirmation, blocked in production)
npm run clean-table -- --confirm
```


---

## 🔒 Copyright & License Notice

**MediEra** is copyrighted proprietary software.  
Copyright © 2026 **MediEra**. Engineered and published by **[YantraEra](https://yantraera.com/)**.  
All rights reserved. Unauthorized copying, distribution, or decompilation is strictly prohibited.
