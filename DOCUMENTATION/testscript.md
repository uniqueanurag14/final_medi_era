# MediEra Medical CRM & ERP — QA Test Script & Verification Plan

## 1. Test Plan Overview

This test script establishes the formal Quality Assurance (QA) verification protocol for MediEra Medical CRM & ERP. It verifies layout consistency, zero-gap header precision, demo data lifecycle, empty database functionality, duplicate prevention, and core clinical workflows.

| Test Category | Total Cases | Target Pass Rate | Execution Mode |
| :--- | :--- | :--- | :--- |
| **Public UI & Layout Precision** | 2 | 100% | Manual / Responsive Emulation |
| **Demo Data & Empty DB Governance**| 4 | 100% | Interactive Admin Testing |
| **Front Office & Patient Workflows** | 3 | 100% | End-to-End Functional |
| **Clinical Consultation & Pharmacy** | 3 | 100% | Clinical Role Simulation |
| **Security, RBAC & Audit Trails** | 3 | 100% | Role Switching & Tamper Checks |

---

## 2. Test Cases Specification

### TC-001: Public Portal Header Layout & Zero-Gap Verification
- **Objective**: Verify that the public header has zero unexpected margin, padding, blank white bar, or layout shift across all responsive viewports.
- **Preconditions**: Application is running at `http://localhost:3000`.
- **Test Steps**:
  1. Open the application in Desktop resolution (1920x1080 and 1440x900).
  2. Inspect the top edge: Verify the dark emergency top banner sits flush at the very top (`y = 0`) with zero gap or whitespace above it.
  3. Emulate Tablet viewport (768px width) and Mobile viewport (375px / 390px / 414px width).
  4. Navigate across pages: **Home**, **About Us**, **Specialities**, **Services**, **Doctors**, **Health Packages**, **FAQ**, **Contact Us**.
- **Expected Result**: Header aligns cleanly at viewport top across all screen sizes and pages with no blank bars or shifts.
- **Status**: [ PASS ]

---

### TC-002: Demo Data Disabling & Empty Database Operational Verification
- **Objective**: Verify that Super Admin can disable demo data and that the application functions correctly with zero demo records.
- **Preconditions**: Logged in as Super Admin (`admin-settings`).
- **Test Steps**:
  1. Navigate to **Administration & Technical Configuration** &rarr; **Demo Data Management**.
  2. Click **Disable Demo Data**.
  3. Verify the status banner updates to **Pure Production (Demo Disabled)**.
  4. Navigate to **Walk-ins & Patient Directory** (`admin-patients`).
  5. Check patient list: All sample demo records are filtered out.
  6. Navigate to **Appointments & Scheduling** (`admin-appointments`): No demo appointments appear.
- **Expected Result**: Application functions without throwing errors or exceptions when operating with zero demo data.
- **Status**: [ PASS ]

---

### TC-003: Safe Demo Data Seeding ("Check and Update, Don't Duplicate")
- **Objective**: Verify that seeding demo data checks for existing records and updates in place without duplicating records.
- **Preconditions**: Super Admin access.
- **Test Steps**:
  1. Under **Demo Data Management**, note current patient count (e.g., 20 patients).
  2. Click **Seed Demo Data Safely**.
  3. Observe confirmation toast message: Shows added and updated counts.
  4. Click **Seed Demo Data Safely** a second time.
- **Expected Result**: No duplicate records are created. Total record count remains identical (`added: 0`, matching records verified and updated).
- **Status**: [ PASS ]

---

### TC-004: Purge Demo Data Preserving Production Data
- **Objective**: Verify that purging demo data removes only records with `isDemo = true` while preserving 100% of user-created production records.
- **Preconditions**: At least one live patient has been created via **+ Walk-in Patient** (tagged `[PROD]`).
- **Test Steps**:
  1. Register a test production patient: `John Real Doe`, phone `555-0199`.
  2. Navigate to **Admin Settings** &rarr; **Demo Data Management**.
  3. Click **Purge Demo Records Only** and confirm dialog.
  4. Return to **Patient Directory** (`admin-patients`).
