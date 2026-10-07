import {
  EmployeeResponsibilityAssignment,
  OperationalTaskQueueItem,
  DigitalPatientIntake,
  CarePlan,
  ClinicalReferral,
  MedicalRecordRequest,
  PosTerminalConfig,
  PaymentReconciliationBatch,
  PaymentRefundRecord,
  NotificationEngineConfig,
  SystemNotificationEntry,
  DeterministicWorkflowRule,
  PaymentRecord,
  Invoice,
  PaymentMethod
} from '../types';

export const PHASE10_STORAGE_KEY = 'mediera_phase10_data_v1';

// 1. Initial Flexible Employee Assignments (Multiple Responsibilities, Branches, Shifts, Departments)
export const INITIAL_EMPLOYEE_ASSIGNMENTS: EmployeeResponsibilityAssignment[] = [
  {
    id: 'emp-resp-01',
    employeeId: 'usr-stf-01',
    employeeName: 'Elena Rostova',
    role: 'NURSE',
    responsibilities: ['Triage Assessment', 'Phlebotomy / Lab Draw', 'Vaccination Specialist', 'OPD Coordinator'],
    departmentIds: ['dept-02', 'dept-03', 'dept-01'],
    departmentNames: ['Nursing & Inpatient', 'Laboratory Services', 'Outpatient Department (OPD)'],
    branchIds: ['br-01', 'br-02'],
    branchNames: ['Main Medical Campus', 'Downtown Health Clinic'],
    shiftIds: ['shift-01', 'shift-02'],
    shiftNames: ['Morning Shift (07:00-15:00)', 'General Shift (09:00-17:00)'],
    customPermissions: ['vitals.record', 'lab.draw_sample', 'vaccines.administer', 'tasks.reassign'],
    currentAssignmentStatus: 'Available',
    workloadScore: 3,
    maxConcurrentTasks: 8,
    contactPhone: '+1 (555) 234-5678',
    contactEmail: 'elena.rostova@apexhealth.org',
    updatedAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'emp-resp-02',
    employeeId: 'usr-stf-02',
    employeeName: 'Marcus Vance',
    role: 'RECEPTIONIST',
    responsibilities: ['Front Desk Triage', 'Cashier & POS', 'Appointment Dispatcher', 'Patient Intake Reviewer'],
    departmentIds: ['dept-06', 'dept-05'],
    departmentNames: ['Front Desk & Patient Relations', 'Billing & Accounts'],
    branchIds: ['br-01'],
    branchNames: ['Main Medical Campus'],
    shiftIds: ['shift-01'],
    shiftNames: ['Morning Shift (07:00-15:00)'],
    customPermissions: ['appointments.create', 'billing.collect_payment', 'intake.verify', 'tokens.dispense'],
    currentAssignmentStatus: 'Assigned',
    workloadScore: 5,
    maxConcurrentTasks: 10,
    contactPhone: '+1 (555) 345-6789',
    contactEmail: 'marcus.vance@apexhealth.org',
    updatedAt: '2026-09-01T08:30:00Z',
  },
  {
    id: 'emp-resp-03',
    employeeId: 'usr-stf-03',
    employeeName: 'Rachel Gomez',
    role: 'CLINIC_ADMIN',
    responsibilities: ['Service Recovery Specialist', 'Referral Coordinator', 'Care Follow-up Caller', 'Medical Records Custodian'],
    departmentIds: ['dept-06', 'dept-07'],
    departmentNames: ['Front Desk & Patient Relations', 'Administration & HR'],
    branchIds: ['br-01', 'br-02', 'br-03'],
    branchNames: ['Main Medical Campus', 'Downtown Health Clinic', 'Westside Diagnostics Hub'],
    shiftIds: ['shift-02'],
    shiftNames: ['General Shift (09:00-17:00)'],
    customPermissions: ['crm.service_recovery', 'records.dispatch', 'referrals.manage', 'followups.log'],
    currentAssignmentStatus: 'Available',
    workloadScore: 2,
    maxConcurrentTasks: 6,
    contactPhone: '+1 (555) 456-7890',
    contactEmail: 'rachel.gomez@apexhealth.org',
    updatedAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'emp-resp-04',
    employeeId: 'usr-stf-04',
    employeeName: 'David Kim',
    role: 'PHARMACIST',
    responsibilities: ['Pharmacy Dispensing', 'Drug Safety Auditor', 'Formulary Manager', 'POS Counter 3'],
    departmentIds: ['dept-04', 'dept-05'],
    departmentNames: ['Pharmacy & Formulary', 'Billing & Accounts'],
    branchIds: ['br-01'],
    branchNames: ['Main Medical Campus'],
    shiftIds: ['shift-02'],
    shiftNames: ['General Shift (09:00-17:00)'],
    customPermissions: ['pharmacy.dispense', 'inventory.adjust', 'billing.collect_payment', 'interactions.override'],
    currentAssignmentStatus: 'In Consultation',
    workloadScore: 4,
    maxConcurrentTasks: 7,
    contactPhone: '+1 (555) 567-8901',
    contactEmail: 'david.kim@apexhealth.org',
    updatedAt: '2026-09-01T09:15:00Z',
  },
  {
    id: 'emp-resp-05',
    employeeId: 'usr-doc-01',
    employeeName: 'Dr. Sarah Jenkins, MD',
    role: 'DOCTOR',
    responsibilities: ['Attending Cardiologist', 'Telehealth Host', 'Clinical Supervisor', 'Chronic Care Lead'],
    departmentIds: ['dept-01'],
    departmentNames: ['Outpatient Department (OPD)'],
    branchIds: ['br-01', 'br-02'],
    branchNames: ['Main Medical Campus', 'Downtown Health Clinic'],
    shiftIds: ['shift-01', 'shift-02'],
    shiftNames: ['Morning Shift (07:00-15:00)', 'General Shift (09:00-17:00)'],
    customPermissions: ['consultations.conduct', 'prescriptions.sign', 'careplans.approve', 'referrals.create'],
    currentAssignmentStatus: 'In Consultation',
    workloadScore: 6,
    maxConcurrentTasks: 12,
    contactPhone: '+1 (555) 890-1234',
    contactEmail: 'dr.jenkins@apexhealth.org',
    updatedAt: '2026-09-01T08:00:00Z',
  }
];

