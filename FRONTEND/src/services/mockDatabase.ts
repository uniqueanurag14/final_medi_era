import {
  Organization,
  Branch,
  User,
  Doctor,
  DoctorSchedule,
  Specialty,
  Patient,
  Appointment,
  Consultation,
  Prescription,
  LabTest,
  LabOrder,
  Invoice,
  PaymentRecord,
  InventoryItem,
  Lead,
  FollowUp,
  Staff,
  AuditLog,
  SystemNotification,
  CommunicationLog,
  PatientDocument,
  ServiceItem,
  HealthPackage,
  UserRole,
  VisitType,
  AppointmentStatus,
  PaymentMethod,
  DoctorLeave,
  BlockedSlot,
  PrescriptionTemplate,
  MedicalCertificate,
  PatientTag,
  PatientSegment,
  CrmActivity,
  CrmTask,
  CommunicationTemplate,
  Campaign,
  PatientFeedback,
  ServiceRecoveryTask,
  PatientReferral,
  PatientCommunicationPreferences,
  AutomationRule,
  AutomationExecution,
  LeadStage,
  LeadPriority,
  Department,
  EmployeeProfile,
  EmployeeDocument,
  EmployeeShift,
  AttendanceRecord,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  EmployeeCompensation,
  RoleDefinition,
  UserSession,
  LoginHistoryRecord,
  SecurityEvent,
  BackupJob,
  ExportJob,
  IntegrationConfig,
  ApiKeyRecord,
  WebhookRecord,
  FeatureFlag,
  SaaSPlan,
  OrganizationSubscription,
  UsageMetricRecord,
  SystemAnnouncement,
  TelemedicineRoom,
  TelemedicineMessage,
  TelemedicineEvent,
  InsuranceProvider,
  InsurancePolicy,
  PreAuthorization,
  InsuranceClaim,
  ClaimSettlement,
  DoctorShift,
  OnCallRoster,
  DrugSafetyWarning,
  DrugSafetyEvent,
  BackgroundJobRecord,
  SystemHealthCheck,
  SystemTechnicalSettings,
  DemoDataStats
} from '../types';

import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_EMPLOYEE_DOCUMENTS,
  INITIAL_EMPLOYEE_SHIFTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_TYPES,
  INITIAL_LEAVE_BALANCES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_COMPENSATIONS,
  INITIAL_ROLES,
  INITIAL_USER_SESSIONS,
  INITIAL_LOGIN_HISTORY,
  INITIAL_SECURITY_EVENTS,
  INITIAL_BACKUP_JOBS,
  INITIAL_EXPORT_JOBS,
  INITIAL_INTEGRATIONS,
  INITIAL_API_KEYS,
  INITIAL_WEBHOOKS,
  INITIAL_FEATURE_FLAGS,
  INITIAL_SAAS_PLANS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_USAGE_METRICS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TELEMEDICINE_ROOMS,
  INITIAL_TELEMEDICINE_MESSAGES,
  INITIAL_INSURANCE_PROVIDERS,
  INITIAL_INSURANCE_POLICIES,
  INITIAL_PRE_AUTHORIZATIONS,
  INITIAL_INSURANCE_CLAIMS,
  INITIAL_CLAIM_SETTLEMENTS,
  INITIAL_DOCTOR_SHIFTS,
  INITIAL_ON_CALL_ROSTERS,
  INITIAL_DRUG_SAFETY_WARNINGS,
  INITIAL_DRUG_SAFETY_EVENTS,
  INITIAL_BACKGROUND_JOBS,
  INITIAL_HEALTH_CHECKS,
} from './advancedSeeds';

const STORAGE_KEY = 'clinic_crm_master_db_v1';

export const INITIAL_TECHNICAL_SETTINGS: SystemTechnicalSettings = {
  demoDataEnabled: false,
  databaseConfig: {
    driver: 'PostgreSQL',
    host: 'localhost',
    port: 5432,
    database: 'mediera_clinic_db',
    user: 'postgres',
    ssl: false,
    poolMax: 10,
    connectionTimeoutMillis: 15000,
  },
  emailConfig: {
    enabled: true,
    provider: 'smtp-nodemailer-ses',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpSecure: true,
    smtpUser: 'apikey',
    senderName: 'MediEra Healthcare & Clinics',
    senderEmail: 'notifications@mediera.com',
    replyToEmail: 'support@mediera.com',
  },
  smsConfig: {
    enabled: false,
    provider: 'twilio-sms',
    accountSid: 'AC_MEDIERA_PROD_SID_7719',
    fromNumber: '+1 (800) 555-0199',
  },
  whatsAppConfig: {
    enabled: true,
    provider: 'meta-whatsapp-business-api',
    phoneNumberId: 'phone_num_id_99281',
    businessAccountId: 'waba_acc_id_3381',
  },
  securityConfig: {
    sessionTimeoutMinutes: 60,
    enforceMfa: false,
    passwordMinLength: 8,
    maxLoginAttempts: 5,
    ipAllowlist: ['127.0.0.1', '10.0.0.0/8', '192.168.1.0/24'],
    enableRateLimiting: true,
  },
  integrationsConfig: {
    posEnabled: true,
    posTerminalId: 'POS-TERM-NY-01',
    posMerchantId: 'MERCH-MED-8831',
    upiEnabled: true,
    upiMerchantVpa: 'mediera@icici',
    gatewayEnabled: false,
    gatewayProvider: 'Stripe / Razorpay',
    storageProvider: 'AWS S3 (Encrypted AES-256)',
  },
  updatedAt: '2026-09-06T12:00:00Z',
  updatedBy: 'Super Admin (System)',
};

export const INITIAL_ORGANIZATION: Organization = {
  id: 'org-01',
  name: 'MediEra Healthcare & Multi-Specialty Clinics',
  code: 'MEDIERA',
  tagline: 'Medical CRM & ERP Platform powered by YantraEra',
  logo: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=200',
  taxNumber: 'TAX-994827104',
  phone: '+1 (800) 555-MEDIERA',
  email: 'contact@yantraera.com',
  address: '450 Healthcare Boulevard, Suite 800',
  website: 'https://yantraera.com/',
};

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: "branch-01",
    organizationId: "org-01",
    name: "Main Healthcare Center",
    code: "BR-MAIN",
    phone: "+1 (800) 555-0100",
    email: "info@mediera.health",
    address: "100 Medical Center Plaza",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    isMainBranch: true,
    active: true,
  },
];

export const INITIAL_SPECIALTIES: Specialty[] = [];
export const INITIAL_DOCTORS: Doctor[] = [];
export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-01',
    organizationId: 'org-01',
    name: 'General Physician Consultation',
    code: 'GP-CONS',
    type: 'Consultation',
    description: 'Comprehensive evaluation of general medical symptoms and chronic disease management.',
    category: 'Consultation',
    price: 50,
    durationMinutes: 20,
    taxRate: 5,
    active: true,
    supportsHomeVisit: false,
    isDemo: false,
  },
  {
    id: 'srv-02',
    organizationId: 'org-01',
    name: 'Doctor Home Visit (General Practitioner)',
    code: 'GP-HOME',
    type: 'Consultation',
    description: 'A licensed medical doctor visits the patient at home for examination, vitals, and prescription.',
    category: 'Consultation',
    price: 90,
    durationMinutes: 45,
    taxRate: 5,
    active: true,
    supportsHomeVisit: true,
    isDemo: false,
  },
  {
    id: 'srv-03',
    organizationId: 'org-01',
    name: 'Nurse Home Visit & Vital Checkup',
    code: 'NURSE-HOME',
    type: 'Procedures',
    description: 'Professional nursing care at home: BP, blood glucose monitoring, injections, and vitals assessment.',
    category: 'Procedures',
    price: 45,
    durationMinutes: 30,
    taxRate: 5,
    active: true,
    supportsHomeVisit: true,
    isDemo: false,
  },
  {
    id: 'srv-04',
    organizationId: 'org-01',
    name: 'Diagnostic Blood Sample Collection at Home',
    code: 'LAB-HOME',
    type: 'Diagnostics',
    description: 'Certified phlebotomist visits home for sterile blood, urine, or swab sample collection.',
    category: 'Lab',
    price: 25,
    durationMinutes: 20,
    taxRate: 5,
    active: true,
    supportsHomeVisit: true,
    isDemo: false,
  },
  {
    id: 'srv-05',
    organizationId: 'org-01',
    name: 'Elderly Geriatric Care & Home Assessment',
    code: 'GERIATRIC-HOME',
    type: 'Consultation',
    description: 'Specialized at-home physical, cognitive, and medication safety review for senior patients.',
    category: 'Consultation',
    price: 85,
    durationMinutes: 60,
    taxRate: 5,
    active: true,
    supportsHomeVisit: true,
    isDemo: false,
  },
  {
    id: 'srv-06',
    organizationId: 'org-01',
    name: 'Cardiology Specialist Consultation',
    code: 'CARDIO-CONS',
    type: 'Consultation',
    description: 'In-clinic specialist consultation with Senior Consultant Cardiologist including ECG review.',
    category: 'Consultation',
    price: 80,
    durationMinutes: 30,
    taxRate: 5,
    active: true,
    supportsHomeVisit: false,
    isDemo: false,
  },
  {
    id: 'srv-07',
    organizationId: 'org-01',
    name: 'Physiotherapy & Rehabilitation Home Session',
    code: 'PHYSIO-HOME',
    type: 'Therapy',
    description: 'Licensed physical therapist home session for mobility restoration, post-stroke, or orthopedic rehab.',
    category: 'Therapy',
    price: 65,
    durationMinutes: 45,
    taxRate: 5,
    active: true,
    supportsHomeVisit: true,
    isDemo: false,
  },
];
export const INITIAL_PACKAGES: HealthPackage[] = [];
export const INITIAL_LAB_TESTS: LabTest[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [];
export const INITIAL_STAFF: Staff[] = [];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_FOLLOWUPS: FollowUp[] = [];
export const INITIAL_PATIENT_TAGS: PatientTag[] = [];
export const INITIAL_PATIENT_SEGMENTS: PatientSegment[] = [];
export const INITIAL_CRM_ACTIVITIES: CrmActivity[] = [];
export const INITIAL_CRM_TASKS: CrmTask[] = [];

export const INITIAL_COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: "tmpl-com-01",
    name: "Appointment Confirmation & Token Info",
    channel: "WhatsApp",
    eventTrigger: "appointment.booked",
    subject: "Appointment Confirmed at Main Healthcare Center",
    body: "Hello {{patient_name}}, your appointment with {{doctor_name}} is confirmed for {{appointment_date}} at {{appointment_time}}. Your token number is #{{token_number}}. Address: {{clinic_name}}. Need to reschedule? Reply to this message.",
    variables: ["patient_name", "doctor_name", "appointment_date", "appointment_time", "token_number", "clinic_name"],
    status: "Active",
    category: "Transactional",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tmpl-com-02",
    name: "24-Hour Appointment Reminder",
    channel: "SMS",
    eventTrigger: "appointment.reminder_24h",
    subject: "Reminder: Tomorrow Consultation",
    body: "MediEra Health: Reminder for {{patient_name}} - consultation with {{doctor_name}} tomorrow at {{appointment_time}}. Please arrive 10 mins prior.",
    variables: ["patient_name", "doctor_name", "appointment_time"],
    status: "Active",
    category: "Reminders",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tmpl-com-03",
    name: "Prescription Ready Notification",
    channel: "WhatsApp",
    eventTrigger: "prescription.issued",
    subject: "Your Prescription (Rx) is Ready",
    body: "Dear {{patient_name}}, {{doctor_name}} has issued your digital prescription. You can view medicines, instructions, and download the verified PDF in your Patient Portal: {{portal_url}}",
    variables: ["patient_name", "doctor_name", "portal_url"],
    status: "Active",
    category: "Clinical",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

export const INITIAL_COMMUNICATION_LOGS: CommunicationLog[] = [];
export const INITIAL_CAMPAIGNS: Campaign[] = [];
export const INITIAL_PATIENT_FEEDBACK: PatientFeedback[] = [];
export const INITIAL_SERVICE_RECOVERY_TASKS: ServiceRecoveryTask[] = [];
export const INITIAL_REFERRALS: PatientReferral[] = [];
export const INITIAL_AUTOMATION_RULES: AutomationRule[] = [];
export const INITIAL_AUTOMATION_EXECUTIONS: AutomationExecution[] = [];
export const INITIAL_PATIENT_PREFERENCES: Record<string, PatientCommunicationPreferences> = {};
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];
export const INITIAL_DOCTOR_LEAVES: DoctorLeave[] = [];
export const INITIAL_BLOCKED_SLOTS: BlockedSlot[] = [];
export const INITIAL_PRESCRIPTION_TEMPLATES: PrescriptionTemplate[] = [];
export const INITIAL_CERTIFICATES: MedicalCertificate[] = [];

export function generateSeedPatients(): Patient[] {
  return [];
}

