import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { useAuth } from '../../context/AuthContext';
import { Appointment, Patient, PrescriptionItem, LabTest, Consultation, PrescriptionTemplate } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Patient360Drawer } from '../../components/common/Patient360Drawer';
import {
  Activity,
  User,
  Clock,
  HeartPulse,
  AlertTriangle,
  Stethoscope,
  Pill,
  FlaskConical,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Printer,
  ChevronRight,
  Sparkles,
  FileText,
  DollarSign,
  Eye,
  Layers,
  Thermometer,
  RotateCcw
} from 'lucide-react';

interface DoctorQueuePageProps {
  onOpenPrintModal: (type: any, data: any) => void;
  onNavigate: (view: string) => void;
}

export const DoctorQueuePage: React.FC<DoctorQueuePageProps> = ({
  onOpenPrintModal,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const doctors = dbService.doctors;
  const templates = dbService.prescriptionTemplates;

  // Active Doctor Selection (defaults to logged-in user or first doctor)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    doctors.find((d) => d.id === currentUser?.id)?.id || doctors[0]?.id || ''
  );
  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const [selectedDate, setSelectedDate] = useState('2026-09-01');
  const appointments = currentDoctor
    ? dbService.appointments.filter(
        (a) => a.doctorId === currentDoctor.id && a.date === selectedDate
      )
    : [];

  // Active selected appointment for consultation
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    appointments[0]?.id || ''
  );

  const selectedAppt = appointments.find((a) => a.id === selectedAppointmentId) || appointments[0];
  const patient = selectedAppt ? dbService.patients.find((p) => p.id === selectedAppt.patientId) : null;

  // 360 Drawer state
  const [drawerPatientId, setDrawerPatientId] = useState<string | null>(null);

  // Consultation Builder Form State
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('Essential Hypertension & Fatigue');
  const [examinationNotes, setExaminationNotes] = useState('Chest clear on auscultation. S1/S2 heard. No peripheral edema.');
  const [advice, setAdvice] = useState('Low sodium diet (<2g/day), brisk walking 30 mins daily. Hydrate well.');
  const [followUpDate, setFollowUpDate] = useState('2026-09-15');

  // Quick Vitals update during visit
  const [visitBp, setVisitBp] = useState('120/80');
  const [visitPulse, setVisitPulse] = useState('74');
  const [visitSpo2, setVisitSpo2] = useState('98');
  const [visitTemp, setVisitTemp] = useState('98.6');
  const [visitWeight, setVisitWeight] = useState('72');

  // Prescribed items list
  const [prescribedMeds, setPrescribedMeds] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      medicineName: 'Telmisartan 40mg',
      dosage: '1 Tab',
      route: 'Oral',
      frequency: 'Once Daily (1-0-0)',
      duration: '30 Days',
      timing: 'Morning (Before Food)',
      instructions: 'Take regularly at 8:00 AM',
    },
    {
      id: 'item-2',
      medicineName: 'Atorvastatin 20mg',
      dosage: '1 Tab',
      route: 'Oral',
      frequency: 'Once Daily (0-0-1)',
      duration: '30 Days',
      timing: 'Bedtime (After Food)',
      instructions: 'Take after dinner',
    },
  ]);

  // Lab Tests list
  const [orderedLabTests, setOrderedLabTests] = useState<string[]>([
    'Lipid Profile Comprehensive',
    'Serum Creatinine & eGFR',
  ]);

  // New med inputs
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('1 Tab');
  const [newMedFreq, setNewMedFreq] = useState('Once Daily (1-0-0)');
  const [newMedDuration, setNewMedDuration] = useState('15 Days');
  const [newMedTiming, setNewMedTiming] = useState('Morning');

  const handleApplyTemplate = (template: PrescriptionTemplate) => {
    setDiagnosis(template.diagnosisDefault);
    setAdvice(template.adviceDefault);
    setPrescribedMeds(
      template.items.map((item, idx) => ({
        id: `tpl-${Date.now()}-${idx}`,
        medicineName: item.medicineName,
        dosage: item.dosage,
        route: item.route,
        frequency: item.frequency,
        duration: item.duration,
        timing: item.timing,
        instructions: item.instructions || 'As prescribed',
      }))
    );
  };

  const handleAddMedicine = () => {
    if (!newMedName) return;
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}`,
      medicineName: newMedName,
      dosage: newMedDose,
      route: 'Oral',
      frequency: newMedFreq,
      duration: newMedDuration,
      timing: newMedTiming,
      instructions: 'As directed by physician',
    };
    setPrescribedMeds([...prescribedMeds, newItem]);
    setNewMedName('');
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescribedMeds(prescribedMeds.filter((m) => m.id !== id));
  };

  const handleToggleLab = (testName: string) => {
    if (orderedLabTests.includes(testName)) {
      setOrderedLabTests(orderedLabTests.filter((t) => t !== testName));
    } else {
      setOrderedLabTests([...orderedLabTests, testName]);
    }
  };

  const handleCallPatient = (appt: Appointment) => {
    dbService.updateAppointmentStatus(appt.id, 'In Consultation');
    setSelectedAppointmentId(appt.id);
  };

  const handleCompleteConsultation = () => {
    if (!selectedAppt || !patient) return;

    try {
      // 1. Create Consultation in DB
      const consultation = dbService.createConsultation({
        organizationId: 'org-01',
        branchId: currentDoctor.branchId,
        appointmentId: selectedAppt.id,
        patientId: patient.id,
        doctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        doctorSpecialty: currentDoctor.specialtyName,
        date: selectedDate,
        chiefComplaint: selectedAppt.chiefComplaint,
        symptoms: symptoms ? symptoms.split(',').map((s) => s.trim()) : ['Routine review'],
        examinationNotes,
        diagnosis,
        advice,
        followUpDate,
      });

      // 2. Create Prescription
      const prescription = dbService.createPrescription({
        organizationId: 'org-01',
        branchId: currentDoctor.branchId,
        consultationId: consultation.id,
        patientId: patient.id,
        doctorId: currentDoctor.id,
        diagnosis,
        items: prescribedMeds,
        advice,
        followUpDate,
      });

      // 3. Create Lab Order if any tests selected
      if (orderedLabTests.length > 0) {
        dbService.createLabOrder({
          organizationId: 'org-01',
          branchId: currentDoctor.branchId,
          consultationId: consultation.id,
          patientId: patient.id,
          doctorId: currentDoctor.id,
          tests: orderedLabTests.map((t) => ({
            testName: t,
            resultValue: 'Pending',
            normalRange: 'Standard',
            units: '',
            isAbnormal: false,
          })),
          doctorRemarks: `Follow up required after ${orderedLabTests.join(', ')} results.`,
        });
      }

      // 4. Update appointment status to Completed
      dbService.updateAppointmentStatus(selectedAppt.id, 'Completed');

      // 5. Open print modal with newly generated prescription
      onOpenPrintModal('prescription', { prescription });
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error completing consultation.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {currentDoctor ? (
          <div className="flex items-center gap-3">
            <img
              src={currentDoctor.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
              alt={currentDoctor.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-600 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-950">{currentDoctor.name}</h1>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  {currentDoctor.specialtyName} • Room {currentDoctor.roomNumber || '101'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Live OPD Consultation Board, EHR Timeline Review & Clinical Prescription Builder
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950">OPD Consultation Desk</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                No active physician selected or configured in the roster.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Doctor Switcher */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={selectedDoctorId}
              onChange={(e) => {
                setSelectedDoctorId(e.target.value);
                setSelectedAppointmentId('');
              }}
              className="font-bold text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialtyName})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-slate-900 bg-transparent focus:outline-hidden cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left OPD Queue | Right Consultation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Live OPD Queue List */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900">
                Today's OPD Queue ({appointments.length})
              </h2>
              <p className="text-[11px] text-slate-400">Date: {selectedDate}</p>
            </div>
            <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-200">
              {appointments.filter((a) => a.status === 'In Consultation').length} In Chamber
            </span>
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                No patient appointments scheduled for this physician today.
              </div>
            ) : (
              appointments.map((appt) => {
                const isSelected = selectedAppt?.id === appt.id;
                return (
                  <div
                    key={appt.id}
                    onClick={() => setSelectedAppointmentId(appt.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-500 shadow-sm ring-2 ring-teal-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-teal-300 font-mono font-black text-xs flex items-center justify-center">
                          #{appt.tokenNumber || '—'}
                        </span>
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs">{appt.patientName}</h3>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {appt.patientAge}y, {appt.patientGender} • Slot: {appt.timeSlot}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>

                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                      "{appt.chiefComplaint || 'General consultation'}"
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerPatientId(appt.patientId);
                        }}
                        className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Patient 360
                      </button>

                      {appt.status !== 'In Consultation' && appt.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallPatient(appt);
                          }}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Activity className="w-3 h-3" />
                          Call Inside
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Active Consultation Workspace */}
        <div className="lg:col-span-8 space-y-5">
          {!selectedAppt || !patient ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <Stethoscope className="w-12 h-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-base">Select a Patient to Begin Consultation</h3>
              <p className="text-xs text-slate-400">Click any token from the queue on the left to start the clinical encounter.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs">
              {/* Active Patient Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 font-black text-lg flex items-center justify-center border border-teal-500/30">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-white">{patient.firstName} {patient.lastName}</h2>
                      <span className="font-mono text-xs text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                        {patient.patientId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {patient.gender} • {2026 - parseInt(patient.dateOfBirth.split('-')[0])} yrs • Blood Group: <strong className="text-rose-400">{patient.bloodGroup}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrawerPatientId(patient.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-400" />
                    Full Dossier 360
                  </button>
                  <button
                    onClick={handleCompleteConsultation}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Finish & Sign Rx
                  </button>
                </div>
              </div>

              {/* Allergy Warning Alert */}
              {patient.allergies.length > 0 && !patient.allergies.includes('None Known') && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-900 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>ALLERGY WARNING: {patient.allergies.join(', ')}</span>
                </div>
              )}

              {/* Fast Template Selector */}
              <div className="p-3 bg-teal-50/50 border border-teal-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    1-Click Clinical Rx Templates:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="px-2.5 py-1 bg-white hover:bg-teal-600 hover:text-white border border-teal-300 text-teal-900 rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                    >
                      + {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Assessment & Diagnosis Fields */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Chief Complaint & Symptoms</label>
                    <input
                      type="text"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g. Headache, dizziness, palpitations for 3 days"
                      className="w-full p-2 border border-slate-300 rounded-xl focus:outline-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Primary Clinical Diagnosis *</label>
                    <input
                      type="text"
                      required
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Essential Hypertension (Stage 1)"
                      className="w-full p-2 border border-slate-300 rounded-xl focus:outline-teal-600 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Physical Examination & Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={examinationNotes}
                    onChange={(e) => setExaminationNotes(e.target.value)}
                    placeholder="Chest clear, S1/S2 heard, no murmurs..."
                    className="w-full p-2 border border-slate-300 rounded-xl focus:outline-teal-600"
                  />
                </div>
              </div>

              {/* Rx Medicines Prescription Table */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-teal-600" />
                    Prescribed Medications ({prescribedMeds.length})
                  </h3>
                </div>

                {/* Inline Medicine Adder */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-600 mb-0.5">Medicine Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Metformin 500mg"
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">Dosage</label>
                    <input
                      type="text"
                      value={newMedDose}
                      onChange={(e) => setNewMedDose(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">Frequency</label>
                    <input
                      type="text"
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={newMedDuration}
                      onChange={(e) => setNewMedDuration(e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Rx
                    </button>
                  </div>
                </div>

                {/* Prescribed Items Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Frequency</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                        <th className="p-2.5 text-right">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescribedMeds.map((med) => (
                        <tr key={med.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-900">{med.medicineName}</td>
                          <td className="p-2.5">{med.dosage}</td>
                          <td className="p-2.5 font-semibold text-teal-800">{med.frequency}</td>
                          <td className="p-2.5">{med.duration}</td>
                          <td className="p-2.5 text-slate-500">{med.instructions}</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleRemoveMedicine(med.id)}
                              className="text-rose-600 hover:text-rose-800 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lab Diagnostic Tests Selector */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-teal-600" />
                  Select Lab Diagnostic Investigations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Complete Blood Count (CBC)',
                    'Lipid Profile Comprehensive',
                    'Serum Creatinine & eGFR',
                    'HbA1c Glycated Hemoglobin',
                    'Thyroid Profile (TSH, FT3, FT4)',
                    'Liver Function Test (LFT)',
                    'Electrocardiogram (12-Lead ECG)',
                    'Chest X-Ray PA View'
                  ].map((test) => {
                    const isChecked = orderedLabTests.includes(test);
                    return (
                      <button
                        key={test}
                        type="button"
                        onClick={() => handleToggleLab(test)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {test}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advice & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Physician Advice & Lifestyle Plan</label>
                  <textarea
                    rows={2}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Sign Prescription & Complete Encounter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PATIENT 360 DRAWER */}
      <Patient360Drawer
        patientId={drawerPatientId}
        isOpen={Boolean(drawerPatientId)}
        onClose={() => setDrawerPatientId(null)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