// 2. Initial Operational Tasks Queue
export const INITIAL_OPERATIONAL_TASKS: OperationalTaskQueueItem[] = [
  {
    id: 'task-op-101',
    taskNumber: 'TSK-2026-0101',
    title: 'Pre-Visit Vitals & Clinical Triage: John Doe',
    description: 'Patient checked in for morning Cardiology consultation with Dr. Jenkins. Record SpO2, BP, pulse, and BMI.',
    category: 'Clinical Triage',
    requiredResponsibility: 'Triage Assessment',
    branchId: 'br-01',
    branchName: 'Main Medical Campus',
    departmentId: 'dept-02',
    departmentName: 'Nursing & Inpatient',
    shiftName: 'Morning Shift (07:00-15:00)',
    priority: 'High',
    status: 'In Progress',
    assignedEmployeeId: 'usr-stf-01',
    assignedEmployeeName: 'Elena Rostova',
    patientId: 'pat-001',
    patientName: 'John Doe',
    dueDate: '2026-09-03T10:30:00Z',
    createdAt: '2026-09-03T09:15:00Z',
    escalationLevel: 0,
    reassignmentHistory: [],
  },
  {
    id: 'task-op-102',
    taskNumber: 'TSK-2026-0102',
    title: 'Urgent Stat Blood Draw: Emily Watson',
    description: 'Fasting Lipid Profile and HbA1c required before 11:00 AM laboratory batch cutoff.',
    category: 'Phlebotomy',
    requiredResponsibility: 'Phlebotomy / Lab Draw',
    branchId: 'br-01',
    branchName: 'Main Medical Campus',
    departmentId: 'dept-03',
    departmentName: 'Laboratory Services',
    shiftName: 'Morning Shift (07:00-15:00)',
    priority: 'Critical',
    status: 'Pending',
    assignedEmployeeId: 'usr-stf-01',
    assignedEmployeeName: 'Elena Rostova',
    patientId: 'pat-002',
    patientName: 'Emily Watson',
    dueDate: '2026-09-03T11:00:00Z',
    createdAt: '2026-09-03T09:40:00Z',
    escalationLevel: 1,
    escalatedTo: 'Lab Head',
    escalationReason: 'Pending for > 30 minutes during morning rush',
    reassignmentHistory: [
      {
        fromEmployeeId: undefined,
        fromEmployeeName: 'Unassigned Pool',
        toEmployeeId: 'usr-stf-01',
        toEmployeeName: 'Elena Rostova',
        reason: 'Auto-routed by Responsibility Engine: Phlebotomy specialist available',
        reassignedBy: 'System Dispatcher',
        timestamp: '2026-09-03T09:42:00Z',
      }
    ],
  },
  {
    id: 'task-op-103',
    taskNumber: 'TSK-2026-0103',
    title: 'Digital Intake Form Review: Carlos Mendez',
    description: 'Review submitted online pre-visit registration form. Verify insurance details and allergy declarations.',
    category: 'Record Request',
    requiredResponsibility: 'Patient Intake Reviewer',
    branchId: 'br-01',
    branchName: 'Main Medical Campus',
    departmentId: 'dept-06',
    departmentName: 'Front Desk & Patient Relations',
    priority: 'Normal',
    status: 'Pending',
    assignedEmployeeId: 'usr-stf-02',
    assignedEmployeeName: 'Marcus Vance',
    patientId: 'pat-004',
    patientName: 'Carlos Mendez',
    dueDate: '2026-09-03T14:00:00Z',
    createdAt: '2026-09-03T08:00:00Z',
    escalationLevel: 0,
    reassignmentHistory: [],
  },
  {
    id: 'task-op-104',
    taskNumber: 'TSK-2026-0104',
    title: 'Service Recovery Call: Robert Chen',
    description: 'Patient rated waiting time 2/5 stars on post-consultation feedback. Contact to explain delay and offer complimentary vitals review.',
    category: 'Service Recovery',
    requiredResponsibility: 'Service Recovery Specialist',
    branchId: 'br-02',
    branchName: 'Downtown Health Clinic',
    departmentId: 'dept-06',
    departmentName: 'Front Desk & Patient Relations',
    priority: 'High',
    status: 'In Progress',
    assignedEmployeeId: 'usr-stf-03',
    assignedEmployeeName: 'Rachel Gomez',
    patientId: 'pat-003',
    patientName: 'Robert Chen',
    dueDate: '2026-09-03T16:00:00Z',
    createdAt: '2026-09-03T09:00:00Z',
    escalationLevel: 0,
    reassignmentHistory: [],
  }
];

