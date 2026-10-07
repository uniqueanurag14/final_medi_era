# MediEra Medical CRM & ERP — Comprehensive User Manual

## Table of Contents
1. System Overview & Role-Based Access Control (RBAC)
2. Public Patient Portal & Online Scheduling
3. Front Office & Reception Operations
4. Clinical Hub & Physician Consultation
5. Diagnostic Laboratories & Radiology
6. Pharmacy POS & Formulary Stock Control
7. Billing, Cashier Desk & Revenue Cycle
8. Growth CRM, Campaigns & Patient Retention
9. Super Admin Technical & Demo Data Governance

---

## 1. System Overview & Role-Based Access Control (RBAC)

MediEra operates with strict granular permissions configured per user role:

| Role | Primary Functions & Access Scope |
| :--- | :--- |
| **Super Admin** | Full access to multi-branch configuration, RBAC permissions, demo data toggling, safe seeding, system audit trail, and database parameters. |
| **Doctor / Physician** | Live clinical queue, patient history review, SOAP consultation notes, ICD coding, digital e-Prescriptions, and lab order requisitions. |
| **Receptionist** | Front-desk queue, daily token dispenser, patient registration (walk-ins), appointment booking, and cash desk POS billing. |
| **Nurse** | Pre-consultation vitals entry (BP, Pulse, Temperature, SpO2, BMI), triage status, and clinical notes. |
| **Accountant** | Revenue cycle management, payment reconciliation, insurance claims, invoice adjustments, and refund authorization. |
| **Patient** | Self-service appointment scheduling, digital prescription downloads, lab test results viewer, and invoice history. |

---

## 2. Public Patient Portal & Online Scheduling

### Exploring Services & Physicians
1. Visit the home portal. Navigate to **Specialities**, **Services**, or **Doctors**.
2. Filter physicians by specialty (e.g., Cardiology, Dermatology, Pediatrics, Orthopedics).
3. View doctor bios, qualifications, consultation fees, and available days.

### Booking an Appointment
1. Click **Book Appointment** in the top navigation bar or on any doctor card.
2. Select your preferred branch, medical department, and doctor.
3. Pick an available date and time slot.
4. Fill in patient information (First Name, Last Name, Mobile Phone, Email, Chief Complaint).
5. Confirm booking: Receive an instant confirmation with an appointment reference number (e.g. `APT-2026-001`) and queue token number.

---

## 3. Front Office & Reception Operations

### Live Queue & Token Dispenser
- Navigate to **Front Office Operations** &rarr; **Live Queue & Token Dispenser**.
- As patients arrive at the clinic lobby, locate their appointment and click **Check In**.
- The system automatically generates a sequential token (e.g., `#1`, `#2`, `#3`) and updates the patient status to **Waiting**.

### Walk-in Patient Registration
1. In the top navigation bar, click **+ Walk-in Patient**.
2. Complete patient demographics:
   - Full Name, Date of Birth, Gender, Blood Group
   - Mobile Number & Email
   - Address, City, Emergency Contact details
   - Known Allergies & Pre-existing Medical Conditions
3. Save: The patient is assigned a permanent Medical Record Number (MRN) (e.g., `PAT-2026-0001`).
4. **Data Distinction**: All newly registered patients in production are tagged with `[PROD]`.

---

## 4. Clinical Hub & Physician Consultation

### Managing the Consultation Queue
1. Log in with doctor credentials or navigate to **Physician Consultation Hub**.
2. The queue displays today's patients categorized by status (**Waiting**, **In Consultation**, **Completed**).
3. Click **Start Consultation** to admit the next patient.

### Recording Clinical Findings & SOAP Notes
- **Vitals Review**: Check triage vitals recorded by nursing staff (BP, Heart Rate, SpO2, Temp).
- **Chief Complaints & Symptoms**: Enter patient complaints and clinical observations.
- **Diagnosis & ICD-10 Coding**: Record primary diagnosis with automatic coding assistance.
- **e-Prescription**:
  - Add medications from the clinic formulary.
  - Specify dosage (e.g., `1 Tablet`), frequency (e.g., `Twice Daily (1-0-1)`), route (`Oral`), timing (`After Food`), and duration (`5 Days`).