- **Expected Result**: All demo sample records are removed. `John Real Doe` remains present, marked with the green `[PROD]` badge.
- **Status**: [ PASS ]

---

### TC-005: New Patient Registration (Walk-in Flow)
- **Objective**: Verify that walk-in registration assigns an MRN, sets `isDemo: false`, and persists to database storage.
- **Preconditions**: Receptionist or Admin logged in.
- **Test Steps**:
  1. Click **+ Walk-in Patient** in the top bar.
  2. Enter First Name: `Sarah`, Last Name: `Connor`, Phone: `9876543210`, DOB: `1985-05-12`, Blood Group: `O+`.
  3. Select Branch: `Apex Health Central Campus`.
  4. Submit form.
- **Expected Result**: Patient record appears in the directory with badge `[PROD]`, auto-generated MRN `PAT-2026-XXXX`, and is immediately selectable for appointment scheduling.
- **Status**: [ PASS ]

---

### TC-006: Appointment Booking & Live Token Generation
- **Objective**: Verify appointment creation generates sequential daily queue token numbers.
- **Preconditions**: Active clinic schedule and doctors configured.
- **Test Steps**:
  1. Click **Book Appointment** modal.
  2. Select patient `Sarah Connor`, Doctor `Dr. Marcus Vance`, and today's date.
  3. Submit booking.
  4. Navigate to **Live Queue & Token Dispenser** (`reception-queue`).
- **Expected Result**: Appointment appears in queue with an incremental Token # (e.g., `#1`), appointment number `APT-2026-XXX`, and status `Waiting`.
- **Status**: [ PASS ]

---

### TC-007: Clinical Consultation & e-Prescription Generation
- **Objective**: Verify physician consultation workflow from queue admission to prescription completion.
- **Preconditions**: An appointment in `Waiting` status.
- **Test Steps**:
  1. In **Physician Consultation Hub** (`doctor-queue`), click **Start Consultation**.
  2. Enter Chief Complaint: `Persistent dry cough and mild fever`.
  3. Enter Diagnosis: `Acute Bronchitis (ICD-10: J20.9)`.
  4. Add e-Prescription medication: `Amoxicillin 500mg`, `1 Tablet`, `Thrice Daily`, `5 Days`.
  5. Click **Complete Consultation**.
- **Expected Result**: Consultation record is saved, appointment status updates to `Completed`, and prescription is dispatched to pharmacy formulary.
- **Status**: [ PASS ]

---

### TC-008: Itemized Billing POS & Payment Collection
- **Objective**: Verify generation of itemized invoice with taxes and multi-tender settlement.
- **Preconditions**: Completed consultation.
- **Test Steps**:
  1. Navigate to **Front Desk Billing & POS** (`admin-billing`).
  2. Open invoice for consultation.
  3. Verify itemized charges: Consultation fee + Medication.
  4. Confirm tax calculation (e.g., 5% GST/Sales Tax).
  5. Select payment method `UPI / QR` or `Credit Card` and enter transaction reference.
  6. Click **Record Payment**.
- **Expected Result**: Invoice status transitions to `Paid`, balance displays `$0.00`, and printable official receipt is generated.
- **Status**: [ PASS ]

---

### TC-009: Pharmacy Inventory Stock & Expiry Tracking
- **Objective**: Verify stock thresholds and expiry warning indicators.
- **Preconditions**: Formulary items in stock.
- **Test Steps**:
  1. Navigate to **Pharmacy Formulary & Stock** (`admin-inventory`).
  2. Filter by status: `Low Stock` and `Expiring Soon`.
  3. Verify items with stock below reorder level display warning alerts.
- **Expected Result**: Inventory items accurately display current quantity, re-order status, and batch expiry dates.
- **Status**: [ PASS ]

---

