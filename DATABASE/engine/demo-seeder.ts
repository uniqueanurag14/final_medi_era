import bcrypt from 'bcryptjs';
import type { DatabaseClient } from './connection.ts';

/**
 * MediEra Medical CRM + ERP System
 * Demo Environment Dataset Seeder
 * Populates realistic healthcare data for clinics, branches, doctors,
 * schedules, patients, appointments, and inventory.
 */
export async function seedDemoDataset(client: DatabaseClient): Promise<{
  organizations: number;
  branches: number;
  doctors: number;
  schedules: number;
  patients: number;
  appointments: number;
  inventory: number;
}> {
  const isMysql = client.config.dialect === 'mysql';

  console.log('🌱 Seeding MediEra Demo Healthcare Dataset...');

  // 1. Seed Organizations
  const orgs = [
    {
      name: 'MediEra Healthcare Systems',
      legalName: 'MediEra Global Healthcare Private Limited',
      orgType: 'HOSPITAL',
      regNo: 'MED-IND-2024-8891',
      pan: 'AAACM4421K',
      gst: '27AAACM4421K1ZB',
      contactPerson: 'Dr. Arthur Campbell, Chief Medical Officer',
      mobile: '+91 98201 11223',
      email: 'contact@mediera.org',
      website: 'https://mediera.health',
      address: 'Suite 400, MediEra Health Tech Tower, BKC Medical Enclave',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400051',
    },
    {
      name: 'Apex Multispecialty & Heart Center',
      legalName: 'Apex Healthcare Ventures LLP',
      orgType: 'CLINIC',
      regNo: 'APX-CLINIC-7712',
      pan: 'ABDFP8829M',
      gst: '27ABDFP8829M1ZC',
      contactPerson: 'Dr. Meera Nambiar',
      mobile: '+91 98202 33445',
      email: 'care@apexheart.mediera.org',
      website: 'https://apex.mediera.health',
      address: '12 Linking Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400050',
    },
  ];

  const orgIds: number[] = [];
  for (const org of orgs) {
    const existing = await client.query<{ id: number }>(
      isMysql ? 'SELECT id FROM organizations WHERE name = ? LIMIT 1' : 'SELECT id FROM organizations WHERE name = $1 LIMIT 1',
      [org.name]
    );
    if (existing.length > 0) {
      orgIds.push(existing[0].id);
    } else {
      if (isMysql) {
        await client.execute(
          `INSERT INTO organizations (
            name, legal_name, org_type, registration_number, pan, gst_number,
            primary_contact_person, primary_mobile, primary_email, website,
            address, city, state, pin_code, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [org.name, org.legalName, org.orgType, org.regNo, org.pan, org.gst, org.contactPerson, org.mobile, org.email, org.website, org.address, org.city, org.state, org.pinCode]
        );
        const [row] = await client.query<{ id: number }>('SELECT id FROM organizations WHERE name = ? LIMIT 1', [org.name]);
        orgIds.push(row.id);
      } else {
        const rows = await client.query<{ id: number }>(
          `INSERT INTO organizations (
            name, legal_name, org_type, registration_number, pan, gst_number,
            primary_contact_person, primary_mobile, primary_email, website,
            address, city, state, pin_code, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'ACTIVE')
          RETURNING id`,
          [org.name, org.legalName, org.orgType, org.regNo, org.pan, org.gst, org.contactPerson, org.mobile, org.email, org.website, org.address, org.city, org.state, org.pinCode]
        );
        orgIds.push(rows[0].id);
      }
    }
  }

  const primaryOrgId = orgIds[0];

  // 2. Seed Branches
  const branches = [
    {
      orgId: primaryOrgId,
      name: 'MediEra Central Flagship Hospital',
      code: 'MED-B1-BKC',
      branchType: 'HOSPITAL',
      contactPerson: 'Sarah Lin, Branch Administrator',
      phone: '+91 22 6123 4567',
      email: 'central.reception@mediera.health',
      address: 'Tower A, Floor 1-4, BKC Complex, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400051',
      isMain: true,
    },
    {
      orgId: primaryOrgId,
      name: 'MediEra Downtown Polyclinic',
      code: 'MED-B2-SWR',
      branchType: 'CLINIC',
      contactPerson: 'David Ross, Front Desk Lead',
      phone: '+91 22 6234 5678',
      email: 'downtown@mediera.health',
      address: '44 Churchgate Chambers, Marine Lines',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400020',
      isMain: false,
    },
    {
      orgId: primaryOrgId,
      name: 'MediEra North Suburban Clinic',
      code: 'MED-B3-AND',
      branchType: 'CLINIC',
      contactPerson: 'Priya Sharma, Clinic In-Charge',
      phone: '+91 22 6345 6789',
      email: 'north@mediera.health',
      address: '77 SV Road, Near Metro Station, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400058',
      isMain: false,
    },
  ];

  const branchIds: number[] = [];
  for (const b of branches) {
    const existing = await client.query<{ id: number }>(
      isMysql ? 'SELECT id FROM branches WHERE code = ? LIMIT 1' : 'SELECT id FROM branches WHERE code = $1 LIMIT 1',
      [b.code]
    );
    if (existing.length > 0) {
      branchIds.push(existing[0].id);
    } else {
      if (isMysql) {
        await client.execute(
          `INSERT INTO branches (
            organization_id, name, code, branch_type, contact_person,
            reception_mobile, email, address, city, state, pin_code, is_main_branch, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [b.orgId, b.name, b.code, b.branchType, b.contactPerson, b.phone, b.email, b.address, b.city, b.state, b.pinCode, b.isMain ? 1 : 0]
        );
        const [row] = await client.query<{ id: number }>('SELECT id FROM branches WHERE code = ? LIMIT 1', [b.code]);
        branchIds.push(row.id);
      } else {
        const rows = await client.query<{ id: number }>(
          `INSERT INTO branches (
            organization_id, name, code, branch_type, contact_person,
            reception_mobile, email, address, city, state, pin_code, is_main_branch, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ACTIVE')
          RETURNING id`,
          [b.orgId, b.name, b.code, b.branchType, b.contactPerson, b.phone, b.email, b.address, b.city, b.state, b.pinCode, b.isMain]
        );
        branchIds.push(rows[0].id);
      }
    }
  }

  const primaryBranchId = branchIds[0];

  // 3. Seed Doctors
  const doctors = [
    {
      fullName: 'Dr. Ananya Mehta',
      email: 'dr.ananya@mediera.health',
      phone: '+91 98201 55667',
      regNo: 'MCI-MH-44912',
      council: 'Maharashtra Medical Council',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
      specialization: 'Cardiology',
      subSpecialization: 'Interventional Cardiology & Preventive Health',
      experienceYears: 14,
      consultationFee: 1200,
      followUpFee: 600,
      bio: 'Senior Interventional Cardiologist specializing in acute coronary syndromes, echocardiography, and non-invasive cardiovascular therapeutics.',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    },
    {
      fullName: 'Dr. Rajesh Sen',
      email: 'dr.rajesh@mediera.health',
      phone: '+91 98202 66778',
      regNo: 'MCI-MH-33821',
      council: 'Maharashtra Medical Council',
      qualification: 'MBBS, MD (Pediatrics)',
      specialization: 'Pediatrics',
      subSpecialization: 'Neonatology & Pediatric Critical Care',
      experienceYears: 16,
      consultationFee: 1000,
      followUpFee: 500,
      bio: 'Chief of Pediatrics dedicated to newborn critical care, immunization schedules, and developmental assessments.',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    },
    {
      fullName: 'Dr. Sarah Sharma',
      email: 'dr.sarah@mediera.health',
      phone: '+91 98203 77889',
      regNo: 'MCI-MH-55219',
      council: 'Maharashtra Medical Council',
      qualification: 'MBBS, MS (Orthopedics), M.Ch',
      specialization: 'Orthopedics',
      subSpecialization: 'Arthroscopy, Joint Replacement & Sports Injuries',
      experienceYears: 11,
      consultationFee: 1100,
      followUpFee: 550,
      bio: 'Consultant Orthopedic Surgeon with extensive expertise in computer-navigated knee/hip replacement and sports trauma rehabilitation.',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813629-67d938b813fd?auto=format&fit=crop&w=600&q=80',
    },
    {
      fullName: 'Dr. Vikram Patil',
      email: 'dr.vikram@mediera.health',
      phone: '+91 98204 88990',
      regNo: 'MCI-MH-66103',
      council: 'Maharashtra Medical Council',
      qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
      specialization: 'Dermatology',
      subSpecialization: 'Clinical Dermatology & Laser Aesthetics',
      experienceYears: 9,
      consultationFee: 900,
      followUpFee: 450,
      bio: 'Expert dermatologist specializing in chronic skin disorders, psoriasis biologics, allergic dermatoses, and diagnostic dermatopathology.',
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const doctorIds: number[] = [];
  for (const doc of doctors) {
    const existing = await client.query<{ id: number }>(
      isMysql ? 'SELECT id FROM doctors WHERE email = ? LIMIT 1' : 'SELECT id FROM doctors WHERE email = $1 LIMIT 1',
      [doc.email]
    );
    if (existing.length > 0) {
      doctorIds.push(existing[0].id);
    } else {
      if (isMysql) {
        await client.execute(
          `INSERT INTO doctors (
            organization_id, full_name, email, phone, medical_registration_number,
            medical_council, qualification, specialization, sub_specialization,
            experience_years, bio, default_consultation_fee, default_follow_up_fee,
            consultation_fee, avatar_url, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [
            primaryOrgId, doc.fullName, doc.email, doc.phone, doc.regNo,
            doc.council, doc.qualification, doc.specialization, doc.subSpecialization,
            doc.experienceYears, doc.bio, doc.consultationFee, doc.followUpFee,
            doc.consultationFee, doc.avatarUrl
          ]
        );
        const [row] = await client.query<{ id: number }>('SELECT id FROM doctors WHERE email = ? LIMIT 1', [doc.email]);
        doctorIds.push(row.id);
      } else {
        const rows = await client.query<{ id: number }>(
          `INSERT INTO doctors (
            organization_id, full_name, email, phone, medical_registration_number,
            medical_council, qualification, specialization, sub_specialization,
            experience_years, bio, default_consultation_fee, default_follow_up_fee,
            consultation_fee, avatar_url, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'ACTIVE')
          RETURNING id`,
          [
            primaryOrgId, doc.fullName, doc.email, doc.phone, doc.regNo,
            doc.council, doc.qualification, doc.specialization, doc.subSpecialization,
            doc.experienceYears, doc.bio, doc.consultationFee, doc.followUpFee,
            doc.consultationFee, doc.avatarUrl
          ]
        );
        doctorIds.push(rows[0].id);
      }
    }
  }

  // 4. Doctor Branch Assignments & Schedules
  let scheduleCount = 0;
  for (let idx = 0; idx < doctorIds.length; idx++) {
    const docId = doctorIds[idx];
    const bId = branchIds[idx % branchIds.length];

    const existingAssignment = await client.query<{ id: number }>(
      isMysql
        ? 'SELECT id FROM doctor_branch_assignments WHERE doctor_id = ? AND branch_id = ? LIMIT 1'
        : 'SELECT id FROM doctor_branch_assignments WHERE doctor_id = $1 AND branch_id = $2 LIMIT 1',
      [docId, bId]
    );

    let assignmentId: number;
    if (existingAssignment.length > 0) {
      assignmentId = existingAssignment[0].id;
    } else {
      if (isMysql) {
        await client.execute(
          `INSERT INTO doctor_branch_assignments (
            doctor_id, branch_id, consultation_fee, follow_up_fee, slot_duration_minutes, room_number, status
          ) VALUES (?, ?, 1000, 500, 20, ?, 'ACTIVE')`,
          [docId, bId, `Room 30${idx + 1}`]
        );
        const [aRow] = await client.query<{ id: number }>(
          'SELECT id FROM doctor_branch_assignments WHERE doctor_id = ? AND branch_id = ? LIMIT 1',
          [docId, bId]
        );
        assignmentId = aRow.id;
      } else {
        const aRows = await client.query<{ id: number }>(
          `INSERT INTO doctor_branch_assignments (
            doctor_id, branch_id, consultation_fee, follow_up_fee, slot_duration_minutes, room_number, status
          ) VALUES ($1, $2, 1000, 500, 20, $3, 'ACTIVE') RETURNING id`,
          [docId, bId, `Room 30${idx + 1}`]
        );
        assignmentId = aRows[0].id;
      }
    }

    // Seed Schedules for Mon-Fri
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of days) {
      const existingSchedule = await client.query(
        isMysql
          ? 'SELECT id FROM doctor_schedules WHERE doctor_branch_assignment_id = ? AND day_of_week = ? LIMIT 1'
          : 'SELECT id FROM doctor_schedules WHERE doctor_branch_assignment_id = $1 AND day_of_week = $2 LIMIT 1',
        [assignmentId, day]
      );

      if (existingSchedule.length === 0) {
        await client.execute(
          isMysql
            ? `INSERT INTO doctor_schedules (
                doctor_branch_assignment_id, doctor_id, branch_id, day_of_week,
                session_name, start_time, end_time, slot_duration_minutes, max_patients, is_active
              ) VALUES (?, ?, ?, ?, 'Morning Consultation', '09:00', '13:00', 20, 12, 1)`
            : `INSERT INTO doctor_schedules (
                doctor_branch_assignment_id, doctor_id, branch_id, day_of_week,
                session_name, start_time, end_time, slot_duration_minutes, max_patients, is_active
              ) VALUES ($1, $2, $3, $4, 'Morning Consultation', '09:00', '13:00', 20, 12, true)`,
          [assignmentId, docId, bId, day]
        );
        scheduleCount++;
      }
    }
  }

  // 5. Seed Demo Patients
  const patients = [
    {
      uhid: 'UHID-2026-0001',
      firstName: 'Johnathan',
      lastName: 'Doe',
      fullName: 'Johnathan Doe',
      email: 'john.doe@example.com',
      phone: '+91 98111 22334',
      gender: 'Male',
      dob: '1984-06-12',
      bloodGroup: 'O+',
      city: 'Mumbai',
      medicalHistory: 'Mild essential hypertension diagnosed 2021; well controlled on ACE inhibitors.',
      allergies: 'Penicillin (mild cutaneous hives)',
    },
    {
      uhid: 'UHID-2026-0002',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+91 98111 33445',
      gender: 'Female',
      dob: '1990-11-23',
      bloodGroup: 'A+',
      city: 'Mumbai',
      medicalHistory: 'Seasonal allergic rhinitis; episodic migraine without aura.',
      allergies: 'Sulfa drugs',
    },
    {
      uhid: 'UHID-2026-0003',
      firstName: 'Michael',
      lastName: 'Chen',
      fullName: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+91 98111 44556',
      gender: 'Male',
      dob: '1968-03-15',
      bloodGroup: 'B+',
      city: 'Mumbai',
      medicalHistory: 'Type 2 Diabetes Mellitus managed with Metformin; dyslipidemia.',
      allergies: 'No known drug allergies (NKDA)',
    },
    {
      uhid: 'UHID-2026-0004',
      firstName: 'Pooja',
      lastName: 'Sharma',
      fullName: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      phone: '+91 98111 55667',
      gender: 'Female',
      dob: '1996-08-09',
      bloodGroup: 'AB+',
      city: 'Mumbai',
      medicalHistory: 'Post-arthroscopic ACL reconstruction (left knee, 2024); uneventful recovery.',
      allergies: 'Aspirin (bronchospasm)',
    },
  ];

  const patientIds: number[] = [];
  for (const p of patients) {
    const existing = await client.query<{ id: number }>(
      isMysql ? 'SELECT id FROM patients WHERE uhid = ? LIMIT 1' : 'SELECT id FROM patients WHERE uhid = $1 LIMIT 1',
      [p.uhid]
    );
    if (existing.length > 0) {
      patientIds.push(existing[0].id);
    } else {
      if (isMysql) {
        await client.execute(
          `INSERT INTO patients (
            organization_id, branch_id, uhid, first_name, last_name, full_name,
            email, phone, gender, dob, blood_group, city, medical_history, allergies, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
          [primaryOrgId, primaryBranchId, p.uhid, p.firstName, p.lastName, p.fullName, p.email, p.phone, p.gender, p.dob, p.bloodGroup, p.city, p.medicalHistory, p.allergies]
        );
        const [row] = await client.query<{ id: number }>('SELECT id FROM patients WHERE uhid = ? LIMIT 1', [p.uhid]);
        patientIds.push(row.id);
      } else {
        const rows = await client.query<{ id: number }>(
          `INSERT INTO patients (
            organization_id, branch_id, uhid, first_name, last_name, full_name,
            email, phone, gender, dob, blood_group, city, medical_history, allergies, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'ACTIVE')
          RETURNING id`,
          [primaryOrgId, primaryBranchId, p.uhid, p.firstName, p.lastName, p.fullName, p.email, p.phone, p.gender, p.dob, p.bloodGroup, p.city, p.medicalHistory, p.allergies]
        );
        patientIds.push(rows[0].id);
      }
    }
  }

  // 6. Seed Demo Appointments
  const today = new Date().toISOString().split('T')[0];
  const appointments = [
    {
      docId: doctorIds[0],
      patId: patientIds[0],
      date: today,
      start: '10:00',
      end: '10:20',
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      reason: 'Routine quarterly cardiac health evaluation and blood pressure titration.',
      fee: 1200,
    },
    {
      docId: doctorIds[1],
      patId: patientIds[1],
      date: today,
      start: '11:00',
      end: '11:20',
      type: 'FOLLOW_UP',
      status: 'SCHEDULED',
      reason: 'Pediatric allergic symptoms follow-up and immunization schedule review.',
      fee: 500,
    },
    {
      docId: doctorIds[2],
      patId: patientIds[2],
      date: today,
      start: '14:30',
      end: '14:50',
      type: 'CONSULTATION',
      status: 'COMPLETED',
      reason: 'Post-surgical joint motion assessment and gait review.',
      fee: 1100,
    },
    {
      docId: doctorIds[3],
      patId: patientIds[3],
      date: today,
      start: '16:00',
      end: '16:20',
      type: 'CONSULTATION',
      status: 'CONFIRMED',
      reason: 'Dermatological screening for persistent contact eczema.',
      fee: 900,
    },
  ];

  let appointmentCount = 0;
  for (const appt of appointments) {
    const existing = await client.query(
      isMysql
        ? 'SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? AND appointment_date = ? AND start_time = ? LIMIT 1'
        : 'SELECT id FROM appointments WHERE doctor_id = $1 AND patient_id = $2 AND appointment_date = $3 AND start_time = $4 LIMIT 1',
      [appt.docId, appt.patId, appt.date, appt.start]
    );

    if (existing.length === 0) {
      await client.execute(
        isMysql
          ? `INSERT INTO appointments (
              organization_id, branch_id, doctor_id, patient_id, appointment_date,
              start_time, end_time, appointment_type, status, reason, consultation_fee
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          : `INSERT INTO appointments (
              organization_id, branch_id, doctor_id, patient_id, appointment_date,
              start_time, end_time, appointment_type, status, reason, consultation_fee
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [primaryOrgId, primaryBranchId, appt.docId, appt.patId, appt.date, appt.start, appt.end, appt.type, appt.status, appt.reason, appt.fee]
      );
      appointmentCount++;
    }
  }

  // 7. Seed Demo Medical Inventory Items
  const inventoryItems = [
    {
      name: 'Amoxicillin + Clavulanic Acid 625mg',
      sku: 'MED-AMX-625',
      batch: 'BAT-2026-901',
      expiry: '2027-12-31',
      mfr: 'Cipla Therapeutics',
      qty: 450,
      costPrice: 120,
      sellPrice: 195,
      reorder: 50,
      location: 'Aisle 2, Bin 14',
    },
    {
      name: 'Atorvastatin 20mg Tablets',
      sku: 'MED-ATV-020',
      batch: 'BAT-2026-882',
      expiry: '2027-09-30',
      mfr: 'Sun Pharma',
      qty: 600,
      costPrice: 85,
      sellPrice: 140,
      reorder: 80,
      location: 'Aisle 3, Bin 08',
    },
    {
      name: 'Metformin Hydrochloride 500mg SR',
      sku: 'MED-MET-500',
      batch: 'BAT-2026-411',
      expiry: '2028-03-31',
      mfr: 'Dr. Reddy Laboratories',
      qty: 1200,
      costPrice: 42,
      sellPrice: 75,
      reorder: 150,
      location: 'Aisle 1, Bin 22',
    },
    {
      name: 'Sterile Surgical Glove Pairs (Size 7.5)',
      sku: 'CON-SGL-075',
      batch: 'BAT-2026-104',
      expiry: '2029-05-31',
      mfr: 'Ansell Healthcare',
      qty: 850,
      costPrice: 35,
      sellPrice: 65,
      reorder: 100,
      location: 'Storage Bay B, Shelf 4',
    },
    {
      name: 'Disposable Blood Collection Tubes (EDTA K2 3ml)',
      sku: 'LAB-TUB-EDTA',
      batch: 'BAT-2026-619',
      expiry: '2027-11-30',
      mfr: 'BD Diagnostics',
      qty: 1500,
      costPrice: 14,
      sellPrice: 28,
      reorder: 200,
      location: 'Lab Supply Cabinet 02',
    },
  ];

  let inventoryCount = 0;
  for (const item of inventoryItems) {
    const existing = await client.query(
      isMysql ? 'SELECT id FROM inventory_items WHERE sku = ? LIMIT 1' : 'SELECT id FROM inventory_items WHERE sku = $1 LIMIT 1',
      [item.sku]
    );

    if (existing.length === 0) {
      await client.execute(
        isMysql
          ? `INSERT INTO inventory_items (
              organization_id, branch_id, item_name, name, sku, batch_number,
              expiry_date, manufacturer, quantity, current_stock, purchase_price,
              cost_price, selling_price, reorder_level, storage_location, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`
          : `INSERT INTO inventory_items (
              organization_id, branch_id, item_name, name, sku, batch_number,
              expiry_date, manufacturer, quantity, current_stock, purchase_price,
              cost_price, selling_price, reorder_level, storage_location, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'ACTIVE')`,
        [
          primaryOrgId, primaryBranchId, item.name, item.name, item.sku,
          item.batch, item.expiry, item.mfr, item.qty, item.qty,
          item.costPrice, item.costPrice, item.sellPrice, item.reorder, item.location
        ]
      );
      inventoryCount++;
    }
  }

  const [totalOrgs, totalBranches, totalDoctors, totalSchedules, totalPatients, totalAppointments, totalInventory] = await Promise.all([
    client.countRows('organizations').catch(() => orgIds.length),
    client.countRows('branches').catch(() => branchIds.length),
    client.countRows('doctors').catch(() => doctorIds.length),
    client.countRows('doctor_schedules').catch(() => scheduleCount),
    client.countRows('patients').catch(() => patientIds.length),
    client.countRows('appointments').catch(() => appointmentCount),
    client.countRows('inventory_items').catch(() => inventoryCount),
  ]);

  return {
    organizations: totalOrgs,
    branches: totalBranches,
    doctors: totalDoctors,
    schedules: totalSchedules,
    patients: totalPatients,
    appointments: totalAppointments,
    inventory: totalInventory,
  };
}
