# MediEra Healthcare Management System — Comprehensive Operations & User Manual

Welcome to the **MediEra Healthcare Management Platform**. MediEra is an enterprise-grade multi-branch clinic and health systems governance solution engineered for medical practices, healthcare networks, outpatient centers, and specialist clinics.

This document serves as the operational manual for System Administrators, Medical Directors, Clinic Managers, Practice Receptionists, and IT Governance Teams.

---

## 1. System Architecture & Core Philosophy

### Database as the Single Source of Truth
MediEra enforces a strict **Single Source of Truth** architectural standard. Every business entity—organizations, clinic branches, doctors, user accounts, roles, permissions, operating hours, branch assignments, and weekly duty schedules—resides directly within the main transactional relational database (PostgreSQL / PGlite via Drizzle ORM).

- **Zero Mock Data in Production**: No mock stores, static fallbacks, or in-memory arrays supply application data.
- **Automatic Schema Synchronization**: On application launch, `ensureDatabaseReady()` initializes missing relational tables and provisions baseline seeds.
- **Fail-Closed Security**: Operations either succeed against verified relational records or produce clear, audited error responses.

---

## 2. Authentication & Getting Started

### Accessing the Portal
1. Open the application portal (e.g. `http://localhost:3000`).
2. Log in using your assigned credentials:
   - **Default Super Admin**: `admin@example.com` / `AdminSecurePassword123!` (or the configured `SUPER_ADMIN_PASSWORD`).
3. Click **Sign In**.

### First-Time Password Change
- Accounts marked with `mustChangePassword: true` are prompted immediately with a secure password update modal before accessing clinical or administrative tools.
- Passwords must be at least 8 characters long and follow enterprise security policies.

### Session Governance & Token Storage
- MediEra utilizes stateless access tokens alongside managed refresh token sessions stored in the relational database (`user_sessions`).
- Authorized users can inspect active sessions, browser agents, and IP addresses, with the ability to terminate individual or all other active sessions at any time.

---

## 3. Organization & Clinic Governance

Navigate to **Clinic Management** → **Organizations** (`/admin/clinic/organizations`).

### Central Organization Profile
The top-level organization record represents the healthcare entity, medical network, or parent clinic group:
- **Organization Name**: The operational brand (e.g., *MediEra Healthcare Group*).
- **Legal Entity Name**: Registered corporate or legal title (e.g., *MediEra Integrated Health Systems Ltd.*).
- **Registration & Tax Numbers**: State/national medical board registration number and federal tax identification.
- **Localization Standards**:
  - **Base Currency**: Operational currency (e.g., `USD`, `EUR`, `GBP`).
  - **Timezone**: Canonical IANA timezone (e.g., `America/New_York`, `Europe/London`).
  - **Date & Time Formats**: Presentation formats (e.g., `YYYY-MM-DD`, `12h` or `24h`).
- **Headquarters Address & Central Contact**: Physical street address, city, state, postal code, corporate email, phone, and official website.

All branch operations and financial rollups tie back to this organization record in the database.

---

## 4. Clinic Branch Operations

Navigate to **Clinic Management** → **Branches** (`/admin/clinic/branches`).

### Multi-Branch Hierarchy
MediEra supports single clinics or distributed multi-site healthcare practices:
- **Branch Name & Unique Code**: Identifier for clinical dispatch and billing (e.g., *Downtown Central Clinic* [`BR-CENTRAL`], *Metropolitan Health Hub* [`BR-METRO`]).
- **Headquarters Flag**: Identifies the primary administrative facility.
- **Contact & Location Details**: Physical location, dedicated clinic telephone, and branch email.
- **Operational Status**: Toggle branches between `ACTIVE` and `INACTIVE` for temporary closures or seasonal operations.

### Operating Hours Configuration
Each branch maintains its own distinct weekly operating hours, stored as structured configuration in the database:
- Configurable per day of the week (Monday through Sunday).
- Explicit `open` time (e.g., `08:00`) and `close` time (e.g., `18:00`).
- Day-level active toggle (`isOpen: true/false`) to handle weekend closures or special operating schedules.

---

## 5. Doctor & Practitioner Management

Navigate to **Clinic Management** → **Doctors** (`/admin/clinic/doctors`).

### Doctor Profile Records
Doctors represent licensed medical practitioners delivering clinical services:
- **Full Name & Suffix**: Official practitioner name (e.g., *Dr. Sarah Jenkins, MD*).
- **Medical Specialization**: Primary field of practice (e.g., *Cardiology*, *Pediatrics*, *Internal Medicine*, *Dermatology*, *Orthopedics*).
- **Medical License Number**: State or national licensing board credential (e.g., *MD-NY-882194*).
- **Qualifications**: Medical degrees, fellowships, and board certifications.
- **Experience (Years)**: Clinical years in active practice.
- **Professional Biography**: Public-facing or clinical summary of practice interests and achievements.
- **Base Consultation Fee**: Standard consultation charge for primary office visits.
- **Status**: `ACTIVE` or `INACTIVE` practitioner status.

### Linking Doctors to System Users
- Doctor profiles can be linked to a specific user account (`user_id`).
- This connection bridges clinical identity with authentication, granting doctors role-appropriate clinical access (viewing assigned branch patients and updating consultation notes) based on their RBAC credentials.

---

## 6. Doctor Branch Assignments & Duty Schedules

Navigate to **Clinic Management** → **Schedules** (`/admin/clinic/schedules`).