- **Investigations**: Order necessary pathology or imaging tests.
- Click **Complete Consultation**: Saves consultation, locks records, and dispatches prescriptions to the pharmacy.

---

## 5. Diagnostic Laboratories & Radiology

1. Navigate to **Clinical & Diagnostics** &rarr; **Pathology & Diagnostic Labs**.
2. Access pending lab orders generated during consultations.
3. Update sample collection status: **Ordered** &rarr; **Sample Collected** &rarr; **Processing** &rarr; **Completed**.
4. Enter test findings against biological reference intervals (flagging abnormal values automatically).
5. Upload or print verified diagnostic reports for patient records.

---

## 6. Pharmacy POS & Formulary Stock Control

1. Navigate to **Clinical & Diagnostics** &rarr; **Pharmacy Formulary & Stock**.
2. **Real-Time Formulary**: Search by medicine trade name, generic composition, or SKU batch number.
3. **Stock Safeguards**: Low stock items (< threshold) and medicines expiring within 90 days are visually flagged with actionable badges.
4. Dispense medications directly against digital prescriptions or counter sales.

---

## 7. Billing, Cashier Desk & Revenue Cycle

1. Navigate to **Front Office Operations** &rarr; **Front Desk Billing & POS**.
2. Generate itemized invoices combining doctor consultation fees, diagnostic procedures, and pharmacy items.
3. Apply configurable clinic taxes (e.g., 5% GST/Sales Tax).
4. Record settlements across multi-tender options: Cash, Credit/Debit Card, UPI / QR, or Insurance TPA.
5. Print official tax invoices and payment receipts with unique barcode/reference tracking.

---

## 8. Growth CRM, Campaigns & Patient Retention

- **Care Follow-ups Hub**: Automated schedule for post-consultation check-in calls, lab result discussions, and medication reviews.
- **Recall & Broadcast Campaigns**: Target specific patient cohorts (e.g., diabetic patients due for HbA1c tests) via WhatsApp, SMS, or Email.
- **Patient Segments**: Dynamically group patients by spend tier (VIP), visit recency, chronic conditions, or age groups.
- **Workflow Automation Engine**: Trigger deterministic notifications on events like `appointment.completed` or `invoice.overdue`.

---

## 9. Super Admin Technical & Demo Data Governance

### Demo Data Control
1. Navigate to **Database & Governance** &rarr; **System Configuration** (`admin-settings`).
2. **Enable / Disable Demo Data**:
   - Toggling **Disable Demo Data** instantly filters out all sample data throughout the entire application.
   - The entire software operates with real production database records.
3. **Safe Demo Data Seeding**:
   - Click **Seed Demo Data Safely**.
   - Enforces **Check and Update, Don't Duplicate** logic.
   - Updates existing sample records without creating duplicates and never overwrites real patient data.
4. **Purge Demo Records Only**:
   - Removes sample data (`isDemo = true`) while preserving 100% of user-created production patients and appointments.
5. **Reset to Empty Production DB**:
   - Sets all business tables to zero (`0`) records for official clinic go-live.
6. **Audit Logs**:
   - Review tamper-evident logs tracking every administrative action, user login, data modification, and timestamp.

---

## 10. CLI Database Management & Migration Commands

### Single Standard Initialization: `npm run db-init`
For system provisioning, new server deployment, or database updates:
```bash
npm run db-init
```
- Connects to the configured PostgreSQL / MySQL database.
- Creates migration tracker (`_schema_migrations`) if not present.
- Executes all pending migrations in sequential order.
- Seeds required system roles (`SUPER_ADMIN`, `ACCOUNTANT`, `DATA_ENTRY`, `DOCTOR`, etc.).
- Seeds Chart of Accounts groups (`Assets`, `Liabilities`, `Equity`, `Income`, `Expenses`) and system account heads.
- Idempotent and safe: runs on empty or existing databases without data duplication.

### Development Cleanup: `npm run clean-table`
For resetting staging or testing environments without touching database schema:
```bash
npm run clean-table -- --confirm
```
- **Development Only**: Blocked automatically if `NODE_ENV=production`.
- Requires explicit confirmation flag (`--confirm`) or interactive prompt.
- Preserves all tables, migrations, system roles, chart of accounts, and the Super Admin account.
- Removes test/dummy business records safely in dependency order.