### TC-010: Lead Management & CRM Stage Progression
- **Objective**: Verify prospective patient leads can be added, qualified, and converted.
- **Preconditions**: Admin or Front-Desk access.
- **Test Steps**:
  1. Navigate to **Inquiries & Patient Leads** (`admin-leads`).
  2. Click **Add Lead**: Name: `Robert Paulson`, Phone: `555-0123`, Service: `Dental Implant`.
  3. Progress stage from `New` &rarr; `Contacted` &rarr; `Interested`.
  4. Convert lead to registered patient.
- **Expected Result**: Lead stage history logs every transition, and conversion creates a valid patient profile.
- **Status**: [ PASS ]

---

### TC-011: Telemedicine Virtual Call Room Initialization
- **Objective**: Verify telemedicine room token generation and status progression.
- **Preconditions**: Appointment scheduled with Visit Type `Video Consultation`.
- **Test Steps**:
  1. Locate telemedicine appointment.
  2. Click **Join Telemedicine Room**.
  3. Verify room state progresses: `Scheduled` &rarr; `Doctor Joined` &rarr; `In Progress`.
- **Expected Result**: Interactive virtual consultation room initializes with video/audio controls and in-call chat.
- **Status**: [ PASS ]

---

### TC-012: Patient Portal Self-Service
- **Objective**: Verify patient self-service dashboard displays past visits and prescriptions.
- **Preconditions**: Switch role to `PATIENT`.
- **Test Steps**:
  1. Click role switcher &rarr; select **PATIENT**.
  2. Review patient dashboard: Upcoming appointments, past medical records, downloadable prescriptions.
- **Expected Result**: Patient view loads securely with appropriate data scope restricted to patient records.
- **Status**: [ PASS ]

---

### TC-013: Role-Based Access Control (RBAC) Enforcement
- **Objective**: Verify permission boundaries across different roles.
- **Preconditions**: Test accounts for Doctor, Nurse, Receptionist, Accountant.
- **Test Steps**:
  1. Switch to `RECEPTIONIST`: Verify clinical diagnosis and doctor confidential notes are hidden.
  2. Switch to `NURSE`: Verify vitals recording is enabled, but billing adjustments are restricted.
  3. Switch to `ACCOUNTANT`: Verify billing and invoices are accessible, but clinical e-Rx generation is restricted.
- **Expected Result**: Navigation sidebar and operational actions strictly reflect current user role permissions.
- **Status**: [ PASS ]

---

### TC-014: Administrative Tamper-Evident Audit Logging
- **Objective**: Verify that critical admin mutations are logged with timestamps and user identifiers.
- **Preconditions**: Super Admin access.
- **Test Steps**:
  1. Execute a setting change in **Admin Settings**.
  2. Navigate to **Audit & Governance Logs** tab.
  3. Inspect top entry.
- **Expected Result**: Log displays timestamp, user role, action, affected module, and specific mutation details.
- **Status**: [ PASS ]

---

### TC-015: End-to-End Empty Database Lifecycle Verification
- **Objective**: Verify complete system workflow starting from a completely empty production database.
- **Preconditions**: Super Admin access.
- **Test Steps**:
  1. Go to **Admin Settings** &rarr; **Demo Data Management**.
  2. Click **Reset to Empty Production DB** (all business records reset to 0).
  3. Navigate through Patients, Appointments, Invoices, Leads: Verify graceful empty states with prompt buttons (e.g. "+ Add Patient", "No appointments scheduled").
  4. Register Patient 1 &rarr; Book Appointment 1 &rarr; Triage &rarr; Consult &rarr; Bill & Pay.
- **Expected Result**: All modules handle 0 records gracefully and complete the lifecycle without any software errors.
- **Status**: [ PASS ]

---

## 3. QA Sign-Off Checklist
- [x] All 15 Test Cases executed and passing.
- [x] Header top spacing verified with zero margin/gap across Desktop, Tablet, and Mobile viewports.
- [x] Demo data toggle tested and verified.
- [x] "Check and Update, Don't Duplicate" safe seeding verified.
- [x] Production records distinctly badged `[PROD]` vs `[DEMO]`.
- [x] Zero TypeScript compilation or linter errors.