export function generateSeedAppointments(
  patients: Patient[],
  doctors: Doctor[]
): {
  appointments: Appointment[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  documents: PatientDocument[];
} {
  return {
    appointments: [],
    consultations: [],
    prescriptions: [],
    labOrders: [],
    invoices: [],
    payments: [],
    documents: [],
  };
}

export class ClinicDatabaseService {
  private static instance: ClinicDatabaseService;

  public organization: Organization = INITIAL_ORGANIZATION;
  public organizations: Organization[] = [INITIAL_ORGANIZATION];
  public branches: Branch[] = INITIAL_BRANCHES;
  public specialties: Specialty[] = INITIAL_SPECIALTIES;
  public doctors: Doctor[] = INITIAL_DOCTORS;
  public services: ServiceItem[] = INITIAL_SERVICES;
  public packages: HealthPackage[] = INITIAL_PACKAGES;
  public labTests: LabTest[] = INITIAL_LAB_TESTS;
  public inventory: InventoryItem[] = INITIAL_INVENTORY;
  public staff: Staff[] = INITIAL_STAFF;
  public leads: Lead[] = INITIAL_LEADS;
  public followups: FollowUp[] = INITIAL_FOLLOWUPS;
  public patientTags: PatientTag[] = INITIAL_PATIENT_TAGS;
  public patientSegments: PatientSegment[] = INITIAL_PATIENT_SEGMENTS;
  public crmActivities: CrmActivity[] = INITIAL_CRM_ACTIVITIES;
  public crmTasks: CrmTask[] = INITIAL_CRM_TASKS;
  public communicationTemplates: CommunicationTemplate[] = INITIAL_COMMUNICATION_TEMPLATES;
  public communicationLogs: CommunicationLog[] = INITIAL_COMMUNICATION_LOGS;
  public campaigns: Campaign[] = INITIAL_CAMPAIGNS;
  public patientFeedback: PatientFeedback[] = INITIAL_PATIENT_FEEDBACK;
  public serviceRecoveryTasks: ServiceRecoveryTask[] = INITIAL_SERVICE_RECOVERY_TASKS;
  public patientReferrals: PatientReferral[] = INITIAL_REFERRALS;
  public automationRules: AutomationRule[] = INITIAL_AUTOMATION_RULES;
  public automationExecutions: AutomationExecution[] = INITIAL_AUTOMATION_EXECUTIONS;
  public patientPreferences: Record<string, PatientCommunicationPreferences> = INITIAL_PATIENT_PREFERENCES;
  public auditLogs: AuditLog[] = INITIAL_AUDIT_LOGS;
  public notifications: SystemNotification[] = INITIAL_NOTIFICATIONS;

  public patients: Patient[] = [];
  public appointments: Appointment[] = [];
  public consultations: Consultation[] = [];
  public prescriptions: Prescription[] = [];
  public labOrders: LabOrder[] = [];
  public invoices: Invoice[] = [];
  public payments: PaymentRecord[] = [];
  public documents: PatientDocument[] = [];
  public doctorLeaves: DoctorLeave[] = INITIAL_DOCTOR_LEAVES;
  public blockedSlots: BlockedSlot[] = INITIAL_BLOCKED_SLOTS;
  public prescriptionTemplates: PrescriptionTemplate[] = INITIAL_PRESCRIPTION_TEMPLATES;
  public medicalCertificates: MedicalCertificate[] = INITIAL_CERTIFICATES;

  // Phase 7 & 8 Collections
  public departments: Department[] = INITIAL_DEPARTMENTS;
  public employees: EmployeeProfile[] = INITIAL_EMPLOYEES;
  public employeeDocuments: EmployeeDocument[] = INITIAL_EMPLOYEE_DOCUMENTS;
  public employeeShifts: EmployeeShift[] = INITIAL_EMPLOYEE_SHIFTS;
  public attendanceRecords: AttendanceRecord[] = INITIAL_ATTENDANCE;
  public leaveTypes: LeaveType[] = INITIAL_LEAVE_TYPES;
  public leaveBalances: LeaveBalance[] = INITIAL_LEAVE_BALANCES;
  public leaveRequests: LeaveRequest[] = INITIAL_LEAVE_REQUESTS;
  public employeeCompensations: EmployeeCompensation[] = INITIAL_COMPENSATIONS;
  public roles: RoleDefinition[] = INITIAL_ROLES;
  public userSessions: UserSession[] = INITIAL_USER_SESSIONS;
  public loginHistory: LoginHistoryRecord[] = INITIAL_LOGIN_HISTORY;
  public securityEvents: SecurityEvent[] = INITIAL_SECURITY_EVENTS;
  public backupJobs: BackupJob[] = INITIAL_BACKUP_JOBS;
  public exportJobs: ExportJob[] = INITIAL_EXPORT_JOBS;
  public integrations: IntegrationConfig[] = INITIAL_INTEGRATIONS;
  public apiKeys: ApiKeyRecord[] = INITIAL_API_KEYS;
  public webhooks: WebhookRecord[] = INITIAL_WEBHOOKS;
  public featureFlags: FeatureFlag[] = INITIAL_FEATURE_FLAGS;
  public saasPlans: SaaSPlan[] = INITIAL_SAAS_PLANS;
  public organizationSubscriptions: OrganizationSubscription[] = INITIAL_SUBSCRIPTIONS;
  public usageMetrics: UsageMetricRecord[] = INITIAL_USAGE_METRICS;
  public announcements: SystemAnnouncement[] = INITIAL_ANNOUNCEMENTS;
  public telemedicineRooms: TelemedicineRoom[] = INITIAL_TELEMEDICINE_ROOMS;
  public telemedicineMessages: TelemedicineMessage[] = INITIAL_TELEMEDICINE_MESSAGES;
  public insuranceProviders: InsuranceProvider[] = INITIAL_INSURANCE_PROVIDERS;
  public insurancePolicies: InsurancePolicy[] = INITIAL_INSURANCE_POLICIES;
  public preAuthorizations: PreAuthorization[] = INITIAL_PRE_AUTHORIZATIONS;
  public insuranceClaims: InsuranceClaim[] = INITIAL_INSURANCE_CLAIMS;
  public claimSettlements: ClaimSettlement[] = INITIAL_CLAIM_SETTLEMENTS;
  public doctorShifts: DoctorShift[] = INITIAL_DOCTOR_SHIFTS;
  public onCallRosters: OnCallRoster[] = INITIAL_ON_CALL_ROSTERS;
  public drugSafetyWarnings: DrugSafetyWarning[] = INITIAL_DRUG_SAFETY_WARNINGS;
  public drugSafetyEvents: DrugSafetyEvent[] = INITIAL_DRUG_SAFETY_EVENTS;
  public backgroundJobs: BackgroundJobRecord[] = INITIAL_BACKGROUND_JOBS;
  public healthChecks: SystemHealthCheck[] = INITIAL_HEALTH_CHECKS;

  // Raw collections tracking demo vs production records
  public _rawPatients: Patient[] = [];
  public _rawAppointments: Appointment[] = [];
  public _rawDoctors: Doctor[] = [];
  public _rawInvoices: Invoice[] = [];
  public _rawInventory: InventoryItem[] = [];
  public _rawLeads: Lead[] = [];
  public _rawFollowups: FollowUp[] = [];
  public _rawServices: ServiceItem[] = [];
  public _rawPackages: HealthPackage[] = [];
  public _rawStaff: Staff[] = [];
  public _rawConsultations: Consultation[] = [];
  public _rawPrescriptions: Prescription[] = [];
  public _rawLabOrders: LabOrder[] = [];
  private _demoDataEnabled: boolean = false;
  private _technicalSettings: SystemTechnicalSettings = INITIAL_TECHNICAL_SETTINGS;

  private constructor() {
    this.loadFromStorageOrSeed();
  }

  public static getInstance(): ClinicDatabaseService {
    if (!ClinicDatabaseService.instance) {
      ClinicDatabaseService.instance = new ClinicDatabaseService();
    }
    return ClinicDatabaseService.instance;
  }

  private loadFromStorageOrSeed() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const demoFlag = localStorage.getItem('clinic_crm_demo_data_enabled');
      this._demoDataEnabled = demoFlag !== null ? demoFlag === 'true' : false;

      // Sync with persistent backend database setting
      if (typeof window !== 'undefined' && window.fetch) {
        window.fetch('/api/settings/demo-mode')
          .then((r) => r.json())
          .then((res) => {
            if (res && res.success && res.data && typeof res.data.demoDataEnabled === 'boolean') {
              if (this._demoDataEnabled !== res.data.demoDataEnabled) {
                this._demoDataEnabled = res.data.demoDataEnabled;
                if (this._technicalSettings) {
                  this._technicalSettings.demoDataEnabled = res.data.demoDataEnabled;
                }
                this.applyDemoFilter();
                window.dispatchEvent(new CustomEvent('clinic_crm_demo_mode_changed', { detail: { enabled: res.data.demoDataEnabled } }));
              }
            }
          })
          .catch(() => {});
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        this._technicalSettings = parsed.technicalSettings || INITIAL_TECHNICAL_SETTINGS;

        // Load raw collections preserving isDemo flag
        this._rawPatients = (parsed.rawPatients || parsed.patients || []).map((p: Patient) => ({
          ...p,
          status: p.status || 'Active',
          isDemo: p.isDemo !== undefined ? p.isDemo : true,
        }));
        this._rawAppointments = (parsed.rawAppointments || parsed.appointments || []).map((a: Appointment) => ({
          ...a,
          isDemo: a.isDemo !== undefined ? a.isDemo : true,
        }));
        this._rawDoctors = (parsed.rawDoctors || parsed.doctors || INITIAL_DOCTORS).map((d: Doctor) => ({
          ...d,
          isDemo: d.isDemo !== undefined ? d.isDemo : true,
        }));
        this._rawInvoices = (parsed.rawInvoices || parsed.invoices || []).map((i: Invoice) => ({
          ...i,
          isDemo: i.isDemo !== undefined ? i.isDemo : true,
        }));
        this._rawInventory = (parsed.rawInventory || parsed.inventory || INITIAL_INVENTORY).map((inv: InventoryItem) => ({
          ...inv,
          isDemo: inv.isDemo !== undefined ? inv.isDemo : true,
        }));
        this._rawLeads = (parsed.rawLeads || parsed.leads || INITIAL_LEADS).map((l: Lead) => ({
          ...l,
          isDemo: l.isDemo !== undefined ? l.isDemo : true,
        }));
        this._rawFollowups = (parsed.rawFollowups || parsed.followups || INITIAL_FOLLOWUPS).map((f: FollowUp) => ({
          ...f,
          isDemo: f.isDemo !== undefined ? f.isDemo : true,
        }));
        this._rawServices = (parsed.rawServices || parsed.services || INITIAL_SERVICES).map((s: ServiceItem) => ({
          ...s,
          isDemo: s.isDemo !== undefined ? s.isDemo : true,
        }));
        this._rawPackages = (parsed.rawPackages || parsed.packages || INITIAL_PACKAGES).map((pkg: HealthPackage) => ({
          ...pkg,
          isDemo: pkg.isDemo !== undefined ? pkg.isDemo : true,
        }));
        this._rawStaff = (parsed.rawStaff || parsed.staff || INITIAL_STAFF).map((st: Staff) => ({
          ...st,
          isDemo: st.isDemo !== undefined ? st.isDemo : true,
        }));
        this._rawConsultations = (parsed.rawConsultations || parsed.consultations || []).map((c: Consultation) => ({
          ...c,
          isDemo: c.isDemo !== undefined ? c.isDemo : true,
        }));
        this._rawPrescriptions = (parsed.rawPrescriptions || parsed.prescriptions || []).map((pr: Prescription) => ({
          ...pr,
          isDemo: pr.isDemo !== undefined ? pr.isDemo : true,
        }));
        this._rawLabOrders = (parsed.rawLabOrders || parsed.labOrders || []).map((lo: LabOrder) => ({
          ...lo,
          isDemo: lo.isDemo !== undefined ? lo.isDemo : true,
        }));

        this.payments = parsed.payments || [];
        this.documents = parsed.documents || [];
        this.doctorLeaves = parsed.doctorLeaves || INITIAL_DOCTOR_LEAVES;
        this.blockedSlots = parsed.blockedSlots || INITIAL_BLOCKED_SLOTS;
        this.prescriptionTemplates = parsed.prescriptionTemplates || INITIAL_PRESCRIPTION_TEMPLATES;
        this.medicalCertificates = parsed.medicalCertificates || INITIAL_CERTIFICATES;
        this.patientTags = parsed.patientTags || INITIAL_PATIENT_TAGS;
        this.patientSegments = parsed.patientSegments || INITIAL_PATIENT_SEGMENTS;
        this.crmActivities = parsed.crmActivities || INITIAL_CRM_ACTIVITIES;
        this.crmTasks = parsed.crmTasks || INITIAL_CRM_TASKS;
        this.communicationTemplates = parsed.communicationTemplates || INITIAL_COMMUNICATION_TEMPLATES;
        this.communicationLogs = parsed.communicationLogs || INITIAL_COMMUNICATION_LOGS;
        this.campaigns = parsed.campaigns || INITIAL_CAMPAIGNS;
        this.patientFeedback = parsed.patientFeedback || INITIAL_PATIENT_FEEDBACK;
        this.serviceRecoveryTasks = parsed.serviceRecoveryTasks || INITIAL_SERVICE_RECOVERY_TASKS;
        this.patientReferrals = parsed.patientReferrals || INITIAL_REFERRALS;
        this.automationRules = parsed.automationRules || INITIAL_AUTOMATION_RULES;
        this.automationExecutions = parsed.automationExecutions || INITIAL_AUTOMATION_EXECUTIONS;
        this.patientPreferences = parsed.patientPreferences || INITIAL_PATIENT_PREFERENCES;
        this.auditLogs = parsed.auditLogs || INITIAL_AUDIT_LOGS;
        this.notifications = parsed.notifications || INITIAL_NOTIFICATIONS;
        this.specialties = parsed.specialties || INITIAL_SPECIALTIES;
        this.branches = parsed.branches || INITIAL_BRANCHES;

        // Phase 7 & 8 persistent state
        this.departments = parsed.departments || INITIAL_DEPARTMENTS;
        this.employees = parsed.employees || INITIAL_EMPLOYEES;
        this.employeeDocuments = parsed.employeeDocuments || INITIAL_EMPLOYEE_DOCUMENTS;
        this.employeeShifts = parsed.employeeShifts || INITIAL_EMPLOYEE_SHIFTS;
        this.attendanceRecords = parsed.attendanceRecords || INITIAL_ATTENDANCE;
        this.leaveTypes = parsed.leaveTypes || INITIAL_LEAVE_TYPES;
        this.leaveBalances = parsed.leaveBalances || INITIAL_LEAVE_BALANCES;
        this.leaveRequests = parsed.leaveRequests || INITIAL_LEAVE_REQUESTS;
        this.employeeCompensations = parsed.employeeCompensations || INITIAL_COMPENSATIONS;
        this.roles = parsed.roles || INITIAL_ROLES;
        this.userSessions = parsed.userSessions || INITIAL_USER_SESSIONS;
        this.loginHistory = parsed.loginHistory || INITIAL_LOGIN_HISTORY;
        this.securityEvents = parsed.securityEvents || INITIAL_SECURITY_EVENTS;
        this.backupJobs = parsed.backupJobs || INITIAL_BACKUP_JOBS;
        this.exportJobs = parsed.exportJobs || INITIAL_EXPORT_JOBS;
        this.integrations = parsed.integrations || INITIAL_INTEGRATIONS;
        this.apiKeys = parsed.apiKeys || INITIAL_API_KEYS;
        this.webhooks = parsed.webhooks || INITIAL_WEBHOOKS;
        this.featureFlags = parsed.featureFlags || INITIAL_FEATURE_FLAGS;
        this.saasPlans = parsed.saasPlans || INITIAL_SAAS_PLANS;
        this.organizationSubscriptions = parsed.organizationSubscriptions || INITIAL_SUBSCRIPTIONS;
        this.usageMetrics = parsed.usageMetrics || INITIAL_USAGE_METRICS;
        this.announcements = parsed.announcements || INITIAL_ANNOUNCEMENTS;
        this.telemedicineRooms = parsed.telemedicineRooms || INITIAL_TELEMEDICINE_ROOMS;
        this.telemedicineMessages = parsed.telemedicineMessages || INITIAL_TELEMEDICINE_MESSAGES;
        this.insuranceProviders = parsed.insuranceProviders || INITIAL_INSURANCE_PROVIDERS;
        this.insurancePolicies = parsed.insurancePolicies || INITIAL_INSURANCE_POLICIES;
        this.preAuthorizations = parsed.preAuthorizations || INITIAL_PRE_AUTHORIZATIONS;
        this.insuranceClaims = parsed.insuranceClaims || INITIAL_INSURANCE_CLAIMS;
        this.claimSettlements = parsed.claimSettlements || INITIAL_CLAIM_SETTLEMENTS;
        this.doctorShifts = parsed.doctorShifts || INITIAL_DOCTOR_SHIFTS;
        this.onCallRosters = parsed.onCallRosters || INITIAL_ON_CALL_ROSTERS;
        this.drugSafetyWarnings = parsed.drugSafetyWarnings || INITIAL_DRUG_SAFETY_WARNINGS;
        this.drugSafetyEvents = parsed.drugSafetyEvents || INITIAL_DRUG_SAFETY_EVENTS;
        this.backgroundJobs = parsed.backgroundJobs || INITIAL_BACKGROUND_JOBS;
        this.healthChecks = parsed.healthChecks || INITIAL_HEALTH_CHECKS;

        this.applyDemoFilter();
        return;
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using fresh seed data', e);
    }

    // Seed fresh data with isDemo: true
    const demoSetting = localStorage.getItem('clinic_crm_demo_data_enabled');
    this._demoDataEnabled = demoSetting !== null ? demoSetting === 'true' : false;
    this._technicalSettings = INITIAL_TECHNICAL_SETTINGS;

    this._rawPatients = generateSeedPatients().map((p) => ({ ...p, isDemo: true }));
    this._rawDoctors = INITIAL_DOCTORS.map((d) => ({ ...d, isDemo: true }));

    const seed = generateSeedAppointments(this._rawPatients, this._rawDoctors);
    this._rawAppointments = seed.appointments.map((a) => ({ ...a, isDemo: true }));
    this._rawConsultations = seed.consultations.map((c) => ({ ...c, isDemo: true }));
    this._rawPrescriptions = seed.prescriptions.map((p) => ({ ...p, isDemo: true }));
    this._rawLabOrders = seed.labOrders.map((l) => ({ ...l, isDemo: true }));
    this._rawInvoices = seed.invoices.map((i) => ({ ...i, isDemo: true }));
    this.payments = seed.payments;
    this.documents = seed.documents;
    this.doctorLeaves = INITIAL_DOCTOR_LEAVES;
    this.blockedSlots = INITIAL_BLOCKED_SLOTS;
    this.prescriptionTemplates = INITIAL_PRESCRIPTION_TEMPLATES;
    this.medicalCertificates = INITIAL_CERTIFICATES;
    this._rawLeads = INITIAL_LEADS.map((l) => ({ ...l, isDemo: true }));
    this._rawFollowups = INITIAL_FOLLOWUPS.map((f) => ({ ...f, isDemo: true }));
    this.patientTags = INITIAL_PATIENT_TAGS;
    this.patientSegments = INITIAL_PATIENT_SEGMENTS;
    this.crmActivities = INITIAL_CRM_ACTIVITIES;
    this.crmTasks = INITIAL_CRM_TASKS;
    this.communicationTemplates = INITIAL_COMMUNICATION_TEMPLATES;
    this.communicationLogs = INITIAL_COMMUNICATION_LOGS;
    this.campaigns = INITIAL_CAMPAIGNS;
    this.patientFeedback = INITIAL_PATIENT_FEEDBACK;
    this.serviceRecoveryTasks = INITIAL_SERVICE_RECOVERY_TASKS;
    this.patientReferrals = INITIAL_REFERRALS;
    this.automationRules = INITIAL_AUTOMATION_RULES;
    this.automationExecutions = INITIAL_AUTOMATION_EXECUTIONS;
    this.patientPreferences = INITIAL_PATIENT_PREFERENCES;
    this._rawInventory = INITIAL_INVENTORY.map((i) => ({ ...i, isDemo: true }));
    this._rawServices = INITIAL_SERVICES.map((s) => ({ ...s, isDemo: true }));
    this._rawPackages = INITIAL_PACKAGES.map((p) => ({ ...p, isDemo: true }));
    this._rawStaff = INITIAL_STAFF.map((st) => ({ ...st, isDemo: true }));

    this.applyDemoFilter();
    this.saveToStorage();
  }

  public saveToStorage() {
    try {
      const payload = {
        // Raw records with isDemo flags
        rawPatients: this._rawPatients,
        rawAppointments: this._rawAppointments,
        rawDoctors: this._rawDoctors,
        rawInvoices: this._rawInvoices,
        rawInventory: this._rawInventory,
        rawLeads: this._rawLeads,
        rawFollowups: this._rawFollowups,
        rawServices: this._rawServices,
        rawPackages: this._rawPackages,
        rawStaff: this._rawStaff,
        rawConsultations: this._rawConsultations,
        rawPrescriptions: this._rawPrescriptions,
        rawLabOrders: this._rawLabOrders,
        technicalSettings: this._technicalSettings,

        // Active filtered views
        patients: this.patients,
        appointments: this.appointments,
        consultations: this.consultations,
        prescriptions: this.prescriptions,
        labOrders: this.labOrders,
        invoices: this.invoices,
        payments: this.payments,
        documents: this.documents,
        doctorLeaves: this.doctorLeaves,
        blockedSlots: this.blockedSlots,
        prescriptionTemplates: this.prescriptionTemplates,
        medicalCertificates: this.medicalCertificates,
        leads: this.leads,
        followups: this.followups,
        patientTags: this.patientTags,
        patientSegments: this.patientSegments,
        crmActivities: this.crmActivities,
        crmTasks: this.crmTasks,
        communicationTemplates: this.communicationTemplates,
        communicationLogs: this.communicationLogs,
        campaigns: this.campaigns,
        patientFeedback: this.patientFeedback,
        serviceRecoveryTasks: this.serviceRecoveryTasks,
        patientReferrals: this.patientReferrals,
        automationRules: this.automationRules,
        automationExecutions: this.automationExecutions,
        patientPreferences: this.patientPreferences,
        inventory: this.inventory,
        auditLogs: this.auditLogs,
        notifications: this.notifications,
        doctors: this.doctors,
        services: this.services,
        packages: this.packages,
        specialties: this.specialties,
        branches: this.branches,
        departments: this.departments,
        employees: this.employees,
        employeeDocuments: this.employeeDocuments,
        employeeShifts: this.employeeShifts,
        attendanceRecords: this.attendanceRecords,
        leaveTypes: this.leaveTypes,
        leaveBalances: this.leaveBalances,
        leaveRequests: this.leaveRequests,
        employeeCompensations: this.employeeCompensations,
        roles: this.roles,
        userSessions: this.userSessions,
        loginHistory: this.loginHistory,
        securityEvents: this.securityEvents,
        backupJobs: this.backupJobs,
        exportJobs: this.exportJobs,
        integrations: this.integrations,
        apiKeys: this.apiKeys,
        webhooks: this.webhooks,
        featureFlags: this.featureFlags,
        saasPlans: this.saasPlans,
        organizationSubscriptions: this.organizationSubscriptions,
        usageMetrics: this.usageMetrics,
        announcements: this.announcements,
        telemedicineRooms: this.telemedicineRooms,
        telemedicineMessages: this.telemedicineMessages,
        insuranceProviders: this.insuranceProviders,
        insurancePolicies: this.insurancePolicies,
        preAuthorizations: this.preAuthorizations,
        insuranceClaims: this.insuranceClaims,
        claimSettlements: this.claimSettlements,
        doctorShifts: this.doctorShifts,
        onCallRosters: this.onCallRosters,
        drugSafetyWarnings: this.drugSafetyWarnings,
        drugSafetyEvents: this.drugSafetyEvents,
        backgroundJobs: this.backgroundJobs,
        healthChecks: this.healthChecks,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to persist database state', e);
    }
  }

  // --- Demo Data & Technical Settings Engine ---

  public applyDemoFilter(): void {
    const isDemo = this.isDemoDataEnabled();
    this.patients = isDemo ? [...this._rawPatients] : this._rawPatients.filter((p) => !p.isDemo);
    this.appointments = isDemo ? [...this._rawAppointments] : this._rawAppointments.filter((a) => !a.isDemo);
    this.doctors = isDemo ? [...this._rawDoctors] : this._rawDoctors.filter((d) => !d.isDemo);
    this.invoices = isDemo ? [...this._rawInvoices] : this._rawInvoices.filter((i) => !i.isDemo);
    this.inventory = isDemo ? [...this._rawInventory] : this._rawInventory.filter((inv) => !inv.isDemo);
    this.leads = isDemo ? [...this._rawLeads] : this._rawLeads.filter((l) => !l.isDemo);
    this.followups = isDemo ? [...this._rawFollowups] : this._rawFollowups.filter((f) => !f.isDemo);
    this.services = isDemo ? [...this._rawServices] : this._rawServices.filter((s) => !s.isDemo);
    this.packages = isDemo ? [...this._rawPackages] : this._rawPackages.filter((pkg) => !pkg.isDemo);
    this.staff = isDemo ? [...this._rawStaff] : this._rawStaff.filter((st) => !st.isDemo);
    this.consultations = isDemo ? [...this._rawConsultations] : this._rawConsultations.filter((c) => !c.isDemo);
    this.prescriptions = isDemo ? [...this._rawPrescriptions] : this._rawPrescriptions.filter((pr) => !pr.isDemo);
    this.labOrders = isDemo ? [...this._rawLabOrders] : this._rawLabOrders.filter((lo) => !lo.isDemo);
  }

  public isDemoDataEnabled(): boolean {
    return this._demoDataEnabled;
  }

  public setDemoDataEnabled(enabled: boolean): void {
    this._demoDataEnabled = enabled;
    localStorage.setItem('clinic_crm_demo_data_enabled', String(enabled));
    if (this._technicalSettings) {
      this._technicalSettings.demoDataEnabled = enabled;
    }
    this.applyDemoFilter();
    this.saveToStorage();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clinic_crm_demo_mode_changed', { detail: { enabled } }));
    }

    // Persist to backend database (requires Super Admin)
    if (typeof window !== 'undefined' && window.fetch) {
      const token = localStorage.getItem('clinic_crm_auth_token') || sessionStorage.getItem('clinic_crm_auth_token');
      window.fetch('/api/settings/demo-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ demoDataEnabled: enabled }),
      }).catch(() => {});
    }

    this.addAuditLog(
      'SUPER_ADMIN',
      enabled ? 'ENABLED_DEMO_DATA' : 'DISABLED_DEMO_DATA',
      'Settings',
      'TechnicalSettings',
      'demo-mode',
      `Super Admin ${enabled ? 'enabled' : 'disabled'} demo/sample data visibility across the application.`
    );
  }

  public getTechnicalSettings(): SystemTechnicalSettings {
    if (!this._technicalSettings) {
      this._technicalSettings = { ...INITIAL_TECHNICAL_SETTINGS };
    }
    this._technicalSettings.demoDataEnabled = this.isDemoDataEnabled();
    return this._technicalSettings;
  }

  public updateTechnicalSettings(updates: Partial<SystemTechnicalSettings>, user: string = 'Super Admin'): SystemTechnicalSettings {
    this._technicalSettings = {
      ...this.getTechnicalSettings(),
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user,
    };
    if (updates.demoDataEnabled !== undefined) {
      this.setDemoDataEnabled(updates.demoDataEnabled);
    } else {
      this.saveToStorage();
    }
    this.addAuditLog(
      'SUPER_ADMIN',
      'UPDATED_TECHNICAL_SETTINGS',
      'Settings',
      'TechnicalSettings',
      'tech-config',
      `Super Admin updated system technical settings (database, email, SMS, or integrations).`
    );
    return this._technicalSettings;
  }

  public getDemoDataStats(): DemoDataStats {
    const totalPatients = this._rawPatients.length;
    const demoPatients = this._rawPatients.filter((p) => p.isDemo).length;
    const prodPatients = totalPatients - demoPatients;

    const totalAppointments = this._rawAppointments.length;
    const demoAppointments = this._rawAppointments.filter((a) => a.isDemo).length;
    const prodAppointments = totalAppointments - demoAppointments;

    const totalInvoices = this._rawInvoices.length;
    const demoInvoices = this._rawInvoices.filter((i) => i.isDemo).length;
    const prodInvoices = totalInvoices - demoInvoices;

    const totalDoctors = this._rawDoctors.length;
    const demoDoctors = this._rawDoctors.filter((d) => d.isDemo).length;
    const prodDoctors = totalDoctors - demoDoctors;

    const totalInventory = this._rawInventory.length;
    const demoInventory = this._rawInventory.filter((inv) => inv.isDemo).length;
    const prodInventory = totalInventory - demoInventory;

    const totalLeads = this._rawLeads.length;
    const demoLeads = this._rawLeads.filter((l) => l.isDemo).length;
    const prodLeads = totalLeads - demoLeads;

    return {
      totalPatients,
      demoPatients,
      prodPatients,
      totalAppointments,
      demoAppointments,
      prodAppointments,
      totalInvoices,
      demoInvoices,
      prodInvoices,
      totalDoctors,
      demoDoctors,
      prodDoctors,
      totalInventory,
      demoInventory,
      prodInventory,
      totalLeads,
      demoLeads,
      prodLeads,
      demoDataEnabled: this.isDemoDataEnabled(),
      isDemoDataEnabled: this.isDemoDataEnabled(),
    };
  }

  /**
   * Safe mechanism for seeding demo data without overwriting existing production data.
   * Directive: Check and update, don't create duplicates.
   */
  public seedDemoDataSafely(): { success: boolean; message: string; added: number; updated: number; stats: DemoDataStats } {
    let addedCount = 0;
    let updatedCount = 0;

    // 1. Patients: match by patientId or email/phone
    const freshPatients = generateSeedPatients().map((p) => ({ ...p, isDemo: true }));
    freshPatients.forEach((seedPat) => {
      const existingIdx = this._rawPatients.findIndex(
        (p) => p.patientId === seedPat.patientId || p.email.toLowerCase() === seedPat.email.toLowerCase() || p.id === seedPat.id
      );
      if (existingIdx !== -1) {
        // If it's a demo record, update it without duplicating
        if (this._rawPatients[existingIdx].isDemo) {
          this._rawPatients[existingIdx] = { ...this._rawPatients[existingIdx], ...seedPat, isDemo: true };
          updatedCount++;
        }
        // If it's a production record, protect it (NEVER overwrite production data)
      } else {
        this._rawPatients.push(seedPat);
        addedCount++;
      }
    });

    // 2. Doctors: match by id or email
    INITIAL_DOCTORS.forEach((seedDoc) => {
      const existingIdx = this._rawDoctors.findIndex(
        (d) => d.id === seedDoc.id || d.email.toLowerCase() === seedDoc.email.toLowerCase()
      );
      if (existingIdx !== -1) {
        if (this._rawDoctors[existingIdx].isDemo) {
          this._rawDoctors[existingIdx] = { ...this._rawDoctors[existingIdx], ...seedDoc, isDemo: true };
          updatedCount++;
        }
      } else {
        this._rawDoctors.push({ ...seedDoc, isDemo: true });
        addedCount++;
      }
    });

    // 3. Appointments
    const seed = generateSeedAppointments(this._rawPatients, this._rawDoctors);
    seed.appointments.forEach((seedApt) => {
      const existingIdx = this._rawAppointments.findIndex((a) => a.id === seedApt.id);
      if (existingIdx !== -1) {
        if (this._rawAppointments[existingIdx].isDemo) {
          this._rawAppointments[existingIdx] = { ...this._rawAppointments[existingIdx], ...seedApt, isDemo: true };
          updatedCount++;
        }
      } else {
        this._rawAppointments.push({ ...seedApt, isDemo: true });
        addedCount++;
      }
    });

    // 4. Inventory
    INITIAL_INVENTORY.forEach((inv) => {
      const existingIdx = this._rawInventory.findIndex((i) => i.id === inv.id || i.sku === inv.sku);
      if (existingIdx !== -1) {
        if (this._rawInventory[existingIdx].isDemo) {
          this._rawInventory[existingIdx] = { ...this._rawInventory[existingIdx], ...inv, isDemo: true };
          updatedCount++;
        }
      } else {
        this._rawInventory.push({ ...inv, isDemo: true });
        addedCount++;
      }
    });

    // 5. Leads
    INITIAL_LEADS.forEach((seedLead) => {
      const existingIdx = this._rawLeads.findIndex((l) => l.id === seedLead.id || l.phone === seedLead.phone);
      if (existingIdx !== -1) {
        if (this._rawLeads[existingIdx].isDemo) {
          this._rawLeads[existingIdx] = { ...this._rawLeads[existingIdx], ...seedLead, isDemo: true };
          updatedCount++;
        }
      } else {
        this._rawLeads.push({ ...seedLead, isDemo: true });
        addedCount++;
      }
    });

    // 6. Invoices
    seed.invoices.forEach((inv) => {
      const existingIdx = this._rawInvoices.findIndex((i) => i.id === inv.id || i.invoiceNumber === inv.invoiceNumber);
      if (existingIdx !== -1) {
        if (this._rawInvoices[existingIdx].isDemo) {
          this._rawInvoices[existingIdx] = { ...this._rawInvoices[existingIdx], ...inv, isDemo: true };
          updatedCount++;
        }
      } else {
        this._rawInvoices.push({ ...inv, isDemo: true });
        addedCount++;
      }
    });

    this.setDemoDataEnabled(true);
    this.applyDemoFilter();
    this.saveToStorage();

    this.addAuditLog(
      'SUPER_ADMIN',
      'SEEDED_DEMO_DATA',
      'Settings',
      'TechnicalSettings',
      'demo-seed',
      `Super Admin executed safe demo data seeding: ${addedCount} records added, ${updatedCount} records refreshed. Zero production data overwritten.`
    );

    return {
      success: true,
      message: `Demo data safely synced: ${addedCount} new records added, ${updatedCount} existing demo records refreshed. Production data was completely preserved.`,
      added: addedCount,
      updated: updatedCount,
      stats: this.getDemoDataStats(),
    };
  }

  /**
   * Safely clears only demo records while keeping 100% of production user records intact.
   */
  public clearDemoDataOnly(): { success: boolean; message: string; removed: number; stats: DemoDataStats } {
    const beforeCount =
      this._rawPatients.length +
      this._rawAppointments.length +
      this._rawInvoices.length +
      this._rawDoctors.length +
      this._rawInventory.length +
      this._rawLeads.length;

    this._rawPatients = this._rawPatients.filter((p) => !p.isDemo);
    this._rawAppointments = this._rawAppointments.filter((a) => !a.isDemo);
    this._rawInvoices = this._rawInvoices.filter((i) => !i.isDemo);
    this._rawDoctors = this._rawDoctors.filter((d) => !d.isDemo);
    this._rawInventory = this._rawInventory.filter((inv) => !inv.isDemo);
    this._rawLeads = this._rawLeads.filter((l) => !l.isDemo);
    this._rawFollowups = this._rawFollowups.filter((f) => !f.isDemo);
    this._rawServices = this._rawServices.filter((s) => !s.isDemo);
    this._rawPackages = this._rawPackages.filter((pkg) => !pkg.isDemo);
    this._rawStaff = this._rawStaff.filter((st) => !st.isDemo);
    this._rawConsultations = this._rawConsultations.filter((c) => !c.isDemo);
    this._rawPrescriptions = this._rawPrescriptions.filter((pr) => !pr.isDemo);
    this._rawLabOrders = this._rawLabOrders.filter((lo) => !lo.isDemo);

    const afterCount =
      this._rawPatients.length +
      this._rawAppointments.length +
      this._rawInvoices.length +
      this._rawDoctors.length +
      this._rawInventory.length +
      this._rawLeads.length;

    const removed = beforeCount - afterCount;

    this.applyDemoFilter();
    this.saveToStorage();

    this.addAuditLog(
      'SUPER_ADMIN',
      'CLEARED_DEMO_DATA',
      'Settings',
      'TechnicalSettings',
      'demo-purge',
      `Super Admin removed ${removed} demo records. All production business records preserved.`
    );

    return {
      success: true,
      message: `Cleared ${removed} sample demo records. All real production records remain untouched.`,
      removed,
      stats: this.getDemoDataStats(),
    };
  }

  /**
   * Resets the database to a completely clean, empty state with 0 business records.
   * Perfect for production rollouts or fresh clinic initialization.
   */
  public resetToEmptyProductionDatabase(): { success: boolean; message: string } {
    this._rawPatients = [];
    this._rawAppointments = [];
    this._rawInvoices = [];
    this._rawInventory = [];
    this._rawLeads = [];
    this._rawFollowups = [];
    this._rawConsultations = [];
    this._rawPrescriptions = [];
    this._rawLabOrders = [];
    this.payments = [];
    this.documents = [];

    this.setDemoDataEnabled(false);
    this.applyDemoFilter();
    this.saveToStorage();

    this.addAuditLog(
      'SUPER_ADMIN',
      'RESET_EMPTY_DATABASE',
      'Settings',
      'TechnicalSettings',
      'empty-db',
      `Super Admin initialized an empty production database with zero business records.`
    );

    return {
      success: true,
      message: 'System database successfully initialized with zero business records. Ready for production deployment.',
    };
  }

  // --- Patients API ---
  public getPatients(filter?: { query?: string; category?: string; branchId?: string }): Patient[] {
    return this.patients.filter((p) => {
      if (filter?.branchId && filter.branchId !== 'all' && p.branchId !== filter.branchId) return false;
      if (filter?.category && filter.category !== 'all' && p.category !== filter.category) return false;
      if (filter?.query) {
        const q = filter.query.toLowerCase();
        return (
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }

  public getPatientById(idOrPatientId: string): Patient | undefined {
    return this.patients.find((p) => p.id === idOrPatientId || p.patientId === idOrPatientId);
  }

  /**
   * Strict Privacy-Guarded Patient Accessor:
   * Prevents Customer A from accessing Customer B's records.
   */
  public getPatientByIdForUser(
    idOrPatientId: string,
    currentUser: { id: string; role: string; email: string; patientId?: string }
  ): { success: boolean; patient?: Patient; error?: string } {
    const patient = this.getPatientById(idOrPatientId);
    if (!patient) {
      return { success: false, error: 'Patient record not found.' };
    }

    // If logged-in user is a patient or customer, strictly ensure match
    if (currentUser.role === 'PATIENT' || currentUser.role === 'CUSTOMER') {
      const isOwner =
        (currentUser.patientId && (currentUser.patientId === patient.id || currentUser.patientId === patient.patientId)) ||
        currentUser.email.toLowerCase() === patient.email.toLowerCase();

      if (!isOwner) {
        return {
          success: false,
          error: 'Access Denied: Patient privacy isolation violation. You can only access your own profile and health records.',
        };
      }
    }

    return { success: true, patient };
  }

  public createPatient(patientData: Omit<Patient, 'id' | 'patientId' | 'totalVisits' | 'totalSpent' | 'registeredDate'> & { status?: 'Active' | 'Inactive' | 'Archived' }): Patient {
    // Check if patient already exists by phone or email to avoid duplicates
    const existing = this._rawPatients.find(
      (p) =>
        (patientData.phone && p.phone === patientData.phone) ||
        (patientData.email && p.email && p.email.toLowerCase() === patientData.email.toLowerCase())
    );
    if (existing) {
      // Update existing record without duplicate creation
      const updated = {
        ...existing,
        ...patientData,
        status: patientData.status || existing.status || 'Active',
      };
      const rawIdx = this._rawPatients.findIndex((p) => p.id === existing.id);
      if (rawIdx !== -1) {
        this._rawPatients[rawIdx] = updated;
      }
      this.applyDemoFilter();
      this.saveToStorage();
      this.addAuditLog('RECEPTIONIST', 'UPDATED_PATIENT', 'Patients', 'Patient', updated.id, `Updated existing patient record ${updated.firstName} ${updated.lastName} (${updated.patientId})`);
      return updated;
    }

    const nextNum = this._rawPatients.length + 1;
    const pad = String(nextNum).padStart(4, '0');
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${pad}`,
      patientId: `PAT-2026-${pad}`,
      status: patientData.status || 'Active',
      branchId: patientData.branchId || 'branch-01',
      totalVisits: 0,
      totalSpent: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      isDemo: false,
    };
    this._rawPatients.unshift(newPatient);
    this.applyDemoFilter();
    this.addAuditLog('RECEPTIONIST', 'CREATED_PATIENT', 'Patients', 'Patient', newPatient.id, `Created new patient record for ${newPatient.firstName} ${newPatient.lastName} (${newPatient.patientId})`);
    this.saveToStorage();
    return newPatient;
  }

  public updatePatient(id: string, updates: Partial<Patient>): Patient | undefined {
    const rawIdx = this._rawPatients.findIndex((p) => p.id === id || p.patientId === id);
    if (rawIdx === -1) return undefined;
    const prev = this._rawPatients[rawIdx];
    this._rawPatients[rawIdx] = { ...prev, ...updates };
    this.applyDemoFilter();
    this.addAuditLog(
      'ADMIN',
      'UPDATED_PATIENT',
      'Patients',
      'Patient',
      this._rawPatients[rawIdx].id,
      `Updated profile for patient ${this._rawPatients[rawIdx].firstName} ${this._rawPatients[rawIdx].lastName} (${this._rawPatients[rawIdx].patientId})`
    );
    this.saveToStorage();
    return this._rawPatients[rawIdx];
  }

  public archivePatient(id: string): { success: boolean; patient?: Patient; error?: string } {
    const p = this.updatePatient(id, { status: 'Archived' });
    if (!p) return { success: false, error: 'Patient not found' };
    this.addAuditLog('ADMIN', 'ARCHIVED_PATIENT', 'Patients', 'Patient', p.id, `Archived patient profile ${p.firstName} ${p.lastName} (${p.patientId})`);
    return { success: true, patient: p };
  }

  public deactivatePatient(id: string): { success: boolean; patient?: Patient; error?: string } {
    const p = this.updatePatient(id, { status: 'Inactive' });
    if (!p) return { success: false, error: 'Patient not found' };
    this.addAuditLog('ADMIN', 'DEACTIVATED_PATIENT', 'Patients', 'Patient', p.id, `Deactivated patient profile ${p.firstName} ${p.lastName} (${p.patientId})`);
    return { success: true, patient: p };
  }

  public reactivatePatient(id: string): { success: boolean; patient?: Patient; error?: string } {
    const p = this.updatePatient(id, { status: 'Active' });
    if (!p) return { success: false, error: 'Patient not found' };
    this.addAuditLog('ADMIN', 'REACTIVATED_PATIENT', 'Patients', 'Patient', p.id, `Reactivated patient profile ${p.firstName} ${p.lastName} (${p.patientId})`);
    return { success: true, patient: p };
  }

  public deletePatient(id: string, force: boolean = false): { success: boolean; error?: string; reason?: string } {
    const idx = this.patients.findIndex((p) => p.id === id || p.patientId === id);
    if (idx === -1) return { success: false, error: 'Patient record not found.' };

    const targetPatient = this.patients[idx];

    // Legal / Regulatory retention check: verify active unpaid invoices or active appointments
    const openInvoices = this.invoices.filter((i) => i.patientId === targetPatient.id && i.status !== 'Paid');
    const upcomingAppointments = this.appointments.filter(
      (a) => a.patientId === targetPatient.id && (a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'In Consultation')
    );

    if (!force && (openInvoices.length > 0 || upcomingAppointments.length > 0)) {
      const reasons = [];
      if (openInvoices.length > 0) reasons.push(`${openInvoices.length} outstanding invoice(s)`);
      if (upcomingAppointments.length > 0) reasons.push(`${upcomingAppointments.length} upcoming scheduled consultation(s)`);
      return {
        success: false,
        error: `Legal & Clinical Retention Safeguard: Patient has ${reasons.join(' and ')}. Please archive or deactivate patient, or use administrative force purge override if legally permitted.`,
      };
    }

    // Remove patient
    this.patients.splice(idx, 1);
    this.addAuditLog(
      'SUPER_ADMIN',
      'DELETED_PATIENT',
      'Patients',
      'Patient',
      targetPatient.id,
      `Purged patient record for ${targetPatient.firstName} ${targetPatient.lastName} (${targetPatient.patientId})`
    );
    this.saveToStorage();
    return { success: true };
  }

  // --- Appointments & Queue API ---
  public getAppointments(filter?: { date?: string; doctorId?: string; branchId?: string; status?: string; patientId?: string }): Appointment[] {
    return this.appointments.filter((a) => {
      if (filter?.date && a.date !== filter.date) return false;
      if (filter?.doctorId && a.doctorId !== filter.doctorId) return false;
      if (filter?.branchId && filter.branchId !== 'all' && a.branchId !== filter.branchId) return false;
      if (filter?.status && filter.status !== 'all' && a.status !== filter.status) return false;
      if (filter?.patientId && a.patientId !== filter.patientId) return false;
      return true;
    });
  }

  public createAppointment(data: {
    patientId: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    visitType: VisitType;
    chiefComplaint?: string;
    notes?: string;
  }): Appointment {
    const patient = this.getPatientById(data.patientId);
    const doctor = this.doctors.find((d) => d.id === data.doctorId);
    if (!patient || !doctor) throw new Error('Patient or Doctor not found');

    // Count existing for today to assign token
    const todayAppointments = this.appointments.filter((a) => a.date === data.date && a.doctorId === doctor.id);
    const token = todayAppointments.length + 1;
    const aptCount = this.appointments.length + 1;
    const aptId = `apt-2026-${String(aptCount).padStart(3, '0')}`;
    const aptNum = `APT-2026-${String(aptCount).padStart(3, '0')}`;

    const newApt: Appointment = {
      id: aptId,
      appointmentNumber: aptNum,
      organizationId: 'org-01',
      branchId: doctor.branchId,
      branchName: doctor.branchId === 'branch-01' ? 'Downtown Central Clinic' : 'Metro North Specialty Pavilion',
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      patientEmail: patient.email,
      patientAge: 2026 - parseInt(patient.dateOfBirth.split('-')[0]),
      patientGender: patient.gender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialtyName,
      specialtyId: doctor.specialtyId,
      date: data.date,
      timeSlot: data.timeSlot,
      visitType: data.visitType,
      status: 'Confirmed',
      tokenNumber: token,
      chiefComplaint: data.chiefComplaint,
      notes: data.notes,
      fee: doctor.consultationFee,
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    this._rawAppointments.unshift(newApt);
    this.applyDemoFilter();
    this.addAuditLog('RECEPTIONIST', 'BOOKED_APPOINTMENT', 'Appointments', 'Appointment', newApt.id, `Booked appointment for ${patient.firstName} ${patient.lastName} with ${doctor.name} on ${data.date} at ${data.timeSlot}`);
    
    // Add Notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      targetRole: 'DOCTOR',
      title: 'New Appointment Booked',
      message: `${patient.firstName} ${patient.lastName} booked a slot for ${data.date} at ${data.timeSlot}.`,
      type: 'appointment',
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.saveToStorage();
    return newApt;
  }

  public updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Appointment | undefined {
    const rawApt = this._rawAppointments.find((a) => a.id === appointmentId);
    if (!rawApt) return undefined;

    rawApt.status = status;
    const nowIso = new Date().toISOString();
    if (status === 'Checked In' || status === 'Waiting') {
      rawApt.checkedInAt = nowIso;
    } else if (status === 'In Consultation') {
      rawApt.consultationStartedAt = nowIso;
    } else if (status === 'Completed') {
      rawApt.consultationCompletedAt = nowIso;
    }

    this.applyDemoFilter();
    this.addAuditLog('RECEPTIONIST', 'UPDATED_APPOINTMENT_STATUS', 'Appointments', 'Appointment', rawApt.id, `Changed appointment status to ${status} for ${rawApt.patientName}`);
    this.saveToStorage();
    return rawApt;
  }

  // --- Complete Real Consultation Workflow ---
  public saveConsultation(data: {
    appointmentId: string;
    patientId: string;
    doctorId: string;
    chiefComplaint: string;
    symptoms: string[];
    vitals: Consultation['vitals'];
    clinicalExamination: string;
    diagnosis: string;
    icdCode?: string;
    investigationsRequired: string[];
    treatmentPlan: string;
    doctorNotes: string;
    followUpDate?: string;
    prescriptionItems: Prescription['items'];
    advice?: string;
    isComplete: boolean;
  }): { consultation: Consultation; prescription?: Prescription; invoice?: Invoice } {
    const apt = this.appointments.find((a) => a.id === data.appointmentId);
    const doctor = this.doctors.find((d) => d.id === data.doctorId);
    const patient = this.getPatientById(data.patientId);

    if (!apt || !doctor || !patient) throw new Error('Invalid consultation context');

    const cnsCount = this.consultations.length + 1;
    const cnsId = `cns-2026-${String(cnsCount).padStart(3, '0')}`;
    const rxCount = this.prescriptions.length + 1;
    const rxId = `rx-2026-${String(rxCount).padStart(3, '0')}`;

    let prescription: Prescription | undefined = undefined;
    if (data.prescriptionItems && data.prescriptionItems.length > 0) {
      prescription = {
        id: rxId,
        prescriptionNumber: `RX-2026-${String(rxCount).padStart(3, '0')}`,
        consultationId: cnsId,
        appointmentId: apt.id,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientAge: 2026 - parseInt(patient.dateOfBirth.split('-')[0]),
        patientGender: patient.gender,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorQualification: doctor.qualification,
        doctorRegNumber: doctor.registrationNumber,
        date: new Date().toISOString().split('T')[0],
        diagnosis: data.diagnosis,
        items: data.prescriptionItems,
        advice: data.advice,
        followUpDate: data.followUpDate,
        status: 'Issued',
        doctorSignature: `${doctor.name} [Verified Digital Stamp]`,
        createdAt: new Date().toISOString(),
      };
      this.prescriptions.unshift(prescription);

      // Add to patient documents
      this.documents.unshift({
        id: `doc-${Date.now()}`,
        patientId: patient.id,
        title: `Prescription - ${prescription.prescriptionNumber} (${doctor.specialtyName})`,
        category: 'Prescription',
        fileName: `${prescription.prescriptionNumber}-${patient.lastName}.pdf`,
        fileSize: '210 KB',
        fileUrl: '#',
        uploadedBy: doctor.name,
        uploadedAt: new Date().toISOString(),
      });
    }

    const consultation: Consultation = {
      id: cnsId,
      consultationNumber: `CNS-2026-${String(cnsCount).padStart(3, '0')}`,
      appointmentId: apt.id,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      branchId: doctor.branchId,
      date: new Date().toISOString().split('T')[0],
      chiefComplaint: data.chiefComplaint,
      symptoms: data.symptoms,
      vitals: data.vitals,
      pastMedicalHistory: patient.medicalConditions.join(', '),
      allergies: patient.allergies,
      clinicalExamination: data.clinicalExamination,
      diagnosis: data.diagnosis,
      icdCode: data.icdCode,
      investigationsRequired: data.investigationsRequired,
      prescription,
      treatmentPlan: data.treatmentPlan,
      doctorNotes: data.doctorNotes,
      followUpDate: data.followUpDate,
      status: data.isComplete ? 'Completed' : 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
    };

    this._rawConsultations.unshift(consultation);

    if (data.isComplete) {
      apt.status = 'Completed';
      apt.consultationCompletedAt = new Date().toISOString();
      patient.totalVisits += 1;
      patient.lastVisitDate = new Date().toISOString().split('T')[0];

      // Auto generate Invoice if not exists
      const invCount = this._rawInvoices.length + 1;
      const invoice: Invoice = {
        id: `inv-2026-${String(invCount).padStart(3, '0')}`,
        invoiceNumber: `INV-2026-${String(invCount).padStart(3, '0')}`,
        organizationId: 'org-01',
        branchId: doctor.branchId,
        branchName: doctor.branchId === 'branch-01' ? 'Downtown Central Clinic' : 'Metro North Specialty Pavilion',
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhone: patient.phone,
        patientAddress: patient.address,
        appointmentId: apt.id,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        items: [
          {
            id: `inv-itm-1`,
            description: `${doctor.title} Consultation & Clinical Assessment`,
            type: 'Consultation',
            quantity: 1,
            unitPrice: doctor.consultationFee,
            discount: 0,
            taxRate: 0,
            total: doctor.consultationFee,
          },
        ],
        subtotal: doctor.consultationFee,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal: doctor.consultationFee,
        paidAmount: 0,
        balanceAmount: doctor.consultationFee,
        status: 'Issued',
        createdAt: new Date().toISOString(),
        isDemo: false,
      };

      this._rawInvoices.unshift(invoice);

      // If lab tests requested, create lab order
      if (data.investigationsRequired && data.investigationsRequired.length > 0) {
        const labOrderCount = this._rawLabOrders.length + 1;
        const newLabOrder: LabOrder = {
          id: `lab-ord-${String(labOrderCount).padStart(3, '0')}`,
          orderNumber: `LAB-2026-${String(labOrderCount).padStart(3, '0')}`,
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctorId: doctor.id,
          doctorName: doctor.name,
          appointmentId: apt.id,
          date: new Date().toISOString().split('T')[0],
          tests: data.investigationsRequired.map((tName) => {
            const foundTest = this.labTests.find((lt) => lt.name.toLowerCase().includes(tName.toLowerCase()));
            return {
              testId: foundTest ? foundTest.id : 'lab-custom',
              testName: tName,
              category: foundTest ? foundTest.category : 'Biochemistry',
              normalRange: foundTest ? foundTest.normalRange : 'Standard Diagnostic Interval',
              units: foundTest ? foundTest.units : '',
              status: 'Ordered',
            };
          }),
          status: 'Ordered',
          totalCost: 110,
          isDemo: false,
        };
        this._rawLabOrders.unshift(newLabOrder);
      }

      // If follow-up requested, create follow-up record
      if (data.followUpDate) {
        this.followups.unshift({
          id: `flw-${Date.now()}`,
          patientId: patient.id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientPhone: patient.phone,
          type: 'Consultation Follow-up',
          date: data.followUpDate,
          assignedDoctorOrStaff: doctor.name,
          status: 'Pending',
          notes: `Post-consultation follow-up for ${data.diagnosis}`,
          createdAt: new Date().toISOString(),
        });
      }

      this.addAuditLog(
        'DOCTOR',
        'COMPLETED_CONSULTATION',
        'Consultations',
        'Consultation',
        consultation.id,
        `Doctor ${doctor.name} finalized consultation for ${patient.firstName} ${patient.lastName} (Dx: ${data.diagnosis})`
      );

      this.applyDemoFilter();
      this.saveToStorage();
      return { consultation, prescription, invoice };
    }

    this.applyDemoFilter();
    this.saveToStorage();
    return { consultation, prescription };
  }

  // --- Invoices & Payments API ---
  public payInvoice(invoiceId: string, paymentMethod: PaymentMethod, reference: string, collectedBy: string): { invoice: Invoice; payment: PaymentRecord } {
    const inv = this.invoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error('Invoice not found');

    const payCount = this.payments.length + 1;
    const recNumber = `REC-2026-${String(payCount).padStart(3, '0')}`;

    inv.paidAmount = inv.grandTotal;
    inv.balanceAmount = 0;
    inv.status = 'Paid';
    inv.paymentMethod = paymentMethod;
    inv.receiptNumber = recNumber;
    inv.transactionReference = reference || `TXN-${Date.now().toString().slice(-6)}`;

    // Update patient total spent
    const patient = this.getPatientById(inv.patientId);
    if (patient) {
      patient.totalSpent += inv.grandTotal;
    }

    // Update related appointment payment status
    if (inv.appointmentId) {
      const apt = this.appointments.find((a) => a.id === inv.appointmentId);
      if (apt) apt.paymentStatus = 'Paid';
    }

    const payment: PaymentRecord = {
      id: `pay-${String(payCount).padStart(3, '0')}`,
      receiptNumber: recNumber,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      patientId: inv.patientId,
      patientName: inv.patientName,
      amount: inv.grandTotal,
      paymentMethod,
      transactionReference: inv.transactionReference,
      date: new Date().toISOString(),
      collectedBy,
      notes: `Collected via ${paymentMethod}`,
    };

    this.payments.unshift(payment);
    this.addAuditLog('ACCOUNTANT', 'COLLECTED_PAYMENT', 'Billing', 'Payment', payment.id, `Collected $${inv.grandTotal} for invoice ${inv.invoiceNumber} via ${paymentMethod}`);
    this.saveToStorage();
    return { invoice: inv, payment };
  }

  // --- Lead Management API ---
  public updateLeadStatus(leadId: string, status: Lead['status']): Lead | undefined {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return undefined;
    lead.status = status;
    this.saveToStorage();
    return lead;
  }

  public addLead(leadData: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    this._rawLeads.unshift(newLead);
    this.applyDemoFilter();
    this.saveToStorage();
    return newLead;
  }

  public createInventoryItem(itemData: Omit<InventoryItem, 'id'>): InventoryItem {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-item-${Date.now()}`,
      isDemo: false,
    };
    this._rawInventory.unshift(newItem);
    this.applyDemoFilter();
    this.saveToStorage();
    return newItem;
  }

  public createConsultation(consultationData: any): Consultation {
    const res = this.saveConsultation({
      appointmentId: consultationData.appointmentId,
      patientId: consultationData.patientId,
      doctorId: consultationData.doctorId,
      chiefComplaint: consultationData.chiefComplaint || '',
      symptoms: consultationData.symptoms || [],
      vitals: consultationData.vitals,
      clinicalExamination: consultationData.clinicalExamination || consultationData.examinationNotes || '',
      diagnosis: consultationData.diagnosis,
      icdCode: consultationData.icdCode,
      investigationsRequired: consultationData.investigationsRequired || [],
      treatmentPlan: consultationData.treatmentPlan || '',
      doctorNotes: consultationData.doctorNotes || '',
      followUpDate: consultationData.followUpDate,
      prescriptionItems: consultationData.prescription?.items || [],
      advice: consultationData.advice || '',
      isComplete: consultationData.status === 'Completed',
    });
    return res.consultation;
  }

  public createPrescription(rxData: any): Prescription {
    const rxCount = this.prescriptions.length + 1;
    const newRx: Prescription = {
      id: `rx-2026-${String(rxCount).padStart(3, '0')}`,
      prescriptionNumber: `RX-2026-${String(rxCount).padStart(3, '0')}`,
      consultationId: rxData.consultationId,
      appointmentId: rxData.appointmentId,
      patientId: rxData.patientId,
      patientName: rxData.patientName,
      patientAge: rxData.patientAge || 35,
      patientGender: rxData.patientGender || 'Male',
      doctorId: rxData.doctorId,
      doctorName: rxData.doctorName || 'Dr. Sarah Jenkins',
      doctorQualification: rxData.doctorQualification || 'MD, DM (Cardiology)',
      doctorRegNumber: rxData.doctorRegNumber || 'MED-NY-84920',
      date: rxData.date || new Date().toISOString().split('T')[0],
      diagnosis: rxData.diagnosis || 'Clinical Prescription',
      items: rxData.items || [],
      advice: rxData.advice,
      followUpDate: rxData.followUpDate,
      status: rxData.status || 'Issued',
      doctorSignature: rxData.doctorSignature || 'Dr. Verified Signature',
      createdAt: new Date().toISOString(),
    };
    this.prescriptions.unshift(newRx);
    this.saveToStorage();
    return newRx;
  }

  public createLabOrder(labData: any): LabOrder {
    const labCount = this.labOrders.length + 1;
    const newLab: LabOrder = {
      id: `lab-ord-${String(labCount).padStart(3, '0')}`,
      orderNumber: `LAB-2026-${String(labCount).padStart(3, '0')}`,
      patientId: labData.patientId,
      patientName: labData.patientName,
      doctorId: labData.doctorId,
      doctorName: labData.doctorName,
      appointmentId: labData.appointmentId,
      date: labData.date || new Date().toISOString().split('T')[0],
      tests: labData.tests || [],
      status: labData.status || 'Ordered',
      totalCost: labData.totalCost || 85,
    };
    this.labOrders.unshift(newLab);
    this.saveToStorage();
    return newLab;
  }

  public getSystemStats() {
    const totalAppointments = this.appointments.length;
    const totalPatients = this.patients.length;
    const waitingInQueue = this.appointments.filter(a => a.status === 'Waiting' || a.status === 'Checked In').length;
    const completedToday = this.appointments.filter(a => a.status === 'Completed').length;
    const revenue = this.invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const totalRevenue = revenue;
    const pendingPayments = this.invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);
    const activeDoctors = this.doctors.filter(d => d.active).length;
    const lowStockItems = this.inventory.filter(i => (i.currentStock <= (i.minReorderLevel || i.minimumThreshold || 20))).length;
    const pendingLabs = this.labOrders.filter(l => l.status !== 'Completed' && l.status !== 'Delivered').length;
    const pendingLabOrders = pendingLabs;
    const activeLeads = this.leads.filter(l => l.status !== 'Converted' && l.status !== 'Lost').length;

    return {
      totalAppointments,
      totalPatients,
      waitingInQueue,
      completedToday,
      revenue,
      totalRevenue,
      pendingPayments,
      activeDoctors,
      lowStockItems,
      pendingLabs,
      pendingLabOrders,
      activeLeads
    };
  }

  // --- Duplicate Patient Detection ---
  public checkDuplicatePatient(phone: string, email: string, excludeId?: string): Patient | undefined {
    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    return this.patients.find((p) => {
      if (excludeId && p.id === excludeId) return false;
      const pPhone = p.phone.replace(/\D/g, '');
      const pEmail = p.email.trim().toLowerCase();
      if (cleanPhone && pPhone && cleanPhone === pPhone) return true;
      if (cleanEmail && pEmail && cleanEmail === pEmail) return true;
      return false;
    });
  }

  // --- Doctor Schedules & Leaves Management ---
  public updateDoctorSchedule(doctorId: string, schedules: DoctorSchedule[]): Doctor | undefined {
    const doc = this.doctors.find((d) => d.id === doctorId);
    if (!doc) return undefined;
    doc.schedules = schedules;
    this.addAuditLog('SUPER_ADMIN', 'UPDATED_DOCTOR_SCHEDULE', 'Settings', 'Doctor', doctorId, `Updated weekly schedule for ${doc.name}`);
    this.saveToStorage();
    return doc;
  }

  public getDoctorLeaves(doctorId?: string): DoctorLeave[] {
    if (!doctorId) return this.doctorLeaves;
    return this.doctorLeaves.filter((l) => l.doctorId === doctorId);
  }

  public addDoctorLeave(leaveData: Omit<DoctorLeave, 'id' | 'createdAt'>): DoctorLeave {
    const doctor = this.doctors.find((d) => d.id === leaveData.doctorId);
    const newLeave: DoctorLeave = {
      ...leaveData,
      id: `leave-${Date.now()}`,
      doctorName: doctor?.name || 'Dr. Assigned',
      createdAt: new Date().toISOString(),
    };
    this.doctorLeaves.unshift(newLeave);
    this.addAuditLog('SUPER_ADMIN', 'CREATED_DOCTOR_LEAVE', 'Settings', 'DoctorLeave', newLeave.id, `Created leave for ${doctor?.name} from ${newLeave.startDate} to ${newLeave.endDate}`);
    this.saveToStorage();
    return newLeave;
  }

  public deleteDoctorLeave(leaveId: string): boolean {
    const index = this.doctorLeaves.findIndex((l) => l.id === leaveId);
    if (index === -1) return false;
    this.doctorLeaves.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // --- Blocked Slots Management ---
  public getBlockedSlots(doctorId?: string, date?: string): BlockedSlot[] {
    return this.blockedSlots.filter((b) => {
      if (doctorId && b.doctorId !== doctorId) return false;
      if (date && b.date !== date) return false;
      return true;
    });
  }

  public addBlockedSlot(slotData: Omit<BlockedSlot, 'id' | 'createdAt'>): BlockedSlot {
    const newSlot: BlockedSlot = {
      ...slotData,
      id: `block-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.blockedSlots.unshift(newSlot);
    this.saveToStorage();
    return newSlot;
  }

  public deleteBlockedSlot(slotId: string): boolean {
    const index = this.blockedSlots.findIndex((b) => b.id === slotId);
    if (index === -1) return false;
    this.blockedSlots.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // --- Real Doctor Availability Slot Engine ---
  public getAvailableSlots(doctorId: string, date: string, durationMinutes = 20): string[] {
    const doc = this.doctors.find((d) => d.id === doctorId);
    if (!doc || !doc.active) return [];

    // Check if doctor is on approved leave on this date
    const onLeave = this.doctorLeaves.some((l) => {
      return l.doctorId === doctorId && l.status === 'Approved' && date >= l.startDate && date <= l.endDate;
    });
    if (onLeave) return [];

    // Find schedule for day of week
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 is Sunday
    const schedule = doc.schedules.find((s) => s.dayOfWeek === dayOfWeek && s.isAvailable);
    if (!schedule) return [];

    const slotDuration = schedule.slotDurationMinutes || durationMinutes || 20;

    // Helper: Parse time "HH:mm" to minutes
    const parseMins = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const formatMins = (m: number) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    const startMins = parseMins(schedule.startTime);
    const endMins = parseMins(schedule.endTime);

    // Breaks
    const breakStartMins = schedule.breakStart ? parseMins(schedule.breakStart) : -1;
    const breakEndMins = schedule.breakEnd ? parseMins(schedule.breakEnd) : -1;

    // Blocked slots for doctor on this date
    const docBlocked = this.getBlockedSlots(doctorId, date);

    // Existing active appointments for doctor on this date
    const bookedAppointments = this.appointments.filter(
      (a) => a.doctorId === doctorId && a.date === date && a.status !== 'Cancelled' && a.status !== 'No Show'
    );
    const bookedTimeSlots = new Set(bookedAppointments.map((a) => a.timeSlot));

    const availableSlots: string[] = [];

    for (let cur = startMins; cur + slotDuration <= endMins; cur += slotDuration) {
      const slotTimeStr = formatMins(cur);

      // Check if overlaps break
      if (breakStartMins !== -1 && breakEndMins !== -1) {
        if (cur < breakEndMins && cur + slotDuration > breakStartMins) {
          continue;
        }
      }

      // Check if overlaps blocked slot
      const isBlocked = docBlocked.some((b) => {
        const bStart = parseMins(b.startTime);
        const bEnd = parseMins(b.endTime);
        return cur < bEnd && cur + slotDuration > bStart;
      });
      if (isBlocked) continue;

      // Check if already booked
      if (bookedTimeSlots.has(slotTimeStr)) continue;

      availableSlots.push(slotTimeStr);
    }

    return availableSlots;
  }

  // --- Doctor CRUD ---
  public addDoctor(doctorData: Omit<Doctor, 'id'>): Doctor {
    const newDoc: Doctor = {
      ...doctorData,
      id: `doc-${String(this.doctors.length + 1).padStart(2, '0')}`,
      rating: 5.0,
      reviewCount: 1,
    };
    this.doctors.push(newDoc);
    this.addAuditLog('SUPER_ADMIN', 'CREATED_DOCTOR', 'Settings', 'Doctor', newDoc.id, `Created profile for ${newDoc.name} (${newDoc.specialtyName})`);
    this.saveToStorage();
    return newDoc;
  }

  public updateDoctor(doctorId: string, updates: Partial<Doctor>): Doctor | undefined {
    const doc = this.doctors.find((d) => d.id === doctorId);
    if (!doc) return undefined;
    Object.assign(doc, updates);
    this.addAuditLog('SUPER_ADMIN', 'UPDATED_DOCTOR', 'Settings', 'Doctor', doctorId, `Updated profile details for ${doc.name}`);
    this.saveToStorage();
    return doc;
  }

  public deleteDoctor(doctorId: string): boolean {
    const index = this.doctors.findIndex((d) => d.id === doctorId);
    if (index === -1) return false;
    this.doctors[index].active = false;
    this.saveToStorage();
    return true;
  }

  public hardDeleteDoctor(doctorId: string): boolean {
    const index = this.doctors.findIndex((d) => d.id === doctorId);
    if (index === -1) return false;
    this.doctors.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  public toggleDoctorStatus(doctorId: string): Doctor | undefined {
    const doc = this.doctors.find((d) => d.id === doctorId);
    if (!doc) return undefined;
    doc.active = !doc.active;
    this.saveToStorage();
    return doc;
  }

  // --- Specialties CRUD ---
  public addSpecialty(specData: Omit<Specialty, 'id'>): Specialty {
    const newSpec: Specialty = {
      ...specData,
      id: `spec-${Date.now()}`,
    };
    this.specialties.push(newSpec);
    this.saveToStorage();
    return newSpec;
  }

  public updateSpecialty(id: string, updates: Partial<Specialty>): Specialty | undefined {
    const spec = this.specialties.find((s) => s.id === id);
    if (!spec) return undefined;
    Object.assign(spec, updates);
    this.saveToStorage();
    return spec;
  }

  public deleteSpecialty(id: string): boolean {
    const spec = this.specialties.find((s) => s.id === id);
    if (!spec) return false;
    spec.active = false;
    this.saveToStorage();
    return true;
  }

  public hardDeleteSpecialty(id: string): boolean {
    const index = this.specialties.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.specialties.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  public toggleSpecialtyStatus(id: string): Specialty | undefined {
    const spec = this.specialties.find((s) => s.id === id);
    if (!spec) return undefined;
    spec.active = !spec.active;
    this.saveToStorage();
    return spec;
  }

  // --- Services CRUD ---
  public addServiceItem(serviceData: Omit<ServiceItem, 'id'>): ServiceItem {
    const newService: ServiceItem = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    this.services.push(newService);
    this.saveToStorage();
    return newService;
  }

  public updateServiceItem(id: string, updates: Partial<ServiceItem>): ServiceItem | undefined {
    const service = this.services.find((s) => s.id === id);
    if (!service) return undefined;
    Object.assign(service, updates);
    this.saveToStorage();
    return service;
  }

  public deleteServiceItem(id: string): boolean {
    const service = this.services.find((s) => s.id === id);
    if (!service) return false;
    service.active = false;
    this.saveToStorage();
    return true;
  }

  public hardDeleteServiceItem(id: string): boolean {
    const idx = this.services.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.services.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  // --- Health Packages CRUD ---
  public addHealthPackage(packageData: Omit<HealthPackage, 'id'>): HealthPackage {
    const newPkg: HealthPackage = {
      ...packageData,
      id: `pkg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.packages.push(newPkg);
    this.saveToStorage();
    return newPkg;
  }

  public updateHealthPackage(id: string, updates: Partial<HealthPackage>): HealthPackage | undefined {
    const pkg = this.packages.find((p) => p.id === id);
    if (!pkg) return undefined;
    Object.assign(pkg, { ...updates, updatedAt: new Date().toISOString() });
    this.saveToStorage();
    return pkg;
  }

  public deleteHealthPackage(id: string): boolean {
    const pkg = this.packages.find((p) => p.id === id);
    if (!pkg) return false;
    pkg.active = false;
    this.saveToStorage();
    return true;
  }

  public hardDeleteHealthPackage(id: string): boolean {
    const idx = this.packages.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.packages.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  // --- Prescription Templates ---
  public getPrescriptionTemplates(doctorId?: string): PrescriptionTemplate[] {
    if (!doctorId) return this.prescriptionTemplates;
    return this.prescriptionTemplates.filter((t) => !t.doctorId || t.doctorId === doctorId);
  }

  public addPrescriptionTemplate(tmplData: Omit<PrescriptionTemplate, 'id'>): PrescriptionTemplate {
    const newTmpl: PrescriptionTemplate = {
      ...tmplData,
      id: `tmpl-${Date.now()}`,
    };
    this.prescriptionTemplates.unshift(newTmpl);
    this.saveToStorage();
    return newTmpl;
  }

  public deletePrescriptionTemplate(id: string): boolean {
    const index = this.prescriptionTemplates.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.prescriptionTemplates.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // --- Medical Certificates ---
  public getMedicalCertificates(patientId?: string): MedicalCertificate[] {
    if (!patientId) return this.medicalCertificates;
    return this.medicalCertificates.filter((c) => c.patientId === patientId);
  }

  public createMedicalCertificate(data: Omit<MedicalCertificate, 'id' | 'certificateNumber' | 'createdAt'>): MedicalCertificate {
    const certCount = this.medicalCertificates.length + 1;
    const newCert: MedicalCertificate = {
      ...data,
      id: `cert-${Date.now()}`,
      certificateNumber: `MED-CERT-2026-${String(certCount).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    this.medicalCertificates.unshift(newCert);

    // Also add to patient documents
    this.documents.unshift({
      id: `doc-${Date.now()}`,
      patientId: newCert.patientId,
      title: `${newCert.type} (${newCert.certificateNumber})`,
      category: 'Medical Certificate',
      fileName: `${newCert.certificateNumber}.pdf`,
      fileSize: '185 KB',
      fileUrl: '#',
      uploadedBy: newCert.doctorName,
      uploadedAt: new Date().toISOString(),
      visibility: 'Patient Visible',
    });

    this.addAuditLog('DOCTOR', 'ISSUED_MEDICAL_CERTIFICATE', 'Consultations', 'MedicalCertificate', newCert.id, `Issued ${newCert.type} for ${newCert.patientName}`);
    this.saveToStorage();
    return newCert;
  }

  // --- Patient Documents & Scans ---
  public addPatientDocument(docData: Omit<PatientDocument, 'id' | 'uploadedAt'>): PatientDocument {
    const newDoc: PatientDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    this.documents.unshift(newDoc);
    this.saveToStorage();
    return newDoc;
  }

  public deletePatientDocument(docId: string): boolean {
    const index = this.documents.findIndex((d) => d.id === docId);
    if (index === -1) return false;
    this.documents.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // --- Comprehensive Patient Clinical Timeline Aggregator ---
  public getPatientClinicalTimeline(patientId: string) {
    const events: Array<{
      id: string;
      type: 'Consultation' | 'Vital' | 'Diagnosis' | 'Prescription' | 'Lab Order' | 'Document' | 'Appointment' | 'FollowUp' | 'Certificate';
      date: string;
      title: string;
      subtitle?: string;
      description?: string;
      badge?: string;
      badgeColor?: string;
      data?: any;
    }> = [];

    // Appointments
    const apts = this.appointments.filter((a) => a.patientId === patientId);
    apts.forEach((a) => {
      events.push({
        id: `evt-apt-${a.id}`,
        type: 'Appointment',
        date: a.date,
        title: `Appointment ${a.appointmentNumber} (${a.status})`,
        subtitle: `${a.doctorName} • ${a.doctorSpecialty}`,
        description: a.chiefComplaint || 'Clinical consultation visit',
        badge: a.status,
        badgeColor: a.status === 'Completed' ? 'emerald' : a.status === 'Cancelled' ? 'rose' : 'blue',
        data: a,
      });
    });

    // Consultations
    const cns = this.consultations.filter((c) => c.patientId === patientId);
    cns.forEach((c) => {
      events.push({
        id: `evt-cns-${c.id}`,
        type: 'Consultation',
        date: c.date,
        title: `Clinical Consultation Summary`,
        subtitle: `${c.doctorName} • ${c.diagnosis}`,
        description: `Chief Complaint: ${c.chiefComplaint}\nTreatment Plan: ${c.treatmentPlan || 'Standard care'}`,
        badge: c.status || 'Completed',
        badgeColor: 'teal',
        data: c,
      });
    });

    // Prescriptions
    const rxs = this.prescriptions.filter((r) => r.patientId === patientId);
    rxs.forEach((r) => {
      events.push({
        id: `evt-rx-${r.id}`,
        type: 'Prescription',
        date: r.date || r.createdAt.split('T')[0],
        title: `Digital Prescription ${r.prescriptionNumber}`,
        subtitle: `${r.doctorName} • ${r.items.length} Medicines Prescribed`,
        description: r.items.map((i) => `${i.medicineName} (${i.dosage}, ${i.frequency})`).join(' • '),
        badge: r.status || 'Issued',
        badgeColor: 'indigo',
        data: r,
      });
    });

    // Lab Orders
    const labs = this.labOrders.filter((l) => l.patientId === patientId);
    labs.forEach((l) => {
      events.push({
        id: `evt-lab-${l.id}`,
        type: 'Lab Order',
        date: l.date || new Date().toISOString().split('T')[0],
        title: `Diagnostic Lab Order ${l.orderNumber}`,
        subtitle: `${l.tests.map((t) => t.testName).join(', ')}`,
        description: `Status: ${l.status} • Doctor remarks: ${l.doctorRemarks || 'Results pending review'}`,
        badge: l.status || 'Ordered',
        badgeColor: l.status === 'Completed' ? 'emerald' : 'amber',
        data: l,
      });
    });

    // Certificates
    const certs = this.medicalCertificates.filter((c) => c.patientId === patientId);
    certs.forEach((c) => {
      events.push({
        id: `evt-cert-${c.id}`,
        type: 'Certificate',
        date: c.issuedDate,
        title: `${c.type} (${c.certificateNumber})`,
        subtitle: `Issued by ${c.doctorName}`,
        description: c.content,
        badge: c.status,
        badgeColor: 'violet',
        data: c,
      });
    });

    // Sort by date descending
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return events;
  }

  // ==========================================
  // --- PHASE 5: ADVANCED CRM & ENGAGEMENT API ---
  // ==========================================

  // --- Leads & Pipeline API ---
  public getLeads(filter?: { stage?: string; source?: string; priority?: string; query?: string }): Lead[] {
    return this.leads.filter((l) => {
      if (filter?.stage && filter.stage !== 'all' && l.stage !== filter.stage && l.status !== filter.stage) return false;
      if (filter?.source && filter.source !== 'all' && l.source !== filter.source) return false;
      if (filter?.priority && filter.priority !== 'all' && l.priority !== filter.priority) return false;
      if (filter?.query) {
        const q = filter.query.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.interestedService && l.interestedService.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  public getLeadById(id: string): Lead | undefined {
    return this.leads.find((l) => l.id === id);
  }

  public createLead(data: Omit<Lead, 'id' | 'createdAt'>): Lead {
    const nextId = `lead-${String(this.leads.length + 1).padStart(2, '0')}`;
    const newLead: Lead = {
      ...data,
      id: nextId,
      stage: data.stage || 'New',
      status: data.status || 'New',
      priority: data.priority || 'Normal',
      createdAt: new Date().toISOString(),
      stageHistory: [
        {
          id: `sh-${Date.now()}`,
          previousStage: 'New',
          newStage: data.stage || 'New',
          changedBy: data.assignedStaffName || 'Reception Desk',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    this.leads.unshift(newLead);
    this.addAuditLog('RECEPTIONIST', 'CREATED_LEAD', 'Patients', 'Lead', newLead.id, `Created prospective lead: ${newLead.name} (${newLead.phone}) from ${newLead.source}`);
    this.saveToStorage();
    return newLead;
  }

  public updateLead(id: string, updates: Partial<Lead>): Lead | undefined {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    this.leads[idx] = { ...this.leads[idx], ...updates };
    this.saveToStorage();
    return this.leads[idx];
  }

  public updateLeadStage(id: string, stage: LeadStage, changedBy: string, reason?: string): Lead | undefined {
    const lead = this.getLeadById(id);
    if (!lead) return undefined;

    const prevStage = lead.stage || lead.status;
    lead.stage = stage;
    lead.status = stage;
    if (!lead.stageHistory) lead.stageHistory = [];
    lead.stageHistory.push({
      id: `sh-${Date.now()}`,
      previousStage: prevStage,
      newStage: stage,
      changedBy,
      reason,
      timestamp: new Date().toISOString(),
    });

    this.addAuditLog('RECEPTIONIST', 'UPDATED_LEAD_STAGE', 'Patients', 'Lead', lead.id, `Moved lead ${lead.name} from "${prevStage}" to "${stage}"`);
    this.saveToStorage();
    return lead;
  }

  public convertLeadToPatient(leadId: string, existingPatientId?: string, newPatientData?: Partial<Patient>): Patient {
    const lead = this.getLeadById(leadId);
    if (!lead) throw new Error('Lead record not found');

    let patient: Patient;

    if (existingPatientId) {
      const found = this.getPatientById(existingPatientId);
      if (!found) throw new Error('Existing patient not found');
      patient = found;
    } else {
      // Create new patient record from lead info
      const nameParts = lead.name.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Patient';

      patient = this.createPatient({
        organizationId: 'org-01',
        branchId: lead.preferredBranchId || 'branch-01',
        firstName: newPatientData?.firstName || firstName,
        lastName: newPatientData?.lastName || lastName,
        dateOfBirth: newPatientData?.dateOfBirth || '1990-01-01',
        gender: (newPatientData?.gender || lead.gender || 'Male') as any,
        bloodGroup: newPatientData?.bloodGroup || 'O+',
        phone: lead.phone,
        email: lead.email || '',
        address: newPatientData?.address || '123 Health Ave',
        city: newPatientData?.city || 'Downtown District',
        emergencyContactName: newPatientData?.emergencyContactName || 'Primary Contact',
        emergencyContactPhone: newPatientData?.emergencyContactPhone || lead.phone,
        emergencyRelationship: newPatientData?.emergencyRelationship || 'Spouse',
        allergies: newPatientData?.allergies || [],
        medicalConditions: newPatientData?.medicalConditions || [],
        currentMedications: newPatientData?.currentMedications || [],
        category: 'New',
        source: lead.source,
        referralSource: lead.source === 'Referral' ? 'Patient Referral' : undefined,
        tags: ['Converted Lead'],
      });
    }

    // Mark lead as converted
    lead.stage = 'Converted';
    lead.status = 'Converted';
    lead.convertedPatientId = patient.id;
    lead.convertedAt = new Date().toISOString();
    lead.convertedBy = 'Front Desk Staff';
    if (!lead.stageHistory) lead.stageHistory = [];
    lead.stageHistory.push({
      id: `sh-${Date.now()}`,
      previousStage: lead.stage,
      newStage: 'Converted',
      changedBy: 'Front Desk Staff',
      reason: `Converted to registered patient ${patient.firstName} ${patient.lastName} (${patient.patientId})`,
      timestamp: new Date().toISOString(),
    });

    this.addAuditLog('RECEPTIONIST', 'CONVERTED_LEAD', 'Patients', 'Lead', lead.id, `Converted lead ${lead.name} to patient ${patient.patientId}`);
    this.saveToStorage();
    return patient;
  }

  public markLeadLost(leadId: string, reason: string, changedBy: string): Lead | undefined {
    const lead = this.getLeadById(leadId);
    if (!lead) return undefined;

    lead.stage = 'Lost';
    lead.status = 'Lost';
    lead.lostReason = reason;
    if (!lead.stageHistory) lead.stageHistory = [];
    lead.stageHistory.push({
      id: `sh-${Date.now()}`,
      previousStage: lead.stage,
      newStage: 'Lost',
      changedBy,
      reason: `Lost reason: ${reason}`,
      timestamp: new Date().toISOString(),
    });

    this.addAuditLog('RECEPTIONIST', 'MARKED_LEAD_LOST', 'Patients', 'Lead', lead.id, `Marked lead ${lead.name} as Lost (${reason})`);
    this.saveToStorage();
    return lead;
  }

  // --- CRM Activities API ---
  public getCrmActivities(filter?: { entityId?: string; entityType?: string; userId?: string }): CrmActivity[] {
    return this.crmActivities.filter((a) => {
      if (filter?.entityId && a.entityId !== filter.entityId) return false;
      if (filter?.entityType && a.entityType !== filter.entityType) return false;
      if (filter?.userId && a.userId !== filter.userId) return false;
      return true;
    });
  }

  public addCrmActivity(data: Omit<CrmActivity, 'id' | 'createdAt'>): CrmActivity {
    const newAct: CrmActivity = {
      ...data,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.crmActivities.unshift(newAct);
    this.saveToStorage();
    return newAct;
  }

  // --- CRM Tasks API ---
  public getCrmTasks(filter?: { status?: string; priority?: string; assignedUserId?: string; category?: string }): CrmTask[] {
    return this.crmTasks.filter((t) => {
      if (filter?.status && filter.status !== 'all' && t.status !== filter.status) return false;
      if (filter?.priority && filter.priority !== 'all' && t.priority !== filter.priority) return false;
      if (filter?.assignedUserId && filter.assignedUserId !== 'all' && t.assignedUserId !== filter.assignedUserId) return false;
      if (filter?.category && filter.category !== 'all' && t.category !== filter.category) return false;
      return true;
    });
  }

  public addCrmTask(data: Omit<CrmTask, 'id' | 'createdAt'>): CrmTask {
    const newTask: CrmTask = {
      ...data,
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.crmTasks.unshift(newTask);
    this.saveToStorage();
    return newTask;
  }

  public updateCrmTask(id: string, updates: Partial<CrmTask>): CrmTask | undefined {
    const idx = this.crmTasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.crmTasks[idx] = { ...this.crmTasks[idx], ...updates };
    this.saveToStorage();
    return this.crmTasks[idx];
  }

  public completeCrmTask(id: string, resolutionNotes?: string): CrmTask | undefined {
    const task = this.crmTasks.find((t) => t.id === id);
    if (!task) return undefined;
    task.status = 'Completed';
    task.completedAt = new Date().toISOString();
    if (resolutionNotes) {
      task.notes = `${task.notes || ''}\n[Resolved]: ${resolutionNotes}`.trim();
    }
    this.saveToStorage();
    return task;
  }

  // --- Patient Tags API ---
  public getPatientTags(): PatientTag[] {
    return this.patientTags;
  }

  public createPatientTag(data: Omit<PatientTag, 'id' | 'patientCount'>): PatientTag {
    const newTag: PatientTag = {
      ...data,
      id: `tag-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientCount: 0,
    };
    this.patientTags.push(newTag);
    this.saveToStorage();
    return newTag;
  }

  public updatePatientTag(id: string, updates: Partial<PatientTag>): PatientTag | undefined {
    const idx = this.patientTags.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.patientTags[idx] = { ...this.patientTags[idx], ...updates };
    this.saveToStorage();
    return this.patientTags[idx];
  }

  public deletePatientTag(id: string): boolean {
    const idx = this.patientTags.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.patientTags.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public assignTagToPatient(patientId: string, tagIdOrName: string): boolean {
    const patient = this.getPatientById(patientId);
    if (!patient) return false;
    if (!patient.tags) patient.tags = [];
    if (!patient.tags.includes(tagIdOrName)) {
      patient.tags.push(tagIdOrName);
      // update tag count
      const tag = this.patientTags.find((t) => t.id === tagIdOrName || t.name === tagIdOrName);
      if (tag) tag.patientCount = (tag.patientCount || 0) + 1;
      this.saveToStorage();
    }
    return true;
  }

  public removeTagFromPatient(patientId: string, tagIdOrName: string): boolean {
    const patient = this.getPatientById(patientId);
    if (!patient || !patient.tags) return false;
    patient.tags = patient.tags.filter((t) => t !== tagIdOrName);
    const tag = this.patientTags.find((t) => t.id === tagIdOrName || t.name === tagIdOrName);
    if (tag && tag.patientCount && tag.patientCount > 0) tag.patientCount--;
    this.saveToStorage();
    return true;
  }

  // --- Patient Segments API ---
  public getPatientSegments(): PatientSegment[] {
    return this.patientSegments;
  }

  public createPatientSegment(data: Omit<PatientSegment, 'id' | 'createdAt' | 'memberCount'>): PatientSegment {
    const newSeg: PatientSegment = {
      ...data,
      id: `seg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      memberCount: 0,
      createdAt: new Date().toISOString(),
    };
    newSeg.memberCount = this.evaluateSegmentPatients(newSeg).length;
    this.patientSegments.push(newSeg);
    this.saveToStorage();
    return newSeg;
  }

  public updatePatientSegment(id: string, updates: Partial<PatientSegment>): PatientSegment | undefined {
    const idx = this.patientSegments.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.patientSegments[idx] = { ...this.patientSegments[idx], ...updates };
    this.patientSegments[idx].memberCount = this.evaluateSegmentPatients(this.patientSegments[idx]).length;
    this.saveToStorage();
    return this.patientSegments[idx];
  }

  public deletePatientSegment(id: string): boolean {
    const idx = this.patientSegments.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.patientSegments.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public evaluateSegmentPatients(segment: PatientSegment): Patient[] {
    const now = new Date();
    return this.patients.filter((p) => {
      if (!segment.conditions || segment.conditions.length === 0) return true;

      const evalCondition = (c: any) => {
        if (c.field === 'lastVisitDays') {
          if (!p.lastVisitDate) return true; // Never visited or long ago
          const lastDate = new Date(p.lastVisitDate);
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          if (c.operator === 'greater_than') return diffDays > Number(c.value);
          if (c.operator === 'less_than') return diffDays < Number(c.value);
          return true;
        }

        if (c.field === 'totalRevenue' || c.field === 'totalSpent') {
          const spent = p.totalSpent || 0;
          if (c.operator === 'greater_than') return spent >= Number(c.value);
          if (c.operator === 'less_than') return spent < Number(c.value);
          return true;
        }

        if (c.field === 'outstandingBalance') {
          const patientInvoices = this.invoices.filter((i) => i.patientId === p.id && i.status !== 'Paid');
          const balance = patientInvoices.reduce((sum, i) => sum + (i.balanceAmount || 0), 0);
          if (c.operator === 'equals') return balance === Number(c.value);
          if (c.operator === 'greater_than') return balance > Number(c.value);
          return true;
        }

        if (c.field === 'hasPendingFollowup') {
          const flws = this.followups.filter((f) => f.patientId === p.id && f.status === 'Pending');
          return flws.length > 0;
        }

        if (c.field === 'hasTags') {
          return p.tags && p.tags.includes(String(c.value));
        }

        if (c.field === 'totalVisits') {
          const visits = p.totalVisits || 0;
          if (c.operator === 'greater_than') return visits >= Number(c.value);
          return visits === Number(c.value);
        }

        return true;
      };

      if (segment.conditionLogic === 'OR') {
        return segment.conditions.some(evalCondition);
      } else {
        return segment.conditions.every(evalCondition);
      }
    });
  }

  // --- Follow-ups API ---
  public getFollowUps(filter?: { status?: string; type?: string; doctorOrStaff?: string; date?: string; patientId?: string }): FollowUp[] {
    return this.followups.filter((f) => {
      if (filter?.status && filter.status !== 'all' && f.status !== filter.status) return false;
      if (filter?.type && filter.type !== 'all' && f.type !== filter.type) return false;
      if (filter?.doctorOrStaff && filter.doctorOrStaff !== 'all' && f.assignedDoctorOrStaff !== filter.doctorOrStaff) return false;
      if (filter?.date && f.date !== filter.date) return false;
      if (filter?.patientId && f.patientId !== filter.patientId) return false;
      return true;
    });
  }

  public addFollowUp(data: Omit<FollowUp, 'id' | 'createdAt'>): FollowUp {
    const newFlw: FollowUp = {
      ...data,
      id: `flw-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.followups.unshift(newFlw);
    this.saveToStorage();
    return newFlw;
  }

  public updateFollowUp(id: string, updates: Partial<FollowUp>): FollowUp | undefined {
    const idx = this.followups.findIndex((f) => f.id === id);
    if (idx === -1) return undefined;
    this.followups[idx] = { ...this.followups[idx], ...updates };
    this.saveToStorage();
    return this.followups[idx];
  }

  public completeFollowUp(id: string, notes?: string): FollowUp | undefined {
    const flw = this.followups.find((f) => f.id === id);
    if (!flw) return undefined;
    flw.status = 'Completed';
    if (notes) {
      flw.notes = `${flw.notes || ''}\n[Completed Notes]: ${notes}`.trim();
    }
    this.saveToStorage();
    return flw;
  }

  // --- Communication Templates API ---
  public getCommunicationTemplates(channel?: string): CommunicationTemplate[] {
    if (!channel || channel === 'all') return this.communicationTemplates;
    return this.communicationTemplates.filter((t) => t.channel === channel);
  }

  public getCommunicationTemplateById(id: string): CommunicationTemplate | undefined {
    return this.communicationTemplates.find((t) => t.id === id);
  }

  public createCommunicationTemplate(data: Omit<CommunicationTemplate, 'id' | 'createdAt'>): CommunicationTemplate {
    const newTmpl: CommunicationTemplate = {
      ...data,
      id: `tmpl-com-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.communicationTemplates.push(newTmpl);
    this.saveToStorage();
    return newTmpl;
  }

  public updateCommunicationTemplate(id: string, updates: Partial<CommunicationTemplate>): CommunicationTemplate | undefined {
    const idx = this.communicationTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    this.communicationTemplates[idx] = { ...this.communicationTemplates[idx], ...updates };
    this.saveToStorage();
    return this.communicationTemplates[idx];
  }

  public deleteCommunicationTemplate(id: string): boolean {
    const idx = this.communicationTemplates.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.communicationTemplates.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  // --- Communication Logs API ---
  public getCommunicationLogs(filter?: { channel?: string; patientId?: string; status?: string }): CommunicationLog[] {
    return this.communicationLogs.filter((l) => {
      if (filter?.channel && filter.channel !== 'all' && l.channel !== filter.channel) return false;
      if (filter?.patientId && l.patientId !== filter.patientId) return false;
      if (filter?.status && filter.status !== 'all' && l.status !== filter.status) return false;
      return true;
    });
  }

  public addCommunicationLog(log: CommunicationLog) {
    this.communicationLogs.unshift(log);
    if (this.communicationLogs.length > 500) {
      this.communicationLogs.pop();
    }
    this.saveToStorage();
  }

  // --- Campaigns API ---
  public getCampaigns(): Campaign[] {
    return this.campaigns;
  }

  public getCampaignById(id: string): Campaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }

  public createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'readCount' | 'failedCount' | 'appointmentsGenerated' | 'revenueGenerated'>): Campaign {
    const newCmp: Campaign = {
      ...data,
      id: `cmp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      appointmentsGenerated: 0,
      revenueGenerated: 0,
      createdAt: new Date().toISOString(),
    };
    this.campaigns.unshift(newCmp);
    this.saveToStorage();
    return newCmp;
  }

  public updateCampaign(id: string, updates: Partial<Campaign>): Campaign | undefined {
    const idx = this.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.campaigns[idx] = { ...this.campaigns[idx], ...updates };
    this.saveToStorage();
    return this.campaigns[idx];
  }

  public runCampaign(id: string): Campaign | undefined {
    const cmp = this.getCampaignById(id);
    if (!cmp) return undefined;

    const segment = this.patientSegments.find((s) => s.id === cmp.segmentId);
    const audience = segment ? this.evaluateSegmentPatients(segment) : this.patients.slice(0, 20);

    cmp.status = 'Completed';
    cmp.audienceCount = audience.length;
    cmp.sentCount = audience.length;
    cmp.deliveredCount = Math.max(0, Math.floor(audience.length * 0.94));
    cmp.readCount = Math.max(0, Math.floor(audience.length * 0.78));
    cmp.failedCount = audience.length - cmp.deliveredCount;
    cmp.appointmentsGenerated = Math.max(1, Math.floor(cmp.readCount * 0.3));
    cmp.revenueGenerated = cmp.appointmentsGenerated * 180;

    // Generate simulated communication logs
    audience.forEach((p) => {
      this.addCommunicationLog({
        id: `com-cmp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        patientId: p.id,
        patientName: `${p.firstName} ${p.lastName}`,
        recipient: p.phone || p.email,
        channel: cmp.channel === 'Multi-Channel' ? 'WhatsApp' : cmp.channel,
        templateName: cmp.name,
        eventTrigger: 'campaign.broadcast',
        subject: cmp.templateSubject,
        content: cmp.templateBody,
        status: 'Delivered',
        sentAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
      });
    });

    this.addAuditLog('CLINIC_ADMIN', 'EXECUTED_CAMPAIGN', 'Billing', 'Campaign', cmp.id, `Broadcast campaign "${cmp.name}" to ${audience.length} patients.`);
    this.saveToStorage();
    return cmp;
  }

  // --- Feedback & Service Recovery API ---
  public getFeedback(filter?: { doctorId?: string; branchId?: string; minRating?: number; maxRating?: number }): PatientFeedback[] {
    return this.patientFeedback.filter((fb) => {
      if (filter?.doctorId && filter.doctorId !== 'all' && fb.doctorId !== filter.doctorId) return false;
      if (filter?.branchId && filter.branchId !== 'all' && fb.branchId !== filter.branchId) return false;
      if (filter?.minRating && fb.rating < filter.minRating) return false;
      if (filter?.maxRating && fb.rating > filter.maxRating) return false;
      return true;
    });
  }

  public submitFeedback(data: Omit<PatientFeedback, 'id' | 'createdAt' | 'isResolved'>): PatientFeedback {
    const newFb: PatientFeedback = {
      ...data,
      id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isResolved: data.rating >= 4,
      createdAt: new Date().toISOString(),
    };

    // Auto-trigger service recovery if rating is low (<= 2)
    if (newFb.rating <= 2) {
      const task = this.addCrmTask({
        title: `Service Recovery: ${newFb.patientName} (${newFb.rating}★)`,
        category: 'Service Recovery',
        assignedUserId: 'usr-stf-02',
        assignedUserName: 'Jennifer Collins',
        assignedUserRole: 'CLINIC_ADMIN',
        patientId: newFb.patientId,
        patientName: newFb.patientName,
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Urgent',
        status: 'Pending',
        notes: `Patient submitted low rating for ${newFb.category}: "${newFb.comment}". Immediate outreach required.`,
      });

      const srvTask: ServiceRecoveryTask = {
        id: `srv-${Date.now()}`,
        feedbackId: newFb.id,
        patientId: newFb.patientId,
        patientName: newFb.patientName,
        patientPhone: newFb.patientPhone,
        rating: newFb.rating,
        issueSummary: newFb.comment,
        assignedStaffId: 'stf-02',
        assignedStaffName: 'Jennifer Collins',
        priority: 'Urgent',
        status: 'Open',
        slaDue: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.serviceRecoveryTasks.unshift(srvTask);
      newFb.serviceRecoveryTaskId = task.id;
    }

    this.patientFeedback.unshift(newFb);
    this.saveToStorage();
    return newFb;
  }

  public getServiceRecoveryTasks(status?: string): ServiceRecoveryTask[] {
    if (!status || status === 'all') return this.serviceRecoveryTasks;
    return this.serviceRecoveryTasks.filter((t) => t.status === status);
  }

  public resolveServiceRecoveryTask(id: string, resolutionNotes: string): ServiceRecoveryTask | undefined {
    const task = this.serviceRecoveryTasks.find((t) => t.id === id);
    if (!task) return undefined;
    task.status = 'Resolved';
    task.resolutionNotes = resolutionNotes;
    task.resolvedAt = new Date().toISOString();

    const fb = this.patientFeedback.find((f) => f.id === task.feedbackId);
    if (fb) fb.isResolved = true;

    this.saveToStorage();
    return task;
  }

  // --- Patient Referrals API ---
  public getReferrals(filter?: { status?: string; referringPatientId?: string }): PatientReferral[] {
    return this.patientReferrals.filter((r) => {
      if (filter?.status && filter.status !== 'all' && r.status !== filter.status) return false;
      if (filter?.referringPatientId && r.referringPatientId !== filter.referringPatientId) return false;
      return true;
    });
  }

  public createReferral(data: Omit<PatientReferral, 'id' | 'createdAt'>): PatientReferral {
    const newRef: PatientReferral = {
      ...data,
      id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.patientReferrals.unshift(newRef);
    this.saveToStorage();
    return newRef;
  }

  public updateReferralStatus(id: string, status: PatientReferral['status'], rewardStatus?: PatientReferral['rewardStatus'], rewardDescription?: string): PatientReferral | undefined {
    const ref = this.patientReferrals.find((r) => r.id === id);
    if (!ref) return undefined;
    ref.status = status;
    if (rewardStatus) ref.rewardStatus = rewardStatus;
    if (rewardDescription) ref.rewardDescription = rewardDescription;
    this.saveToStorage();
    return ref;
  }

  // --- Automation Rules API ---
  public getAutomationRules(): AutomationRule[] {
    return this.automationRules;
  }

  public createAutomationRule(data: Omit<AutomationRule, 'id' | 'createdAt' | 'triggerCount'>): AutomationRule {
    const newRule: AutomationRule = {
      ...data,
      id: `rule-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      triggerCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.automationRules.push(newRule);
    this.saveToStorage();
    return newRule;
  }

  public updateAutomationRule(id: string, updates: Partial<AutomationRule>): AutomationRule | undefined {
    const idx = this.automationRules.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.automationRules[idx] = { ...this.automationRules[idx], ...updates };
    this.saveToStorage();
    return this.automationRules[idx];
  }

  public deleteAutomationRule(id: string): boolean {
    const idx = this.automationRules.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.automationRules.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public getAutomationExecutions(): AutomationExecution[] {
    return this.automationExecutions;
  }

  public addAutomationExecution(execution: AutomationExecution) {
    this.automationExecutions.unshift(execution);
    if (this.automationExecutions.length > 200) {
      this.automationExecutions.pop();
    }
    this.saveToStorage();
  }

  // --- Patient Preferences API ---
  public getPatientPreferences(patientId: string): PatientCommunicationPreferences {
    if (!this.patientPreferences[patientId]) {
      this.patientPreferences[patientId] = {
        patientId,
        emailAllowed: true,
        smsAllowed: true,
        whatsappAllowed: true,
        pushAllowed: true,
        promotionalAllowed: true,
        appointmentRemindersAllowed: true,
        marketingAllowed: true,
        consents: [
          { type: 'Standard Care Communications', granted: true, grantedAt: new Date().toISOString(), source: 'System', version: 'v1.0' },
        ],
        updatedAt: new Date().toISOString(),
      };
    }
    return this.patientPreferences[patientId];
  }

  public updatePatientPreferences(patientId: string, updates: Partial<PatientCommunicationPreferences>): PatientCommunicationPreferences {
    const current = this.getPatientPreferences(patientId);
    this.patientPreferences[patientId] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage();
    return this.patientPreferences[patientId];
  }

  // --- CRM Analytics & Dashboard Metrics ---
  public getCrmDashboardMetrics() {
    const totalLeads = this.leads.length;
    const newLeads = this.leads.filter((l) => l.stage === 'New' || l.status === 'New').length;
    const convertedLeads = this.leads.filter((l) => l.stage === 'Converted' || l.status === 'Converted').length;
    const openLeads = totalLeads - convertedLeads - this.leads.filter((l) => l.stage === 'Lost' || l.status === 'Lost').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

    const pipelineValue = this.leads
      .filter((l) => l.stage !== 'Lost')
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    const pendingFollowups = this.followups.filter((f) => f.status === 'Pending').length;
    const overdueFollowups = this.followups.filter((f) => f.status === 'Pending' && new Date(f.date) < new Date()).length;

    const noShowApts = this.appointments.filter((a) => a.status === 'No Show').length;
    const noShowRecovered = this.followups.filter((f) => f.type === 'No-show Recovery' && f.status === 'Completed').length;
    const noShowRecoveryRate = noShowApts > 0 ? ((noShowRecovered / noShowApts) * 100).toFixed(1) : '68.5';

    const totalFeedback = this.patientFeedback.length;
    const avgRating = totalFeedback > 0 ? (this.patientFeedback.reduce((s, f) => s + f.rating, 0) / totalFeedback).toFixed(2) : '4.8';

    const totalCampaignRevenue = this.campaigns.reduce((sum, c) => sum + (c.revenueGenerated || 0), 0);
    const activeCampaigns = this.campaigns.filter((c) => c.status === 'Running' || c.status === 'Scheduled').length;

    return {
      totalLeads,
      newLeads,
      openLeads,
      convertedLeads,
      conversionRate: `${conversionRate}%`,
      pipelineValue,
      pendingFollowups,
      overdueFollowups,
      noShowRecoveryRate: `${noShowRecoveryRate}%`,
      avgRating,
      totalFeedback,
      totalCampaignRevenue,
      activeCampaigns,
    };
  }

  // --- Aliases for consistency ---
  public createDoctor(doctorData: Omit<Doctor, 'id'>): Doctor {
    return this.addDoctor(doctorData);
  }

  public createSpecialty(specialtyData: Omit<Specialty, 'id'>): Specialty {
    return this.addSpecialty(specialtyData);
  }

  public createService(serviceData: Omit<ServiceItem, 'id'>): ServiceItem {
    return this.addServiceItem(serviceData);
  }

  public updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | undefined {
    return this.updateServiceItem(id, updates);
  }

  public deleteService(id: string): boolean {
    return this.deleteServiceItem(id);
  }

  // --- Audit Logging Helper ---
  public addAuditLog(
    userRole: UserRole,
    action: string,
    module: AuditLog['module'],
    entity: string,
    entityId: string,
    details: string
  ) {
    const log: AuditLog = {
      id: `aud-${Date.now()}`,
      userId: `usr-${userRole.toLowerCase()}`,
      userName: userRole === 'DOCTOR' ? 'Dr. Sarah Jenkins, MD' : userRole === 'RECEPTIONIST' ? 'Rachel Gomez' : userRole === 'ACCOUNTANT' ? 'Daniel Weber, CPA' : 'Administrator',
      userRole,
      action,
      module,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.100',
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  // --- CRM Helper & Notification APIs ---
  public addNotification(notificationData: Omit<SystemNotification, 'id' | 'createdAt'> | SystemNotification): SystemNotification {
    const notification: SystemNotification = {
      ...notificationData,
      id: 'id' in notificationData && notificationData.id ? notificationData.id : `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: 'createdAt' in notificationData && notificationData.createdAt ? notificationData.createdAt : new Date().toISOString(),
      read: 'read' in notificationData ? notificationData.read : false,
    };
    this.notifications.unshift(notification);
    if (this.notifications.length > 200) {
      this.notifications.pop();
    }
    this.saveToStorage();
    return notification;
  }

  public getNotifications(targetRole?: UserRole | 'ALL'): SystemNotification[] {
    if (!targetRole || targetRole === 'ALL') {
      return this.notifications;
    }
    return this.notifications.filter((n) => !n.targetRole || n.targetRole === 'ALL' || n.targetRole === targetRole);
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    this.saveToStorage();
    return true;
  }

  public markAllNotificationsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.saveToStorage();
  }

  public clearAllNotifications(): void {
    this.notifications = [];
    this.saveToStorage();
  }

  public logCrmActivity(activityData: Omit<CrmActivity, 'id' | 'createdAt'> | CrmActivity): CrmActivity {
    const activity: CrmActivity = {
      ...activityData,
      id: 'id' in activityData && activityData.id ? activityData.id : `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: 'createdAt' in activityData && activityData.createdAt ? activityData.createdAt : new Date().toISOString(),
    };
    this.crmActivities.unshift(activity);
    if (this.crmActivities.length > 300) {
      this.crmActivities.pop();
    }
    this.saveToStorage();
    return activity;
  }

  public addPatientTagToPatient(patientId: string, tag: string): boolean {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient) return false;
    if (!patient.tags) patient.tags = [];
    if (!patient.tags.includes(tag)) {
      patient.tags.push(tag);
      this.saveToStorage();
    }
    return true;
  }

  public removePatientTagFromPatient(patientId: string, tag: string): boolean {
    const patient = this.patients.find((p) => p.id === patientId);
    if (!patient || !patient.tags) return false;
    patient.tags = patient.tags.filter((t) => t !== tag);
    this.saveToStorage();
    return true;
  }

  public issueReferralReward(referralId: string, rewardAmount?: number): PatientReferral | undefined {
    const ref = this.patientReferrals.find((r) => r.id === referralId);
    if (!ref) return undefined;
    ref.status = 'Converted';
    ref.rewardStatus = 'Rewarded';
    if (rewardAmount) {
      ref.rewardDescription = `$${rewardAmount} credit disbursed to patient account`;
    }
    this.addAuditLog('CLINIC_ADMIN', 'REWARDED_REFERRAL', 'CRM', 'Referral', ref.id, `Issued reward for patient referral: ${ref.newPatientName}`);
    this.saveToStorage();
    return ref;
  }

  // ============================================================
  // PHASE 7: HR, ATTENDANCE, PAYROLL, ROLES & SAAS APIS
  // ============================================================

  // --- Departments API ---
  public getDepartments(branchId?: string): Department[] {
    if (branchId && branchId !== 'all') {
      return this.departments.filter((d) => d.branchId === branchId);
    }
    return this.departments;
  }

  public getDepartmentById(id: string): Department | undefined {
    return this.departments.find((d) => d.id === id);
  }

  public addDepartment(data: Omit<Department, 'id' | 'createdAt'>): Department {
    const dept: Department = {
      ...data,
      id: `dept-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.departments.push(dept);
    this.addAuditLog('CLINIC_ADMIN', 'CREATED_DEPARTMENT', 'Settings', 'Department', dept.id, `Created department ${dept.name}`);
    this.saveToStorage();
    return dept;
  }

  public updateDepartment(id: string, updates: Partial<Department>): Department | undefined {
    const idx = this.departments.findIndex((d) => d.id === id);
    if (idx === -1) return undefined;
    this.departments[idx] = { ...this.departments[idx], ...updates };
    this.saveToStorage();
    return this.departments[idx];
  }

  public deleteDepartment(id: string): boolean {
    const idx = this.departments.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.departments.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public toggleDepartmentStatus(id: string): Department | undefined {
    const dept = this.departments.find((d) => d.id === id);
    if (!dept) return undefined;
    dept.status = dept.status === 'Active' ? 'Inactive' : 'Active';
    this.saveToStorage();
    return dept;
  }

  // --- Employees API ---
  public getEmployees(filter?: { departmentId?: string; branchId?: string; role?: string; query?: string; search?: string; status?: string }): EmployeeProfile[] {
    return this.employees.filter((emp) => {
      if (filter?.departmentId && filter.departmentId !== 'all' && emp.departmentId !== filter.departmentId) return false;
      if (filter?.branchId && filter.branchId !== 'all' && emp.branchId !== filter.branchId) return false;
      if (filter?.role && filter.role !== 'all' && emp.role !== filter.role) return false;
      if (filter?.status && filter.status !== 'all' && emp.status !== filter.status) return false;
      const searchTerm = filter?.query || filter?.search;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          emp.name.toLowerCase().includes(q) ||
          emp.employeeId.toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.phone.includes(q) ||
          (emp.departmentName && emp.departmentName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  public getEmployeeById(id: string): EmployeeProfile | undefined {
    return this.employees.find((e) => e.id === id || e.employeeId === id);
  }

  public addEmployee(data: Omit<EmployeeProfile, 'id' | 'createdAt'>): EmployeeProfile {
    const newEmp: EmployeeProfile = {
      ...data,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.employees.unshift(newEmp);
    this.addAuditLog('CLINIC_ADMIN', 'ADDED_EMPLOYEE', 'Settings', 'Employee', newEmp.id, `Added employee profile: ${newEmp.name}`);
    this.saveToStorage();
    return newEmp;
  }

  public updateEmployee(id: string, updates: Partial<EmployeeProfile>): EmployeeProfile | undefined {
    const idx = this.employees.findIndex((e) => e.id === id || e.employeeId === id);
    if (idx === -1) return undefined;
    const oldRole = this.employees[idx].role;
    this.employees[idx] = { ...this.employees[idx], ...updates };
    if (updates.role && updates.role !== oldRole) {
      this.addAuditLog('SUPER_ADMIN', 'ASSIGNED_EMPLOYEE_ROLE', 'Settings', 'Employee', id, `Changed employee ${this.employees[idx].name} role from ${oldRole} to ${updates.role}`);
    } else {
      this.addAuditLog('SUPER_ADMIN', 'UPDATED_EMPLOYEE', 'Settings', 'Employee', id, `Updated employee record for ${this.employees[idx].name}`);
    }
    this.saveToStorage();
    return this.employees[idx];
  }

  public deleteEmployee(id: string): boolean {
    const emp = this.employees.find((e) => e.id === id || e.employeeId === id);
    if (!emp) return false;
    // Critical Security Rule: Super Admin account cannot be deleted or altered
    if (emp.role === 'SUPER_ADMIN' || emp.email === 'admin@mediera.com' || emp.id === 'usr-admin-01') {
      return false;
    }
    const idx = this.employees.findIndex((e) => e.id === id || e.employeeId === id);
    if (idx === -1) return false;
    this.employees.splice(idx, 1);
    this.addAuditLog('SUPER_ADMIN', 'DELETED_EMPLOYEE', 'Settings', 'Employee', id, `Deleted employee profile for ${emp.name}`);
    this.saveToStorage();
    return true;
  }

  public toggleEmployeeStatus(id: string): EmployeeProfile | undefined {
    const emp = this.getEmployeeById(id);
    if (!emp) return undefined;
    if (emp.role === 'SUPER_ADMIN' || emp.email === 'admin@mediera.com') {
      return emp; // Protected Super Admin cannot be deactivated
    }
    emp.status = emp.status === 'Active' ? 'Inactive' : 'Active';
    this.addAuditLog('SUPER_ADMIN', 'UPDATED_EMPLOYEE_STATUS', 'Settings', 'Employee', id, `Updated status to ${emp.status} for ${emp.name}`);
    this.saveToStorage();
    return emp;
  }

  // --- Employee Documents API ---
  public getEmployeeDocuments(employeeId?: string): EmployeeDocument[] {
    if (employeeId) {
      return this.employeeDocuments.filter((d) => d.employeeId === employeeId);
    }
    return this.employeeDocuments;
  }

  public addEmployeeDocument(data: Omit<EmployeeDocument, 'id' | 'uploadedAt'>): EmployeeDocument {
    const doc: EmployeeDocument = {
      ...data,
      id: `doc-emp-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    this.employeeDocuments.unshift(doc);
    this.saveToStorage();
    return doc;
  }

  public deleteEmployeeDocument(id: string): boolean {
    const idx = this.employeeDocuments.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.employeeDocuments.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  // --- Shifts & Attendance API ---
  public getEmployeeShifts(branchId?: string): EmployeeShift[] {
    if (branchId && branchId !== 'all') {
      return this.employeeShifts.filter((s) => s.branchId === branchId);
    }
    return this.employeeShifts;
  }

  public addEmployeeShift(data: Omit<EmployeeShift, 'id'>): EmployeeShift {
    const shift: EmployeeShift = {
      ...data,
      id: `shift-${Date.now()}`,
    };
    this.employeeShifts.push(shift);
    this.saveToStorage();
    return shift;
  }

  public updateEmployeeShift(id: string, updates: Partial<EmployeeShift>): EmployeeShift | undefined {
    const idx = this.employeeShifts.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.employeeShifts[idx] = { ...this.employeeShifts[idx], ...updates };
    this.saveToStorage();
    return this.employeeShifts[idx];
  }

  public deleteEmployeeShift(id: string): boolean {
    const idx = this.employeeShifts.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.employeeShifts.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public getAttendanceRecords(filter?: { employeeId?: string; branchId?: string; date?: string }): AttendanceRecord[] {
    return this.attendanceRecords.filter((rec) => {
      if (filter?.employeeId && rec.employeeId !== filter.employeeId) return false;
      if (filter?.branchId && filter.branchId !== 'all' && rec.branchId !== filter.branchId) return false;
      if (filter?.date && rec.date !== filter.date) return false;
      return true;
    });
  }

  public markClockIn(employeeId: string, notes?: string): AttendanceRecord {
    const emp = this.getEmployeeById(employeeId);
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    let record = this.attendanceRecords.find((r) => r.employeeId === employeeId && r.date === today);
    if (record) {
      record.clockIn = nowTime;
      record.status = 'Present';
      if (notes) record.notes = notes;
    } else {
      record = {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName: emp ? emp.name : 'Employee',
        departmentName: emp ? emp.departmentName : 'General',
        branchId: emp ? emp.branchId : 'branch-01',
        date: today,
        clockIn: nowTime,
        status: 'Present',
        notes,
      };
      this.attendanceRecords.unshift(record);
    }
    this.saveToStorage();
    return record;
  }

  public markClockOut(employeeId: string, notes?: string): AttendanceRecord | undefined {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    const record = this.attendanceRecords.find((r) => r.employeeId === employeeId && r.date === today);
    if (!record) return undefined;

    record.clockOut = nowTime;
    if (record.clockIn) {
      const [inH, inM] = record.clockIn.split(':').map(Number);
      const [outH, outM] = nowTime.split(':').map(Number);
      record.workedDurationMinutes = Math.max(0, (outH * 60 + outM) - (inH * 60 + inM));
    }
    if (notes) record.notes = (record.notes ? `${record.notes} | ` : '') + notes;
    this.saveToStorage();
    return record;
  }

  public updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | undefined {
    const idx = this.attendanceRecords.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.attendanceRecords[idx] = { ...this.attendanceRecords[idx], ...updates };
    this.saveToStorage();
    return this.attendanceRecords[idx];
  }

  // --- Leave Management API ---
  public getLeaveTypes(): LeaveType[] {
    return this.leaveTypes;
  }

  public getLeaveBalances(employeeId?: string): LeaveBalance[] {
    if (employeeId) {
      return this.leaveBalances.filter((b) => b.employeeId === employeeId);
    }
    return this.leaveBalances;
  }

  public getLeaveRequests(filter?: { employeeId?: string; status?: string }): LeaveRequest[] {
    return this.leaveRequests.filter((req) => {
      if (filter?.employeeId && req.employeeId !== filter.employeeId) return false;
      if (filter?.status && filter.status !== 'all' && req.status !== filter.status) return false;
      return true;
    });
  }

  public submitLeaveRequest(data: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>): LeaveRequest {
    const newReq: LeaveRequest = {
      ...data,
      id: `lr-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    this.leaveRequests.unshift(newReq);
    this.saveToStorage();
    return newReq;
  }

  public reviewLeaveRequest(id: string, status: LeaveRequest['status'], reviewerNotes?: string, reviewedBy: string = 'Administrator'): LeaveRequest | undefined {
    const req = this.leaveRequests.find((r) => r.id === id);
    if (!req) return undefined;
    req.status = status;
    req.reviewNotes = reviewerNotes;
    req.reviewedBy = reviewedBy;
    req.reviewedAt = new Date().toISOString();

    if (status === 'Approved') {
      const balance = this.leaveBalances.find((b) => b.employeeId === req.employeeId && b.leaveTypeId === req.leaveTypeId);
      if (balance) {
        balance.usedDays += req.totalDays;
        balance.remainingDays = Math.max(0, balance.totalDays - balance.usedDays);
      }
    }
    this.addAuditLog('CLINIC_ADMIN', 'REVIEWED_LEAVE_REQUEST', 'Settings', 'LeaveRequest', req.id, `Set status to ${status} for ${req.employeeName}`);
    this.saveToStorage();
    return req;
  }

  // --- Payroll & Compensation API ---
  public getEmployeeCompensations(employeeId?: string): EmployeeCompensation[] {
    if (employeeId) {
      return this.employeeCompensations.filter((c) => c.employeeId === employeeId);
    }
    return this.employeeCompensations;
  }

  public saveEmployeeCompensation(data: Omit<EmployeeCompensation, 'id'> & { id?: string }): EmployeeCompensation {
    if (data.id) {
      const idx = this.employeeCompensations.findIndex((c) => c.id === data.id);
      if (idx !== -1) {
        this.employeeCompensations[idx] = { ...this.employeeCompensations[idx], ...data } as EmployeeCompensation;
        this.saveToStorage();
        return this.employeeCompensations[idx];
      }
    }
    const newComp: EmployeeCompensation = {
      ...data,
      id: data.id || `comp-${Date.now()}`,
    };
    this.employeeCompensations.push(newComp);
    this.saveToStorage();
    return newComp;
  }

  // --- Roles & Security API ---
  public getRoles(): RoleDefinition[] {
    return this.roles;
  }

  public updateRolePermissions(roleId: string, permissions: string[]): RoleDefinition | undefined {
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) return undefined;
    role.permissions = permissions;
    this.addAuditLog('CLINIC_ADMIN', 'UPDATED_ROLE_PERMISSIONS', 'Settings', 'Role', role.id, `Updated permissions for ${role.name}`);
    this.saveToStorage();
    return role;
  }

  public getUserSessions(): UserSession[] {
    return this.userSessions;
  }

  public revokeUserSession(id: string): boolean {
    const idx = this.userSessions.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    const session = this.userSessions[idx];
    this.userSessions.splice(idx, 1);
    this.logSecurityEvent({
      type: 'SESSION_REVOKED',
      userId: session.userId,
      userName: session.userName,
      details: `Revoked session from ${session.device} (${session.ipAddress})`,
      ipAddress: session.ipAddress,
    });
    this.saveToStorage();
    return true;
  }

  public revokeAllOtherSessions(currentSessionId: string): void {
    this.userSessions = this.userSessions.filter((s) => s.id === currentSessionId);
    this.saveToStorage();
  }

  public getLoginHistory(): LoginHistoryRecord[] {
    return this.loginHistory;
  }

  public recordLoginAttempt(record: Omit<LoginHistoryRecord, 'id' | 'timestamp'>): LoginHistoryRecord {
    const entry: LoginHistoryRecord = {
      ...record,
      id: `lh-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.loginHistory.unshift(entry);
    if (this.loginHistory.length > 200) {
      this.loginHistory.pop();
    }
    this.saveToStorage();
    return entry;
  }

  public getSecurityEvents(): SecurityEvent[] {
    return this.securityEvents;
  }

  public logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
    const secEvent: SecurityEvent = {
      ...event,
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.securityEvents.unshift(secEvent);
    if (this.securityEvents.length > 200) {
      this.securityEvents.pop();
    }
    this.saveToStorage();
    return secEvent;
  }

  // --- Backups & Data Exports API ---
  public getBackupJobs(): BackupJob[] {
    return this.backupJobs;
  }

  public triggerManualBackup(provider: 'GCS Cloud' | 'Local Storage' = 'GCS Cloud'): BackupJob {
    const job: BackupJob = {
      id: `bck-${Date.now()}`,
      provider,
      schedule: 'Manual',
      retentionDays: 30,
      encryptionEnabled: true,
      status: 'Completed',
      sizeBytes: 85400000 + Math.floor(Math.random() * 5000000),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
    this.backupJobs.unshift(job);
    this.addAuditLog('CLINIC_ADMIN', 'MANUAL_BACKUP', 'Settings', 'Backup', job.id, `Triggered snapshot backup via ${provider}`);
    this.saveToStorage();
    return job;
  }

  public getExportJobs(): ExportJob[] {
    return this.exportJobs;
  }

  public triggerDataExport(type: ExportJob['type'], requestedBy: string = 'Clinic Administrator', format: ExportJob['format'] = 'CSV'): ExportJob {
    const job: ExportJob = {
      id: `exp-${Date.now()}`,
      type,
      status: 'Completed',
      requestedBy,
      format,
      rowCount: type === 'Patients' ? this.patients.length : type === 'Billing' ? this.invoices.length : this.appointments.length,
      downloadUrl: '#',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.exportJobs.unshift(job);
    this.addAuditLog('CLINIC_ADMIN', 'EXPORTED_DATA', 'Settings', 'ExportJob', job.id, `Exported ${type} data in ${format} format`);
    this.saveToStorage();
    return job;
  }

  // --- Integrations & Developer Webhooks API ---
  public getIntegrations(): IntegrationConfig[] {
    return this.integrations;
  }

  public updateIntegration(id: string, updates: Partial<IntegrationConfig>): IntegrationConfig | undefined {
    const idx = this.integrations.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.integrations[idx] = { ...this.integrations[idx], ...updates };
    this.saveToStorage();
    return this.integrations[idx];
  }

  public testIntegrationConnection(id: string): { success: boolean; latencyMs: number; message: string } {
    const integration = this.integrations.find((i) => i.id === id);
    if (!integration) return { success: false, latencyMs: 0, message: 'Integration not found' };
    integration.lastTestedAt = new Date().toISOString();
    integration.isConnected = true;
    this.saveToStorage();
    return { success: true, latencyMs: 38 + Math.floor(Math.random() * 40), message: `${integration.name} handshake acknowledged (200 OK)` };
  }

  public getApiKeys(): ApiKeyRecord[] {
    return this.apiKeys;
  }

  public createApiKey(name: string, scope: string[], createdBy: string = 'Clinic Administrator'): ApiKeyRecord {
    const key: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name,
      keyMasked: `nova_live_${Math.random().toString(36).substring(2, 6)}••••••••••••••${Math.random().toString(36).substring(2, 6)}`,
      scope,
      createdBy,
      createdAt: new Date().toISOString(),
      status: 'Active',
    };
    this.apiKeys.unshift(key);
    this.addAuditLog('CLINIC_ADMIN', 'CREATED_API_KEY', 'Settings', 'ApiKey', key.id, `Generated API key: ${name}`);
    this.saveToStorage();
    return key;
  }

  public revokeApiKey(id: string): boolean {
    const key = this.apiKeys.find((k) => k.id === id);
    if (!key) return false;
    key.status = 'Revoked';
    this.saveToStorage();
    return true;
  }

  public getWebhooks(): WebhookRecord[] {
    return this.webhooks;
  }

  public createWebhook(data: Omit<WebhookRecord, 'id' | 'successCount' | 'failureCount'>): WebhookRecord {
    const wh: WebhookRecord = {
      ...data,
      id: `wh-${Date.now()}`,
      successCount: 0,
      failureCount: 0,
    };
    this.webhooks.push(wh);
    this.saveToStorage();
    return wh;
  }

  public updateWebhook(id: string, updates: Partial<WebhookRecord>): WebhookRecord | undefined {
    const idx = this.webhooks.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    this.webhooks[idx] = { ...this.webhooks[idx], ...updates };
    this.saveToStorage();
    return this.webhooks[idx];
  }

  public deleteWebhook(id: string): boolean {
    const idx = this.webhooks.findIndex((w) => w.id === id);
    if (idx === -1) return false;
    this.webhooks.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  // --- Feature Flags & SaaS Subscription API ---
  public getFeatureFlags(): FeatureFlag[] {
    return this.featureFlags;
  }

  public toggleFeatureFlag(id: string, enabled?: boolean): FeatureFlag | undefined {
    const flag = this.featureFlags.find((f) => f.id === id || f.key === id);
    if (!flag) return undefined;
    flag.isGlobalEnabled = enabled !== undefined ? enabled : !flag.isGlobalEnabled;
    this.saveToStorage();
    return flag;
  }

  public getSaaSPlans(): SaaSPlan[] {
    return this.saasPlans;
  }

  public getSubscription(): OrganizationSubscription {
    return this.organizationSubscriptions[0] || INITIAL_SUBSCRIPTIONS[0];
  }

  public updateSubscription(planId: string): OrganizationSubscription {
    const plan = this.saasPlans.find((p) => p.id === planId) || this.saasPlans[2];
    const sub: OrganizationSubscription = {
      id: `sub-${Date.now()}`,
      organizationId: 'org-01',
      planId: plan.id,
      planName: plan.name,
      status: 'Active',
      startDate: new Date().toISOString(),
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      autoRenew: true,
    };
    this.organizationSubscriptions = [sub];
    this.saveToStorage();
    return sub;
  }

  public getUsageMetrics(): UsageMetricRecord[] {
    return [
      { organizationId: 'org-01', metric: 'branches', currentUsage: this.branches.length, planLimit: 10 },
      { organizationId: 'org-01', metric: 'doctors', currentUsage: this.doctors.length, planLimit: 50 },
      { organizationId: 'org-01', metric: 'users', currentUsage: this.employees.length, planLimit: 100 },
      { organizationId: 'org-01', metric: 'patients', currentUsage: this.patients.length, planLimit: 50000 },
      { organizationId: 'org-01', metric: 'appointments_this_month', currentUsage: this.appointments.length, planLimit: 15000 },
      { organizationId: 'org-01', metric: 'storage_gb', currentUsage: 4.8, planLimit: 500 },
      { organizationId: 'org-01', metric: 'campaigns', currentUsage: this.campaigns.length, planLimit: 50 },
    ];
  }

  public getAnnouncements(): SystemAnnouncement[] {
    return this.announcements;
  }

  public createAnnouncement(data: Omit<SystemAnnouncement, 'id'>): SystemAnnouncement {
    const ann: SystemAnnouncement = {
      ...data,
      id: `ann-${Date.now()}`,
    };
    this.announcements.unshift(ann);
    this.saveToStorage();
    return ann;
  }

  public dismissAnnouncement(id: string): void {
    const ann = this.announcements.find((a) => a.id === id);
    if (ann) {
      ann.status = 'Archived';
      this.saveToStorage();
    }
  }

  // ============================================================
  // PHASE 8: TELEMEDICINE, INSURANCE/TPA & CLINICAL SAFETY APIS
  // ============================================================

  // --- Telemedicine API ---
  public getTelemedicineRooms(): TelemedicineRoom[] {
    return this.telemedicineRooms;
  }

  public getTelemedicineRoomById(id: string): TelemedicineRoom | undefined {
    return this.telemedicineRooms.find((r) => r.id === id || r.roomId === id);
  }

  public getTelemedicineRoomByAppointment(appointmentId: string): TelemedicineRoom | undefined {
    return this.telemedicineRooms.find((r) => r.appointmentId === appointmentId);
  }

  public createTelemedicineRoom(appointmentId: string): TelemedicineRoom {
    const existing = this.getTelemedicineRoomByAppointment(appointmentId);
    if (existing) return existing;

    const apt = this.appointments.find((a) => a.id === appointmentId);
    const room: TelemedicineRoom = {
      id: `tel-${Date.now()}`,
      appointmentId,
      appointmentNumber: apt?.appointmentNumber || `APT-${appointmentId}`,
      patientId: apt?.patientId || 'pat-01',
      patientName: apt?.patientName || 'Patient',
      doctorId: apt?.doctorId || 'doc-01',
      doctorName: apt?.doctorName || 'Doctor',
      doctorSpecialty: apt?.doctorSpecialty || 'General Practice',
      scheduledStartTime: apt?.date ? `${apt.date}T${apt.timeSlot}:00Z` : new Date().toISOString(),
      status: 'Scheduled',
      roomId: `nova-room-${Math.floor(10000 + Math.random() * 90000)}`,
      roomTokenDoctor: `tok-doc-${Math.floor(100000 + Math.random() * 900000)}`,
      roomTokenPatient: `tok-pat-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    this.telemedicineRooms.unshift(room);
    this.saveToStorage();
    return room;
  }

  public updateTelemedicineRoomStatus(id: string, status: TelemedicineRoom['status']): TelemedicineRoom | undefined {
    const room = this.getTelemedicineRoomById(id);
    if (!room) return undefined;
    room.status = status;
    if (status === 'In Progress' && !room.startedAt) {
      room.startedAt = new Date().toISOString();
    } else if (status === 'Completed' && !room.endedAt) {
      room.endedAt = new Date().toISOString();
      if (room.startedAt) {
        const diffMs = new Date(room.endedAt).getTime() - new Date(room.startedAt).getTime();
        room.durationMinutes = Math.max(1, Math.round(diffMs / 60000));
      }
    }
    this.saveToStorage();
    return room;
  }

  public getTelemedicineMessages(roomId: string): TelemedicineMessage[] {
    return this.telemedicineMessages.filter((m) => m.roomId === roomId);
  }

  public sendTelemedicineMessage(data: Omit<TelemedicineMessage, 'id' | 'timestamp'>): TelemedicineMessage {
    const msg: TelemedicineMessage = {
      ...data,
      id: `tm-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.telemedicineMessages.push(msg);
    this.saveToStorage();
    return msg;
  }

  public logTelemedicineEvent(event: Omit<TelemedicineEvent, 'id' | 'timestamp'>): TelemedicineEvent {
    const telEvent: TelemedicineEvent = {
      ...event,
      id: `tevt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.addAuditLog('DOCTOR', 'TELEMEDICINE_EVENT', 'Consultations', 'TelemedicineRoom', event.roomId, `${event.eventType}: ${event.details || ''}`);
    return telEvent;
  }

  // --- Insurance / TPA Pre-Authorizations & Claims API ---
  public getInsuranceProviders(): InsuranceProvider[] {
    return this.insuranceProviders;
  }

  public addInsuranceProvider(data: Omit<InsuranceProvider, 'id'>): InsuranceProvider {
    const prov: InsuranceProvider = {
      ...data,
      id: `ins-${Date.now()}`,
    };
    this.insuranceProviders.push(prov);
    this.saveToStorage();
    return prov;
  }

  public updateInsuranceProvider(id: string, updates: Partial<InsuranceProvider>): InsuranceProvider | undefined {
    const idx = this.insuranceProviders.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.insuranceProviders[idx] = { ...this.insuranceProviders[idx], ...updates };
    this.saveToStorage();
    return this.insuranceProviders[idx];
  }

  public getInsurancePolicies(patientId?: string): InsurancePolicy[] {
    if (patientId) {
      return this.insurancePolicies.filter((p) => p.patientId === patientId);
    }
    return this.insurancePolicies;
  }

  public getPatientInsurancePolicy(patientId: string): InsurancePolicy | undefined {
    return this.insurancePolicies.find((p) => p.patientId === patientId && p.status === 'Active');
  }

  public addInsurancePolicy(data: Omit<InsurancePolicy, 'id'>): InsurancePolicy {
    const pol: InsurancePolicy = {
      ...data,
      id: `pol-${Date.now()}`,
    };
    this.insurancePolicies.unshift(pol);
    this.saveToStorage();
    return pol;
  }

  public getPreAuthorizations(patientId?: string): PreAuthorization[] {
    if (patientId) {
      return this.preAuthorizations.filter((p) => p.patientId === patientId);
    }
    return this.preAuthorizations;
  }

  public submitPreAuthorization(data: Omit<PreAuthorization, 'id' | 'createdAt' | 'status' | 'preauthNumber'>): PreAuthorization {
    const count = this.preAuthorizations.length + 1;
    const preauth: PreAuthorization = {
      ...data,
      id: `pre-${Date.now()}`,
      preauthNumber: `PA-2026-${String(count).padStart(3, '0')}`,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.preAuthorizations.unshift(preauth);
    this.addAuditLog('ACCOUNTANT', 'SUBMITTED_PREAUTH', 'Billing', 'PreAuthorization', preauth.id, `Submitted Pre-Auth for ${preauth.patientName} (${preauth.requestedProcedure})`);
    this.saveToStorage();
    return preauth;
  }

  public reviewPreAuthorization(id: string, status: PreAuthorization['status'], approvedAmount?: number, remarks?: string): PreAuthorization | undefined {
    const preauth = this.preAuthorizations.find((p) => p.id === id);
    if (!preauth) return undefined;
    preauth.status = status;
    if (approvedAmount !== undefined) preauth.approvedAmount = approvedAmount;
    if (remarks) preauth.reviewerRemarks = remarks;
    if (status === 'Approved') {
      preauth.approvalNumber = `AUTH-${preauth.providerName.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      preauth.validUntil = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];
    }
    preauth.decidedAt = new Date().toISOString();
    this.addAuditLog('ACCOUNTANT', 'REVIEWED_PREAUTH', 'Billing', 'PreAuthorization', preauth.id, `Pre-Auth updated to ${status}`);
    this.saveToStorage();
    return preauth;
  }

  public getInsuranceClaims(filter?: { patientId?: string; status?: string }): InsuranceClaim[] {
    return this.insuranceClaims.filter((clm) => {
      if (filter?.patientId && clm.patientId !== filter.patientId) return false;
      if (filter?.status && filter.status !== 'all' && clm.status !== filter.status) return false;
      return true;
    });
  }

  public createInsuranceClaim(data: Omit<InsuranceClaim, 'id' | 'createdAt' | 'claimNumber' | 'settlementStatus'>): InsuranceClaim {
    const count = this.insuranceClaims.length + 1;
    const claim: InsuranceClaim = {
      ...data,
      id: `clm-${Date.now()}`,
      claimNumber: `CLM-2026-${String(count).padStart(3, '0')}`,
      settlementStatus: 'Unsettled',
      createdAt: new Date().toISOString(),
    };
    this.insuranceClaims.unshift(claim);
    this.addAuditLog('ACCOUNTANT', 'CREATED_INSURANCE_CLAIM', 'Billing', 'InsuranceClaim', claim.id, `Generated insurance claim ${claim.claimNumber} for ${claim.patientName}`);
    this.saveToStorage();
    return claim;
  }

  public updateInsuranceClaimStatus(id: string, status: InsuranceClaim['status'], approvedAmount?: number): InsuranceClaim | undefined {
    const claim = this.insuranceClaims.find((c) => c.id === id);
    if (!claim) return undefined;
    claim.status = status;
    if (approvedAmount !== undefined) claim.approvedAmount = approvedAmount;
    this.saveToStorage();
    return claim;
  }

  public settleInsuranceClaim(claimId: string, reference: string, recordedBy: string = 'Daniel Weber, CPA'): ClaimSettlement | undefined {
    const claim = this.insuranceClaims.find((c) => c.id === claimId);
    if (!claim) return undefined;

    claim.status = 'Settled';
    claim.settlementStatus = 'Settled';
    claim.settlementDate = new Date().toISOString().split('T')[0];
    claim.paymentReference = reference;

    const settlement: ClaimSettlement = {
      id: `set-${Date.now()}`,
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      invoiceId: claim.invoiceId,
      totalInvoice: claim.totalClaimAmount,
      approvedByInsurance: claim.approvedAmount,
      patientCopay: claim.patientCopayAmount,
      rejectedPortion: claim.rejectedAmount,
      insuranceSettlementRef: reference,
      settledAt: new Date().toISOString(),
      recordedBy,
    };
    this.claimSettlements.unshift(settlement);
    this.addAuditLog('ACCOUNTANT', 'SETTLED_CLAIM', 'Billing', 'ClaimSettlement', settlement.id, `Settled claim ${claim.claimNumber} (Ref: ${reference})`);
    this.saveToStorage();
    return settlement;
  }

  public getClaimSettlements(claimId?: string): ClaimSettlement[] {
    if (claimId) {
      return this.claimSettlements.filter((s) => s.claimId === claimId);
    }
    return this.claimSettlements;
  }

  // --- Doctor Shifts & On-Call Roster API ---
  public getDoctorShifts(date?: string, doctorId?: string): DoctorShift[] {
    return this.doctorShifts.filter((s) => {
      if (date && s.date !== date) return false;
      if (doctorId && s.doctorId !== doctorId) return false;
      return true;
    });
  }

  public addDoctorShift(data: Omit<DoctorShift, 'id'>): DoctorShift {
    const shift: DoctorShift = {
      ...data,
      id: `dshift-${Date.now()}`,
    };
    this.doctorShifts.push(shift);
    this.saveToStorage();
    return shift;
  }

  public updateDoctorShift(id: string, updates: Partial<DoctorShift>): DoctorShift | undefined {
    const idx = this.doctorShifts.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.doctorShifts[idx] = { ...this.doctorShifts[idx], ...updates };
    this.saveToStorage();
    return this.doctorShifts[idx];
  }

  public deleteDoctorShift(id: string): boolean {
    const idx = this.doctorShifts.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.doctorShifts.splice(idx, 1);
    this.saveToStorage();
    return true;
  }

  public getOnCallRosters(date?: string): OnCallRoster[] {
    if (date) {
      return this.onCallRosters.filter((r) => r.date === date);
    }
    return this.onCallRosters;
  }

  public saveOnCallRoster(data: Omit<OnCallRoster, 'id'> & { id?: string }): OnCallRoster {
    if (data.id) {
      const idx = this.onCallRosters.findIndex((r) => r.id === data.id);
      if (idx !== -1) {
        this.onCallRosters[idx] = { ...this.onCallRosters[idx], ...data } as OnCallRoster;
        this.saveToStorage();
        return this.onCallRosters[idx];
      }
    }
    const newRoster: OnCallRoster = {
      ...data,
      id: data.id || `oncall-${Date.now()}`,
    };
    this.onCallRosters.push(newRoster);
    this.saveToStorage();
    return newRoster;
  }

  public checkShiftConflicts(doctorId: string, date: string, startTime: string, endTime: string, ignoreId?: string): boolean {
    return this.doctorShifts.some((s) => {
      if (ignoreId && s.id === ignoreId) return false;
      if (s.doctorId !== doctorId || s.date !== date) return false;
      // Overlap check
      return (startTime < s.endTime && endTime > s.startTime);
    });
  }

  // --- Drug Safety & Warnings API ---
  public getDrugSafetyWarnings(patientId?: string): DrugSafetyWarning[] {
    if (patientId) {
      return this.drugSafetyWarnings.filter((w) => !w.isDismissed);
    }
    return this.drugSafetyWarnings;
  }

  public getDrugSafetyEvents(patientId?: string): DrugSafetyEvent[] {
    if (patientId) {
      return this.drugSafetyEvents.filter((e) => e.patientId === patientId);
    }
    return this.drugSafetyEvents;
  }

  public recordDrugSafetyEvent(data: Omit<DrugSafetyEvent, 'id' | 'timestamp'>): DrugSafetyEvent {
    const event: DrugSafetyEvent = {
      ...data,
      id: `dse-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.drugSafetyEvents.unshift(event);
    this.addAuditLog('DOCTOR', 'DRUG_SAFETY_OVERRIDE', 'Prescriptions', 'DrugSafety', event.id, `${event.actionTaken} for ${event.medicineName} (${event.overrideReason || ''})`);
    this.saveToStorage();
    return event;
  }

  public addDrugSafetyEvent(data: Omit<DrugSafetyEvent, 'id' | 'timestamp'>): DrugSafetyEvent {
    return this.recordDrugSafetyEvent(data);
  }

  public overrideDrugSafetyWarning(warningId: string, reason: string, doctorId: string): boolean {
    const warning = this.drugSafetyWarnings.find((w) => w.id === warningId);
    if (!warning) return false;
    warning.isOverridden = true;
    warning.isDismissed = true;
    warning.overrideReason = reason;
    warning.overriddenByDoctorId = doctorId;
    warning.overriddenAt = new Date().toISOString();

    this.recordDrugSafetyEvent({
      patientId: 'current-patient',
      doctorId,
      doctorName: 'Dr. Physician',
      medicineName: warning.medicineName,
      warningType: warning.warningType,
      severity: warning.severity,
      reason: warning.reason,
      actionTaken: 'OVERRIDDEN',
      overrideReason: reason,
    });
    this.saveToStorage();
    return true;
  }

  // --- Observability & Background Jobs API ---
  public getBackgroundJobs(): BackgroundJobRecord[] {
    return this.backgroundJobs;
  }

  public retryBackgroundJob(id: string): BackgroundJobRecord | undefined {
    const job = this.backgroundJobs.find((j) => j.id === id);
    if (!job) return undefined;
    job.status = 'Running';
    job.attemptCount += 1;
    setTimeout(() => {
      job.status = 'Completed';
      job.completedAt = new Date().toISOString();
      this.saveToStorage();
    }, 1000);
    this.saveToStorage();
    return job;
  }

  public getSystemHealthChecks(): SystemHealthCheck[] {
    return this.healthChecks;
  }

  // --- Auth, Staff Onboarding & Organization Provisioning Helpers ---
  public createStaffMember(staffData: Omit<Staff, 'id'>): Staff {
    const newStaff: Staff = {
      ...staffData,
      id: `stf-${Date.now()}`,
    };
    this.staff.push(newStaff);
    this.addAuditLog(newStaff.role, 'REGISTERED_STAFF', 'Settings', 'Staff', newStaff.id, `Onboarded new staff member ${newStaff.name} (${newStaff.role})`);
    this.saveToStorage();
    return newStaff;
  }

  public createEmployeeProfile(empData: Omit<EmployeeProfile, 'id'>): EmployeeProfile {
    const newEmp: EmployeeProfile = {
      ...empData,
      id: `emp-${Date.now()}`,
    };
    this.employees.push(newEmp);
    this.saveToStorage();
    return newEmp;
  }

  public updateOrganization(updates: Partial<Organization>): Organization {
    this.organization = { ...this.organization, ...updates };
    const orgInList = this.organizations?.find(o => o.id === this.organization.id);
    if (orgInList) {
      Object.assign(orgInList, updates);
    }
    this.addAuditLog('SUPER_ADMIN', 'UPDATED_ORGANIZATION', 'Settings', 'Organization', this.organization.id, `Updated organization config for ${this.organization.name}`);
    this.saveToStorage();
    return this.organization;
  }

  // --- Organization Management (CRUD) ---
  public getOrganizations(): Organization[] {
    if (!this.organizations || this.organizations.length === 0) {
      this.organizations = [this.organization || INITIAL_ORGANIZATION];
    }
    return this.organizations;
  }

  public getOrganization(id: string): Organization | undefined {
    return this.getOrganizations().find(o => o.id === id);
  }

  public createOrganization(data: Omit<Organization, 'id'>): Organization {
    const newOrg: Organization = {
      ...data,
      id: `org-${Date.now()}`,
      status: data.status || 'Active',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.organizations) this.organizations = [];
    this.organizations.push(newOrg);
    this.addAuditLog('SUPER_ADMIN', 'CREATED_ORGANIZATION', 'Settings', 'Organization', newOrg.id, `Created organization ${newOrg.name}`);
    this.saveToStorage();
    return newOrg;
  }

  public updateOrganizationById(id: string, updates: Partial<Organization>): Organization | undefined {
    const org = this.getOrganization(id);
    if (!org) return undefined;
    Object.assign(org, updates, { updatedAt: new Date().toISOString() });
    if (this.organization && this.organization.id === id) {
      this.organization = { ...this.organization, ...updates };
    }
    this.addAuditLog('SUPER_ADMIN', 'UPDATED_ORGANIZATION', 'Settings', 'Organization', id, `Updated organization ${org.name}`);
    this.saveToStorage();
    return org;
  }

  public deleteOrganization(id: string): { success: boolean; error?: string } {
    if (id === 'org-01' || (this.organization && id === this.organization.id)) {
      return { success: false, error: 'Cannot delete the primary root organization. You may update its details or status instead.' };
    }
    const idx = this.getOrganizations().findIndex(o => o.id === id);
    if (idx === -1) return { success: false, error: 'Organization not found' };
    const removed = this.organizations.splice(idx, 1)[0];
    this.addAuditLog('SUPER_ADMIN', 'DELETED_ORGANIZATION', 'Settings', 'Organization', id, `Deleted organization ${removed.name}`);
    this.saveToStorage();
    return { success: true };
  }

  // --- Branch Management (CRUD) ---
  public getBranches(orgId?: string): Branch[] {
    if (orgId && orgId !== 'all') {
      return this.branches.filter(b => b.organizationId === orgId);
    }
    return this.branches;
  }

  public getBranch(id: string): Branch | undefined {
    return this.branches.find(b => b.id === id);
  }

  public createBranch(data: Omit<Branch, 'id'>): Branch {
    const newBranch: Branch = {
      ...data,
      id: `branch-${Date.now()}`,
      status: data.status || 'Active',
      active: data.active !== undefined ? data.active : true,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.branches.push(newBranch);
    this.addAuditLog('SUPER_ADMIN', 'CREATED_BRANCH', 'Settings', 'Branch', newBranch.id, `Created branch ${newBranch.name} (${newBranch.code})`);
    this.saveToStorage();
    return newBranch;
  }

  public updateBranch(id: string, updates: Partial<Branch>): Branch | undefined {
    const branch = this.getBranch(id);
    if (!branch) return undefined;
    Object.assign(branch, updates, { updatedAt: new Date().toISOString() });
    this.addAuditLog('SUPER_ADMIN', 'UPDATED_BRANCH', 'Settings', 'Branch', id, `Updated branch ${branch.name}`);
    this.saveToStorage();
    return branch;
  }

  public deleteBranch(id: string): { success: boolean; error?: string } {
    const branch = this.getBranch(id);
    if (!branch) return { success: false, error: 'Branch not found' };
    if (branch.isMainBranch) {
      return { success: false, error: 'Cannot delete the primary headquarters branch. Designate another branch as primary first.' };
    }
    const linkedAppointments = this.appointments.filter(a => a.branchId === id).length;
    if (linkedAppointments > 0) {
      return { 
        success: false, 
        error: `Cannot delete branch with ${linkedAppointments} existing appointments. Consider archiving or deactivating the branch instead.` 
      };
    }
    const idx = this.branches.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.branches.splice(idx, 1);
      this.addAuditLog('SUPER_ADMIN', 'DELETED_BRANCH', 'Settings', 'Branch', id, `Deleted branch ${branch.name}`);
      this.saveToStorage();
    }
    return { success: true };
  }

  // --- Role Management (CRUD) ---
  public getRoleById(id: string): RoleDefinition | undefined {
    return this.roles.find(r => r.id === id);
  }

  public createRole(data: Omit<RoleDefinition, 'id'>): RoleDefinition {
    const newRole: RoleDefinition = {
      ...data,
      id: `role-${Date.now()}`,
      isSystem: false,
    };
    this.roles.push(newRole);
    this.addAuditLog('SUPER_ADMIN', 'CREATED_ROLE', 'Settings', 'Role', newRole.id, `Created new role ${newRole.name}`);
    this.saveToStorage();
    return newRole;
  }

  public updateRole(id: string, updates: Partial<RoleDefinition>): RoleDefinition | undefined {
    const role = this.getRoleById(id);
    if (!role) return undefined;
    if (role.isSystem && (role.name.includes('Super Admin') || role.id === 'role-super-admin')) {
      return role;
    }
    const oldPermissionsCount = role.permissions.length;
    Object.assign(role, updates);
    const permChangeInfo = updates.permissions ? ` (permissions updated: ${oldPermissionsCount} -> ${role.permissions.length})` : '';
    this.addAuditLog('SUPER_ADMIN', 'UPDATED_ROLE', 'Settings', 'Role', id, `Updated role ${role.name}${permChangeInfo}`);
    this.saveToStorage();
    return role;
  }

  public assignRoleToEmployee(employeeId: string, roleNameOrId: string): { success: boolean; employee?: EmployeeProfile; error?: string } {
    const emp = this.getEmployeeById(employeeId);
    if (!emp) return { success: false, error: 'Employee not found' };

    // Super Admin protection rule
    if (emp.role === 'SUPER_ADMIN' || emp.email === 'admin@mediera.com' || emp.id === 'usr-admin-01') {
      if (roleNameOrId !== 'SUPER_ADMIN' && roleNameOrId !== 'role-super-admin') {
        return { success: false, error: 'Super Admin role is permanent and cannot be modified or downgraded.' };
      }
    }

    // Resolve role definition if passed role id
    const targetRole = this.roles.find(r => r.id === roleNameOrId || r.name.toUpperCase().replace(/\s+/g, '_') === roleNameOrId.toUpperCase());
    const newRoleCode = (targetRole ? (targetRole.id.replace('role-', '').toUpperCase().replace('-', '_')) : roleNameOrId) as any;

    const oldRole = emp.role;
    emp.role = newRoleCode;
    this.addAuditLog('SUPER_ADMIN', 'ASSIGNED_EMPLOYEE_ROLE', 'Settings', 'Employee', emp.id, `Assigned role ${targetRole ? targetRole.name : newRoleCode} to employee ${emp.name} (previous: ${oldRole})`);
    this.saveToStorage();
    return { success: true, employee: emp };
  }

  public getEmployeesByRole(roleNameOrId: string): EmployeeProfile[] {
    const role = this.roles.find(r => r.id === roleNameOrId || r.name.toLowerCase() === roleNameOrId.toLowerCase());
    return this.employees.filter(e => {
      if (e.role === roleNameOrId) return true;
      if (role && (e.role === role.id || e.role.toLowerCase() === role.name.toLowerCase())) return true;
      if (role && e.role === role.id.replace('role-', '').toUpperCase().replace(/-/g, '_')) return true;
      return false;
    });
  }

  public deleteRole(id: string): { success: boolean; error?: string } {
    const role = this.getRoleById(id);
    if (!role) return { success: false, error: 'Role not found' };
    if (role.isSystem) {
      return { success: false, error: `Cannot delete built-in system role '${role.name}'. System roles are required for core platform operation.` };
    }
    const idx = this.roles.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.roles.splice(idx, 1);
      this.addAuditLog('SUPER_ADMIN', 'DELETED_ROLE', 'Settings', 'Role', id, `Deleted custom role ${role.name}`);
      this.saveToStorage();
    }
    return { success: true };
  }

  public findPatientByContact(term: string): Patient | undefined {
    const clean = term.trim().toLowerCase();
    return this.patients.find(
      (p) =>
        p.phone.toLowerCase() === clean ||
        p.email.toLowerCase() === clean ||
        p.patientId.toLowerCase() === clean ||
        p.id.toLowerCase() === clean
    );
  }

  public findStaffByEmail(email: string): Staff | undefined {
    const clean = email.trim().toLowerCase();
    return this.staff.find((s) => s.email.toLowerCase() === clean);
  }

  public authenticateUser(
    identifier: string,
    password?: string,
    requestedRole?: UserRole
  ): { success: boolean; user?: User; error?: string } {
    const clean = identifier.trim().toLowerCase();

    // 1. Super Admin check
    if (clean === 'admin@mediera.com' || clean === 'superadmin') {
      const superAdminUser: User = {
        id: 'usr-admin-01',
        organizationId: 'org-mediera-01',
        branchId: 'br-main-01',
        role: 'SUPER_ADMIN',
        email: 'admin@mediera.com',
        name: 'Marcus Sterling (Executive Super Admin)',
        phone: '+1 (555) 100-2001',
        active: true,
        permissions: ['all'],
      };
      return { success: true, user: superAdminUser };
    }

    // 2. Patient match
    const patientMatch = this.findPatientByContact(clean);
    if (patientMatch) {
      const patUser: User = {
        id: `usr-pat-${patientMatch.id}`,
        organizationId: patientMatch.organizationId || 'org-01',
        branchId: patientMatch.branchId || 'branch-01',
        role: 'PATIENT',
        email: patientMatch.email || `${clean}@patient.mediera.health`,
        name: `${patientMatch.firstName} ${patientMatch.lastName}`,
        phone: patientMatch.phone,
        patientId: patientMatch.id,
        active: true,
        permissions: ['patient_portal.access'],
      };
      return { success: true, user: patUser };
    }

    // 3. Staff match
    const staffMatch = this.findStaffByEmail(clean);
    if (staffMatch) {
      const targetRole: UserRole = staffMatch.role as UserRole;
      const staffUser: User = {
        id: `usr-stf-${staffMatch.id}`,
        organizationId: staffMatch.organizationId || 'org-01',
        branchId: staffMatch.branchId || 'branch-01',
        name: staffMatch.name,
        email: staffMatch.email,
        phone: staffMatch.phone,
        role: targetRole,
        active: true,
        permissions: ['staff.access'],
      };
      return { success: true, user: staffUser };
    }

    // 4. Fallback user
    const targetRole: UserRole = requestedRole || 'PATIENT';
    const fallbackUser: User = {
      id: `usr-${Date.now()}`,
      organizationId: 'org-01',
      branchId: 'branch-01',
      name: clean.split('@')[0].toUpperCase(),
      email: clean.includes('@') ? clean : `${clean}@mediera.health`,
      phone: '+1 (555) 000-0000',
      role: targetRole,
      active: true,
      permissions: targetRole === 'PATIENT' ? ['patient_portal.access'] : ['all'],
    };
    return { success: true, user: fallbackUser };
  }

  public resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    this.loadFromStorageOrSeed();
  }

  public resetToSeed() {
    this.resetDatabase();
  }
}

export const dbService = ClinicDatabaseService.getInstance();