// 3. Initial Digital Patient Intake Submissions
export const INITIAL_DIGITAL_INTAKES: DigitalPatientIntake[] = [
  {
    id: 'intake-001',
    intakeNumber: 'INT-2026-001',
    patientId: 'pat-001',
    patientName: 'John Doe',
    patientPhone: '+1 (555) 123-4567',
    patientEmail: 'john.doe@example.com',
    dateOfBirth: '1982-05-14',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '742 Evergreen Terrace, Springfield, IL',
    emergencyContactName: 'Mary Doe',
    emergencyContactPhone: '+1 (555) 987-6543',
    emergencyRelationship: 'Spouse',
    appointmentId: 'apt-001',
    preferredDoctorId: 'usr-doc-01',
    submittedAt: '2026-09-01T14:20:00Z',
    status: 'Attached to Chart',
    chiefComplaint: 'Chest tightness and occasional shortness of breath when walking up stairs.',
    symptomDuration: '3 weeks',
    painScale: 4,
    medicalConditions: ['Hypertension', 'Hyperlipidemia'],
    allergies: ['Penicillin (Hives / Rash)', 'Shellfish'],
    currentMedications: [
      { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily (morning)' },
      { name: 'Atorvastatin', dose: '20mg', frequency: 'Once daily (bedtime)' }
    ],
    pastSurgeries: ['Appendectomy (2014)'],
    familyHistory: ['Father: Myocardial infarction at age 58', 'Mother: Type 2 Diabetes'],
    insuranceProvider: 'Blue Cross Blue Shield of Illinois',
    insurancePolicyNumber: 'BCBS-88392019',
    insuranceGroupNumber: 'GRP-99401',
    consentSigned: true,
    consentSignedAt: '2026-09-01T14:25:00Z',
    consentSignatureName: 'John Doe (Digital Verification)',
    documentsUploaded: [
      { id: 'doc-up-01', name: 'Drivers_License_Front.jpg', url: '#', category: 'Government ID' },
      { id: 'doc-up-02', name: 'Insurance_Card_2026.pdf', url: '#', category: 'Insurance Card' }
    ],
    verifiedBy: 'Marcus Vance',
    verifiedAt: '2026-09-01T15:00:00Z',
  },
  {
    id: 'intake-002',
    intakeNumber: 'INT-2026-002',
    patientId: 'pat-004',
    patientName: 'Carlos Mendez',
    patientPhone: '+1 (555) 456-7890',
    patientEmail: 'carlos.mendez@example.com',
    dateOfBirth: '1995-11-20',
    gender: 'Male',
    bloodGroup: 'B+',
    address: '1204 Pine Hollow Road, Chicago, IL',
    emergencyContactName: 'Sofia Mendez',
    emergencyContactPhone: '+1 (555) 777-8899',
    emergencyRelationship: 'Sister',
    submittedAt: '2026-09-03T07:45:00Z',
    status: 'Submitted',
    chiefComplaint: 'Severe left knee pain following sports injury. Swelling and restricted flexion.',
    symptomDuration: '2 days',
    painScale: 7,
    medicalConditions: ['None reported'],
    allergies: ['No Known Drug Allergies (NKDA)'],
    currentMedications: [
      { name: 'Ibuprofen', dose: '400mg', frequency: 'As needed for pain' }
    ],
    pastSurgeries: ['None'],
    familyHistory: ['No major cardiovascular or chronic illness'],
    insuranceProvider: 'Aetna Health Care',
    insurancePolicyNumber: 'AET-4491028',
    insuranceGroupNumber: 'GRP-33120',
    consentSigned: true,
    consentSignedAt: '2026-09-03T07:48:00Z',
    consentSignatureName: 'Carlos Mendez',
    documentsUploaded: [
      { id: 'doc-up-03', name: 'Knee_XRay_External_Clinic.pdf', url: '#', category: 'Diagnostic Report' }
    ]
  }
];

// 4. Initial Chronic Care Plans
export const INITIAL_CARE_PLANS: CarePlan[] = [
  {
    id: 'plan-cp-01',
    planNumber: 'CP-2026-001',
    patientId: 'pat-001',
    patientName: 'John Doe',
    condition: 'Hypertension & Coronary Artery Risk Management',
    category: 'Chronic Disease Management',
    managingDoctorId: 'usr-doc-01',
    managingDoctorName: 'Dr. Sarah Jenkins, MD',
    startDate: '2026-08-01',
    reviewIntervalDays: 90,
    nextReviewDate: '2026-11-01',
    status: 'Active',
    goals: [
      {
        id: 'goal-01',
        description: 'Maintain resting blood pressure within normal therapeutic range',
        targetMetric: 'Systolic BP < 130 mmHg, Diastolic BP < 80 mmHg',
        currentValue: '128/82 mmHg',
        targetDate: '2026-10-15',
        status: 'In Progress',
      },
      {
        id: 'goal-02',
        description: 'Reduce Fasting LDL Cholesterol',
        targetMetric: 'LDL < 70 mg/dL',
        currentValue: '88 mg/dL',
        targetDate: '2026-11-01',
        status: 'In Progress',
      },
      {
        id: 'goal-03',
        description: 'Physical Activity Cadence',
        targetMetric: '150 minutes moderate cardio weekly + 7,000 steps daily',
        currentValue: '6,400 steps daily avg',
        targetDate: '2026-09-30',
        status: 'In Progress',
      }
    ],
    tasks: [
      {
        id: 'task-cp-01',
        title: 'Morning Blood Pressure Check & Log',
        frequency: 'Daily',
        instructions: 'Check sitting BP after 5 mins rest using digital arm cuff. Record reading in portal.',
        assignedRole: 'Patient',
        status: 'Active',
        lastLoggedDate: '2026-09-02',
      },
      {
        id: 'task-cp-02',
        title: 'Sodium-Restricted DASH Diet Adherence',
        frequency: 'Daily',
        instructions: 'Limit sodium intake to under 2,000mg/day. Increase fresh leafy greens and potassium-rich fruits.',
        assignedRole: 'Patient',
        status: 'Active',
      },
      {
        id: 'task-cp-03',
        title: 'Quarterly Nurse Vitals & ECG Check',
        frequency: 'Monthly',
        instructions: 'Clinic nurse review of logged readings, BMI, and 12-lead baseline resting ECG.',
        assignedRole: 'Nurse',
        status: 'Active',
      }
    ],
    medications: [
      { medicineName: 'Amlodipine Besylate', dosage: '5mg', frequency: 'Once Daily', notes: 'Take in morning with water' },
      { medicineName: 'Atorvastatin Calcium', dosage: '20mg', frequency: 'Once Daily', notes: 'Take at bedtime' },
      { medicineName: 'Aspirin (E.C.)', dosage: '81mg', frequency: 'Once Daily', notes: 'Take after breakfast' }
    ],
    investigations: [
      { testName: 'Lipid Panel (Fasting)', schedule: 'Every 3 Months', lastDoneDate: '2026-08-01' },
      { testName: 'Serum Creatinine & eGFR', schedule: 'Every 6 Months', lastDoneDate: '2026-08-01' },
      { testName: '12-Lead Electrocardiogram', schedule: 'Annually', lastDoneDate: '2026-05-10' }
    ],
    patientInstructions: 'If resting systolic blood pressure exceeds 160 mmHg or diastolic exceeds 100 mmHg on 2 consecutive checks, call the clinic triage line immediately.',
    monitoringMetrics: [
      { metricName: 'Systolic BP', unit: 'mmHg', targetRange: '110 - 130' },
      { metricName: 'Diastolic BP', unit: 'mmHg', targetRange: '70 - 80' },
      { metricName: 'Resting Pulse', unit: 'bpm', targetRange: '60 - 80' }
    ],
    notes: 'Patient shows consistent adherence. BP well controlled. Next lab draw scheduled for late October 2026.',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-01T11:00:00Z',
  },
  {
    id: 'plan-cp-02',
    planNumber: 'CP-2026-002',
    patientId: 'pat-002',
    patientName: 'Emily Watson',
    condition: 'Type 2 Diabetes Mellitus & Glycemic Control',
    category: 'Chronic Disease Management',
    managingDoctorId: 'usr-doc-02',
    managingDoctorName: 'Dr. Michael Chang, MD',
    startDate: '2026-07-15',
    reviewIntervalDays: 90,
    nextReviewDate: '2026-10-15',
    status: 'Active',
    goals: [
      {
        id: 'goal-04',
        description: 'Glycated Hemoglobin Optimization',
        targetMetric: 'HbA1c < 6.8%',
        currentValue: '7.1%',
        targetDate: '2026-10-15',
        status: 'In Progress',
      },
      {
        id: 'goal-05',
        description: 'Fasting Blood Glucose Stability',
        targetMetric: 'Fasting Glucose between 90 - 120 mg/dL',
        currentValue: '114 mg/dL',
        targetDate: '2026-09-30',
        status: 'Achieved',
      }
    ],
    tasks: [
      {
        id: 'task-cp-04',
        title: 'Fasting Blood Glucose Fingerstick Test',
        frequency: 'Daily',
        instructions: 'Log morning pre-breakfast glucometer reading.',
        assignedRole: 'Patient',
        status: 'Active',
        lastLoggedDate: '2026-09-03',
      },
      {
        id: 'task-cp-05',
        title: 'Annual Diabetic Foot & Retinal Screening',
        frequency: 'Monthly',
        instructions: 'Verify completion of annual ophthalmology dilated retinal exam and monofilament foot check.',
        assignedRole: 'Doctor',
        status: 'Active',
      }
    ],
    medications: [
      { medicineName: 'Metformin Hydrochloride (ER)', dosage: '1000mg', frequency: 'Twice Daily', notes: 'Take with morning and evening meals' },
      { medicineName: 'Empagliflozin', dosage: '10mg', frequency: 'Once Daily', notes: 'Take in the morning' }
    ],
    investigations: [
      { testName: 'Glycated Hemoglobin (HbA1c)', schedule: 'Every 3 Months', lastDoneDate: '2026-07-15' },
      { testName: 'Urine Microalbumin/Creatinine Ratio', schedule: 'Annually', lastDoneDate: '2026-04-12' }
    ],
    patientInstructions: 'Carry fast-acting glucose tablets. Report any foot sores, numbness, or persistent readings > 180 mg/dL to nursing staff.',
    monitoringMetrics: [
      { metricName: 'Fasting Glucose', unit: 'mg/dL', targetRange: '90 - 120' },
      { metricName: 'Postprandial (2hr)', unit: 'mg/dL', targetRange: '< 140' }
    ],
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-08-20T14:00:00Z',
  }
];

// 5. Initial Clinical Referrals
export const INITIAL_CLINICAL_REFERRALS: ClinicalReferral[] = [
  {
    id: 'ref-cl-001',
    referralNumber: 'REF-2026-001',
    patientId: 'pat-001',
    patientName: 'John Doe',
    patientPhone: '+1 (555) 123-4567',
    referralType: 'Internal',
    referringDoctorId: 'usr-doc-01',
    referringDoctorName: 'Dr. Sarah Jenkins, MD',
    referringBranchId: 'br-01',
    referringBranchName: 'Main Medical Campus',
    targetSpecialty: 'Diagnostic Cardiology & Imaging',
    targetDoctorName: 'Dr. Michael Chang, MD',
    reason: 'Transthoracic Echocardiogram (TTE) & Exercise Stress Test Evaluation',
    priority: 'Urgent',
    status: 'Consultation Scheduled',
    clinicalSummary: 'Patient with stage 2 hypertension and exertional dyspnea. Resting ECG demonstrates minor non-specific ST-T wave changes. Order echo to assess LV ejection fraction, wall motion, and diastolic filling parameters.',
    attachments: [
      { title: 'Baseline 12-Lead ECG (Aug 2026)', fileUrl: '#' },
      { title: 'Recent Lipid & Metabolic Panel', fileUrl: '#' }
    ],
    linkedAppointmentId: 'apt-001',
    feedbackFromReceivingDoctor: 'Scheduled for echo evaluation on Friday Sept 5 at 11:30 AM in Echo Lab 2.',
    createdDate: '2026-09-01',
    scheduledDate: '2026-09-05',
  },
  {
    id: 'ref-cl-002',
    referralNumber: 'REF-2026-002',
    patientId: 'pat-004',
    patientName: 'Carlos Mendez',
    patientPhone: '+1 (555) 456-7890',
    referralType: 'External',
    referringDoctorId: 'usr-doc-01',
    referringDoctorName: 'Dr. Sarah Jenkins, MD',
    referringBranchId: 'br-01',
    referringBranchName: 'Main Medical Campus',
    targetSpecialty: 'Orthopedic Surgery & Sports Medicine',
    externalFacilityName: 'Chicago Orthopedic & Spine Institute',
    externalContactPhone: '+1 (312) 555-9000',
    reason: 'Suspected ACL / Meniscal Tear Evaluation & High-Field MRI',
    priority: 'Urgent',
    status: 'Sent',
    clinicalSummary: '29-year-old male with acute knee hyperextension during soccer. Positive Lachman test, significant joint effusion. Patient unable to bear weight without brace.',
    attachments: [
      { title: 'Initial Knee Plain Film X-Ray', fileUrl: '#' }
    ],
    createdDate: '2026-09-03',
  }
];

// 6. Initial Medical Record Requests
export const INITIAL_RECORD_REQUESTS: MedicalRecordRequest[] = [
  {
    id: 'req-mr-001',
    requestNumber: 'MRR-2026-001',
    patientId: 'pat-001',
    patientName: 'John Doe',
    patientPhone: '+1 (555) 123-4567',
    patientEmail: 'john.doe@example.com',
    requestType: 'Complete Medical History',
    dateRange: 'Past 24 Months (2024 - 2026)',
    purpose: 'Insurance Claim',
    deliveryChannel: 'Patient Portal Download',
    status: 'Approved & Dispatched',
    requestedAt: '2026-08-28T11:00:00Z',
    reviewedBy: 'Rachel Gomez',
    reviewedAt: '2026-08-29T10:15:00Z',
    dispatchedAt: '2026-08-29T10:30:00Z',
    downloadUrl: '#',
    idProofAttached: true,
    notes: 'Redacted sensitive third-party notes. Dispatched cryptographically signed medical history PDF.',
  },
  {
    id: 'req-mr-002',
    requestNumber: 'MRR-2026-002',
    patientId: 'pat-002',
    patientName: 'Emily Watson',
    patientPhone: '+1 (555) 234-5678',
    patientEmail: 'emily.watson@example.com',
    requestType: 'Diagnostic Lab Reports',
    dateRange: 'Past 12 Months',
    purpose: 'Second Medical Opinion',
    deliveryChannel: 'Encrypted Email',
    status: 'Under Review',
    requestedAt: '2026-09-02T16:20:00Z',
    idProofAttached: true,
    notes: 'Patient requesting comprehensive endocrinology and pathology trend report.',
  }
];

// 7. Initial POS Terminals Configuration
export const INITIAL_POS_TERMINALS: PosTerminalConfig[] = [
  {
    id: 'pos-term-01',
    terminalId: 'POS-MC-01',
    merchantId: 'MRCH-APEX-8891',
    branchId: 'br-01',
    branchName: 'Main Medical Campus',
    counterName: 'Billing Counter #1 (OPD Lobby)',
    provider: 'Pine Labs Plutus Card Terminal',
    status: 'Active',
    dailyBatchNumber: 'BATCH-20260903-01',
    totalTransactionsToday: 18,
    totalCollectedToday: 4250.00,
  },
  {
    id: 'pos-term-02',
    terminalId: 'POS-MC-02',
    merchantId: 'MRCH-APEX-8891',
    branchId: 'br-01',
    branchName: 'Main Medical Campus',
    counterName: 'Pharmacy Dispensing POS Counter #3',
    provider: 'HDFC Ingenico SmartPOS',
    status: 'Active',
    dailyBatchNumber: 'BATCH-20260903-02',
    totalTransactionsToday: 32,
    totalCollectedToday: 3120.50,
  },
  {
    id: 'pos-term-03',
    terminalId: 'POS-DT-01',
    merchantId: 'MRCH-APEX-8892',
    branchId: 'br-02',
    branchName: 'Downtown Health Clinic',
    counterName: 'Reception Desk Swiping Machine',
    provider: 'Paytm Smart POS Terminal',
    status: 'Active',
    dailyBatchNumber: 'BATCH-20260903-03',
    totalTransactionsToday: 12,
    totalCollectedToday: 1980.00,
  }
];

// 8. Initial Payment Reconciliation Batches
export const INITIAL_RECONCILIATION_BATCHES: PaymentReconciliationBatch[] = [
  {
    id: 'recon-bt-01',
    batchNumber: 'REC-2026-0901-01',
    date: '2026-09-01',
    branchId: 'br-01',
    branchName: 'Main Medical Campus',
    settlementMethod: 'UPI',
    totalTransactions: 24,
    recordedAmount: 5640.00,
    bankSettledAmount: 5640.00,
    variance: 0.00,
    status: 'Reconciled',
    notes: 'All 24 NPCI UTR reference numbers matched bank statement automatically.',
    reconciledBy: 'Marcus Vance',
    reconciledAt: '2026-09-01T20:00:00Z',
  },
  {
    id: 'recon-bt-02',
    batchNumber: 'REC-2026-0901-02',
    date: '2026-09-01',
    branchId: 'br-01',
    branchName: 'Main Medical Campus',
    settlementMethod: 'POS Card',
    totalTransactions: 38,
    recordedAmount: 9280.00,
    bankSettledAmount: 9280.00,
    variance: 0.00,
    status: 'Reconciled',
    notes: 'Pine Labs terminal batch settlement report matched merchant credit advice.',
    reconciledBy: 'Marcus Vance',
    reconciledAt: '2026-09-01T20:30:00Z',
  },
  {
    id: 'recon-bt-03',
    batchNumber: 'REC-2026-0902-01',
    date: '2026-09-02',
    branchId: 'br-02',
    branchName: 'Downtown Health Clinic',
    settlementMethod: 'Cash',
    totalTransactions: 14,
    recordedAmount: 2150.00,
    bankSettledAmount: 2150.00,
    variance: 0.00,
    status: 'Reconciled',
    notes: 'Physical currency physical count verified against register tape.',
    reconciledBy: 'Rachel Gomez',
    reconciledAt: '2026-09-02T18:45:00Z',
  }
];

// 9. Initial Payment Refunds Record
export const INITIAL_PAYMENT_REFUNDS: PaymentRefundRecord[] = [
  {
    id: 'ref-pay-01',
    refundNumber: 'RFD-2026-0001',
    paymentRecordId: 'pay-mock-01',
    invoiceId: 'inv-002',
    invoiceNumber: 'INV-2026-0002',
    patientId: 'pat-002',
    patientName: 'Emily Watson',
    originalAmount: 120.00,
    refundAmount: 40.00,
    refundType: 'Partial Refund',
    refundMethod: 'Original Payment Method',
    reason: 'Duplicate lab charge removed after physician cancelled unneeded repeat lipid panel.',
    originalTransactionRef: 'TXN-UPI-9940129',
    refundTransactionRef: 'REV-UPI-8831002',
    status: 'Processed',
    requestedBy: 'Elena Rostova',
    approvedBy: 'Dr. Michael Chang, MD',
    processedBy: 'Marcus Vance',
    processedAt: '2026-08-25T14:30:00Z',
    auditNotes: 'Refund credited back to original UPI VPA. UTR reference attached to invoice audit log.',
    createdAt: '2026-08-25T11:00:00Z',
  }
];

// 10. Initial Central Notification Engine Config
export const INITIAL_NOTIFICATION_ENGINE_CONFIG: NotificationEngineConfig = {
  notificationsEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  whatsAppEnabled: true,
  defaultChannel: 'Email',
  whatsAppProvider: 'simulation',
  whatsAppAccessToken: '',
  whatsAppPhoneNumberId: '1092837465',
  whatsAppBusinessAccountId: '9827364510',
  smtpHost: 'smtp.sendgrid.net',
  smtpPort: 587,
  smtpSecure: true,
  smtpUser: 'apikey',
  smtpFromName: 'MediEra Healthcare Systems',
  smtpFromEmail: 'notifications@mediera.health',
  posPaymentsEnabled: true,
  posProvider: 'Pine Labs Plutus & HDFC Ingenico',
  posTerminalId: 'POS-MC-01',
  posMerchantId: 'MRCH-APEX-8891',
  posCurrency: 'INR',
  upiPaymentsEnabled: true,
  upiMerchantName: 'MediEra Healthcare Systems',
  upiMerchantVpa: 'mediera@icici',
  upiProvider: 'npci-bhim-upi',
  paymentGatewayEnabled: false,
  paymentGatewayProvider: 'Razorpay / Stripe',
  paymentGatewayMerchantId: 'rzp_test_mediera2026',
  paymentGatewayEnvironment: 'sandbox',
};

// 11. Initial System Notification Log Entries
export const INITIAL_SYSTEM_NOTIFICATIONS: SystemNotificationEntry[] = [
  {
    id: 'notif-001',
    event: 'appointment.confirmed',
    recipient: 'john.doe@example.com',
    recipientName: 'John Doe',
    recipientType: 'PATIENT',
    priority: 'NORMAL',
    channel: 'Email',
    templateName: 'appointment_confirmation_email',
    subject: 'Confirmed: Appointment with Dr. Sarah Jenkins on Sept 3, 2026',
    content: 'Dear John Doe, your appointment at Main Medical Campus has been confirmed for 09:30 AM. Token #101.',
    createdTime: '2026-09-01T10:00:00Z',
    sentTime: '2026-09-01T10:00:02Z',
    deliveryStatus: 'Delivered',
    readStatus: true,
    retryCount: 0,
    providerResponse: 'Delivered via SMTP (250 OK)',
    relatedPatientId: 'pat-001',
    relatedEntityId: 'apt-001',
    relatedEntityType: 'appointment',
  },
  {
    id: 'notif-002',
    event: 'appointment.confirmed',
    recipient: '+15551234567',
    recipientName: 'John Doe',
    recipientType: 'PATIENT',
    priority: 'NORMAL',
    channel: 'WhatsApp',
    templateName: 'appointment_confirmation_whatsapp',
    content: 'Hi John, your consultation with Dr. Sarah Jenkins is confirmed for Sept 3 at 09:30 AM. Token #101. Reply 1 to Confirm or 2 to Reschedule.',
    createdTime: '2026-09-01T10:00:00Z',
    sentTime: '2026-09-01T10:00:01Z',
    deliveryStatus: 'Read',
    readStatus: true,
    retryCount: 0,
    providerResponse: 'WhatsApp Cloud API Status: read',
    relatedPatientId: 'pat-001',
    relatedEntityId: 'apt-001',
    relatedEntityType: 'appointment',
  },
  {
    id: 'notif-003',
    event: 'patient.checked_in',
    recipient: 'dr.jenkins@apexhealth.org',
    recipientName: 'Dr. Sarah Jenkins, MD',
    recipientType: 'DOCTOR',
    priority: 'HIGH',
    channel: 'In-App',
    templateName: 'doctor_queue_alert',
    subject: 'Patient Checked In: John Doe (Token #101)',
    content: 'John Doe has arrived at Main Medical Campus. Vitals triage completed: BP 128/82, Pulse 72. Patient is waiting in Room 3.',
    createdTime: '2026-09-03T09:15:00Z',
    sentTime: '2026-09-03T09:15:00Z',
    deliveryStatus: 'Delivered',
    readStatus: true,
    retryCount: 0,
    relatedPatientId: 'pat-001',
    relatedEntityId: 'apt-001',
    relatedEntityType: 'appointment',
  },
  {
    id: 'notif-004',
    event: 'backoffice.critical_alert',
    recipient: '+15559990001',
    recipientName: 'Lead Systems Administrator',
    recipientType: 'BACKOFFICE',
    priority: 'CRITICAL',
    channel: 'WhatsApp',
    templateName: 'backoffice_critical_alert_whatsapp',
    content: '[CRITICAL BACKOFFICE ESCALATION] Lab Refrigerator Temperature Sensor Warning in Diagnostics Wing Room 104. Current Temp: 8.2°C (Threshold: 6.0°C). Duty engineer notified.',
    createdTime: '2026-09-03T06:30:00Z',
    sentTime: '2026-09-03T06:30:02Z',
    deliveryStatus: 'Delivered',
    readStatus: true,
    retryCount: 0,
    providerResponse: 'WhatsApp High-Priority Backoffice Escalation Delivered',
    relatedEntityId: 'crit-alert-891',
    relatedEntityType: 'system_alert',
  }
];

// 12. Initial Deterministic Workflow Rules
export const INITIAL_DETERMINISTIC_WORKFLOW_RULES: DeterministicWorkflowRule[] = [
  {
    id: 'wf-rule-01',
    name: 'Patient Appointment Confirmation & Dynamic Channel Routing',
    category: 'Appointment',
    triggerEvent: 'appointment.booked',
    conditions: [
      { field: 'status', operator: 'not_equals', value: 'Cancelled' }
    ],
    actions: [
      {
        type: 'send_patient_notification',
        config: {
          channels: ['In-App', 'Email'],
          template: 'appointment_confirmation',
          allowWhatsAppIfEnabled: true,
        }
      },
      {
        type: 'send_staff_notification',
        config: {
          recipientRole: 'Doctor',
          channel: 'In-App',
          template: 'new_appointment_scheduled',
        }
      }
    ],
    priority: 'Normal',
    isActive: true,
    executionCount: 142,
    lastExecutedAt: '2026-09-03T09:00:00Z',
  },
  {
    id: 'wf-rule-02',
    name: 'Patient Check-In & Nurse Triage Task Dispatch',
    category: 'Check-in',
    triggerEvent: 'patient.checked_in',
    conditions: [
      { field: 'status', operator: 'equals', value: 'Waiting' }
    ],
    actions: [
      {
        type: 'create_staff_task',
        config: {
          title: 'Record Patient Vitals & Triage',
          requiredResponsibility: 'Triage Assessment',
          department: 'Nursing & Inpatient',
          priority: 'High',
          dueMinutes: 15,
        }
      },
      {
        type: 'send_staff_notification',
        config: {
          recipientRole: 'Doctor',
          channel: 'In-App',
          template: 'patient_arrived_queue_alert',
        }
      }
    ],
    priority: 'High',
    isActive: true,
    executionCount: 98,
    lastExecutedAt: '2026-09-03T09:15:00Z',
  },
  {
    id: 'wf-rule-03',
    name: 'Consultation Completed & Automated e-Rx / Bill Generation',
    category: 'Consultation',
    triggerEvent: 'consultation.completed',
    conditions: [
      { field: 'hasPrescription', operator: 'is_true', value: true }
    ],
    actions: [
      {
        type: 'create_staff_task',
        config: {
          title: 'Prepare Pharmacy Dispensing Package',
          requiredResponsibility: 'Pharmacy Dispensing',
          department: 'Pharmacy & Formulary',
          priority: 'Normal',
          dueMinutes: 30,
        }
      },
      {
        type: 'send_patient_notification',
        config: {
          channels: ['In-App', 'Email'],
          template: 'prescription_and_summary_ready',
          allowWhatsAppIfEnabled: true,
        }
      }
    ],
    priority: 'Normal',
    isActive: true,
    executionCount: 76,
    lastExecutedAt: '2026-09-02T16:45:00Z',
  },
  {
    id: 'wf-rule-04',
    name: 'External Payment Recorded & Financial Receipt Reconciliation',
    category: 'Payment',
    triggerEvent: 'payment.recorded',
    conditions: [
      { field: 'amount', operator: 'greater_than', value: 0 }
    ],
    actions: [
      {
        type: 'generate_receipt',
        config: { autoPrint: false, format: 'PDF & Thermal' }
      },
      {
        type: 'send_patient_notification',
        config: {
          channels: ['In-App', 'Email'],
          template: 'payment_receipt_issued',
          allowWhatsAppIfEnabled: true,
        }
      }
    ],
    priority: 'High',
    isActive: true,
    executionCount: 184,
    lastExecutedAt: '2026-09-03T10:00:00Z',
  },
  {
    id: 'wf-rule-05',
    name: 'Backoffice Critical Alert Escalation Policy',
    category: 'Backoffice Alert',
    triggerEvent: 'backoffice.critical_alert',
    conditions: [
      { field: 'priority', operator: 'equals', value: 'CRITICAL' }
    ],
    actions: [
      {
        type: 'send_backoffice_whatsapp',
        config: {
          recipients: ['Administrator', 'Medical Director', 'Duty Operations Lead'],
          template: 'critical_operational_alert',
          requiresWhatsAppEnabled: true,
        }
      }
    ],
    priority: 'Critical',
    isActive: true,
    executionCount: 7,
    lastExecutedAt: '2026-09-03T06:30:00Z',
  }
];