### Multi-Branch Doctor Assignments
Practitioners frequently rotate across multiple clinic branches:
- **Branch Association**: Links a doctor to a designated clinic facility.
- **Facility-Specific Fee**: Override base consultation fees for specific facilities or premium locations.
- **Room / Suite Number**: Consultation room or examination suite (e.g., *Room 302*, *Suite B-12*).
- **Effective Dates**: Optional validity date windows for visiting specialists or locum tenens practitioners.

### Weekly Duty Schedules & Session Slots
Within each branch assignment, recurring weekly shifts and session blocks are established:
- **Day of Week**: Monday through Sunday.
- **Session Name**: Functional description (e.g., *Morning Cardiology Clinic*, *Afternoon Interventional Consults*, *Walk-In Primary Care*).
- **Shift Window**: Exact `start_time` and `end_time` (e.g., `09:00` to `13:00`).
- **Slot Duration (Minutes)**: Standard appointment interval (e.g., 15, 20, 30, or 45 minutes).
- **Maximum Patient Capacity**: Appointment ceiling per session block (e.g., 12 patients).
- **Active State**: Toggle individual session schedules without deleting historical configurations.

---

## 7. User, Role & Access Control (RBAC)

Navigate to **Users** (`/admin/users`) and **Roles & Permissions** (`/admin/roles`, `/admin/permissions`).

### Standard Healthcare Roles
MediEra provides pre-configured, domain-specific healthcare roles out of the box:

| Role Name | Key Functional Scope | Typical Assignees |
|---|---|---|
| **superadmin** | System-wide root administration, database configuration, security policies, and user management. Protected against accidental deletion or demotion. | IT Directors, Lead System Administrators |
| **admin** | Operational administration, user account management, branch configuration, and security audit log inspection. | Practice Administrators, Clinic Operations Directors |
| **doctor** | Clinical consultation, schedule viewing, and clinical record access. | Attending Physicians, Specialists, Medical Officers |
| **receptionist** | Patient registration, front-desk intake, appointment scheduling, and directory lookup. | Front Desk Staff, Patient Coordinators |
| **nurse** | Clinical intake, vitals recording, doctor consultation assistance, and schedule access. | Registered Nurses, Nurse Practitioners, Clinical Assistants |
| **accountant** | Financial oversight, billing, consultation fee verification, and invoicing. | Billing Specialists, Clinic Accountants |
| **manager** | Facility management, branch operations, shift schedules, and branch staff oversight. | Clinic Branch Managers, Facility Supervisors |
| **staff** | General operational support, facility maintenance, and administrative assistance. | Support Staff, Office Clerks |
| **patient** | Patient self-service portal access (appointments, medical summaries). | Registered Patients |
| **user** | Standard base user with profile and session management capabilities. | General portal users |

### Custom Roles
Administrators can create unlimited custom roles (e.g., *Triage Coordinator*, *Quality Assurance Auditor*) by selecting bespoke permission bundles from the granular permission matrix.

### Healthcare System Permissions Matrix
Granular permissions control exact module accessibility:
- **Organizations**: `organizations:read`, `organizations:manage`
- **Branches**: `branches:read`, `branches:manage`
- **Doctors**: `doctors:read`, `doctors:manage`
- **Schedules**: `schedules:read`, `schedules:manage`
- **Users**: `users:read`, `users:create`, `users:update`, `users:delete`, `users:activate`, `users:deactivate`
- **Roles**: `roles:read`, `roles:create`, `roles:update`, `roles:delete`
- **Permissions**: `permissions:read`
- **Audit Logs**: `audit:read`
- **Sessions**: `sessions:read`, `sessions:revoke`
- **System Settings**: `settings:read`, `settings:update`

---

## 8. Security Auditing & Governance Safeguards

### Immutable Audit Logs (`/admin/audit-logs`)
Every administrative and security-relevant action automatically produces an immutable audit record in the `audit_logs` table:
- **Timestamp**: Precise UTC timestamp.
- **Actor**: User ID and Email who performed the action.
- **Action Code**: Standardized event code (e.g., `BRANCH_CREATED`, `DOCTOR_ASSIGNED`, `SCHEDULE_CREATED`, `USER_STATUS_UPDATED`, `FAILED_LOGIN`).
- **Resource & Resource ID**: Entity affected and target ID.
- **Metadata**: JSON payload detailing modified attributes.
- **Client IP & User Agent**: Originating network address and browser fingerprint.

### Last Super Admin Protection
The system enforces hardcoded safeguards preventing the demotion, deactivation, or deletion of the last remaining active Super Admin account. Even administrators cannot accidentally lock themselves out of the system.

---

## 9. System Administration & Database Maintenance

### Database Connectivity
- MediEra operates with high resilience across PostgreSQL container environments and local PGlite instances.
- Schema definitions and initial baseline seeds are maintained centrally in `src/database/schema-definitions.ts`.
- All database interactions use typed Drizzle ORM queries ensuring SQL injection protection and strict type safety.

### Summary Checklist for System Go-Live
1. Verify Super Admin credentials and set a secure administrative password.
2. Review Organization Details under Clinic Management → Organizations.
3. Configure physical branches and operating hours under Clinic Management → Branches.
4. Add licensed medical practitioners under Clinic Management → Doctors.
5. Create branch assignments and schedule recurring weekly clinic sessions.
6. Invite clinical staff (Doctors, Receptionists, Nurses) and assign their corresponding healthcare roles.
