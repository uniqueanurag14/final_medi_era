import React, { useState, useMemo } from 'react';
import { dbService, INITIAL_DOCTORS, INITIAL_SPECIALTIES } from '../../services/mockDatabase';
import { Specialty, Doctor, VisitType, Patient, Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Phone,
  Mail,
  Shield,
  Stethoscope,
  Building2,
  ArrowRight,
  ArrowLeft,
  Star,
  MapPin,
  Sparkles,
  FileText,
  Printer
} from 'lucide-react';

interface PublicBookAppointmentPageProps {
  onNavigate: (view: string) => void;
  prefilledDoctorId?: string;
  prefilledSpecialtyId?: string;
  prefilledService?: string;
  onOpenPrintModal?: (type: 'token' | 'prescription' | 'invoice' | 'lab_report', data: any) => void;
}

export const PublicBookAppointmentPage: React.FC<PublicBookAppointmentPageProps> = ({
  onNavigate,
  prefilledDoctorId,
  prefilledSpecialtyId,
  prefilledService,
  onOpenPrintModal,
}) => {
  const specialties = dbService.specialties.length > 0 ? dbService.specialties : INITIAL_SPECIALTIES;
  const doctors = dbService.doctors.length > 0 ? dbService.doctors : INITIAL_DOCTORS;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>(
    prefilledSpecialtyId || (specialties[0]?.id || '')
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    prefilledDoctorId || (doctors[0]?.id || '')
  );
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType>('In Clinic');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:30 AM');

  // Patient contact form
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState(prefilledService || '');
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Derived selections
  const currentSpecialty = useMemo(
    () => specialties.find((s) => s.id === selectedSpecialtyId) || specialties[0],
    [specialties, selectedSpecialtyId]
  );

  const availableDoctors = useMemo(() => {
    if (!selectedSpecialtyId) return doctors;
    const filtered = doctors.filter((d) => d.specialtyId === selectedSpecialtyId);
    return filtered.length > 0 ? filtered : doctors;
  }, [doctors, selectedSpecialtyId]);

  const currentDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId) || availableDoctors[0] || doctors[0],
    [doctors, selectedDoctorId, availableDoctors]
  );

  const timeSlots = [
    '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM',
    '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!patientName.trim() || !patientPhone.trim()) {
      setBookingError('Please provide your full name and contact phone number.');
      return;
    }

    // 1. Locate or create patient chart
    let patient = dbService.patients.find(
      (p) => p.phone === patientPhone.trim() || (patientEmail && p.email.toLowerCase() === patientEmail.toLowerCase())
    );

    if (!patient) {
      patient = dbService.createPatient({
        organizationId: 'org-01',
        branchId: currentDoctor?.branchId || 'branch-01',
        firstName: patientName.trim().split(' ')[0] || patientName.trim(),
        lastName: patientName.trim().split(' ').slice(1).join(' ') || 'Patient',
        gender: 'Other',
        dateOfBirth: '1990-01-01',
        phone: patientPhone.trim(),
        email: patientEmail.trim() || `${patientName.toLowerCase().replace(/\s+/g, '')}@patient.mediera.local`,
        address: 'Registered via MediEra Web Portal',
        city: 'Downtown',
        emergencyContactName: 'Self',
        emergencyContactPhone: patientPhone.trim(),
        emergencyRelationship: 'Self',
        allergies: [],
        medicalConditions: [],
        currentMedications: [],
        category: 'New',
        bloodGroup: 'O+',
      });
    }

    // 2. Generate appointment using real dbService schema
    const newAppointment = dbService.createAppointment({
      patientId: patient.id,
      doctorId: currentDoctor?.id || 'doc-01',
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      visitType: selectedVisitType,
      chiefComplaint: reasonForVisit || 'Specialist Consultation',
    });

    // 3. Trigger WhatsApp Business Confirmation & Schedule Reminders via Backend API
    try {
      fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: patientPhone.trim(),
          type: 'confirmation',
          patientName: `${patient.firstName} ${patient.lastName}`.trim(),
          doctorName: currentDoctor?.name || 'Dr. Specialist',
          hospitalName: 'MediEra Medical Care',
          appointmentDate: selectedDate,
          appointmentTime: selectedTimeSlot,
        }),
      }).catch((e) => console.warn('[WhatsApp Public Booking Trigger]', e));
    } catch {}

    setConfirmedAppt(newAppointment);
    setStep(4);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 dark:bg-teal-950/70 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
          Direct Specialist Scheduling
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-3">
          Book an Appointment Online
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
          Reserve your in-clinic consultation or teleconsultation slot in under 2 minutes. Receive instant confirmation and digital queue token.
        </p>
      </div>

      {/* Booking Wizard Container */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Step Progress Indicators */}
        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-6 py-4">
          <div className="flex items-center justify-between max-w-xl mx-auto text-xs">
            <div className={`flex items-center gap-2 font-bold ${step >= 1 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                1
              </div>
              <span className="hidden sm:inline">Specialty & Doctor</span>
            </div>

            <div className="h-0.5 w-8 sm:w-16 bg-slate-200 dark:bg-slate-700" />

            <div className={`flex items-center gap-2 font-bold ${step >= 2 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                2
              </div>
              <span className="hidden sm:inline">Date & Time Slot</span>
            </div>

            <div className="h-0.5 w-8 sm:w-16 bg-slate-200 dark:bg-slate-700" />

            <div className={`flex items-center gap-2 font-bold ${step >= 3 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                3
              </div>
              <span className="hidden sm:inline">Patient Details</span>
            </div>

            <div className="h-0.5 w-8 sm:w-16 bg-slate-200 dark:bg-slate-700" />

            <div className={`flex items-center gap-2 font-bold ${step >= 4 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                4
              </div>
              <span className="hidden sm:inline">Confirmation</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Select Specialty & Doctor */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wide">
                1. Select Clinical Specialty
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specialties.map((spec) => {
                  const isSelected = selectedSpecialtyId === spec.id;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => {
                        setSelectedSpecialtyId(spec.id);
                        const firstDoc = doctors.find((d) => d.specialtyId === spec.id);
                        if (firstDoc) setSelectedDoctorId(firstDoc.id);
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/60 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {spec.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {doctors.filter((d) => d.specialtyId === spec.id).length} Specialists
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wide">
                2. Select Available Specialist
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {availableDoctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/60 shadow-xs ring-1 ring-teal-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={doc.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=80'}
                        alt={doc.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {doc.name}
                        </div>
                        <div className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                          {doc.specialtyName}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {doc.rating}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">${doc.consultationFee} fee</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Schedule</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Date & Time Slot */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Specialist
              </button>
              <div className="text-xs text-slate-500">
                Selected: <strong className="text-teal-700 dark:text-teal-400">{currentDoctor?.name}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['In Clinic', 'Tele-Consult', 'Emergency'] as VisitType[]).map((vType) => (
                    <button
                      key={vType}
                      type="button"
                      onClick={() => setSelectedVisitType(vType)}
                      className={`py-2 px-2 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selectedVisitType === vType
                          ? 'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {vType}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Select Appointment Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-teal-600 bg-white dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wide">
                Select Available Consultation Time Slot
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Enter Patient Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Patient Information Form */}
        {step === 3 && (
          <form onSubmit={handleConfirmBooking} className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Change Date / Slot
              </button>
              <div className="text-xs text-slate-500">
                Slot: <strong className="text-teal-700 dark:text-teal-400">{selectedDate} @ {selectedTimeSlot}</strong>
              </div>
            </div>

            {bookingError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
                {bookingError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Johnathan Doe"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-teal-600 bg-white dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-teal-600 bg-white dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-teal-600 bg-white dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Reason for Visit / Symptoms
                </label>
                <input
                  type="text"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  placeholder="e.g. Chest tightness, routine health checkup"
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-teal-600 bg-white dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl text-xs space-y-2">
              <div className="font-bold text-teal-950 dark:text-teal-200 flex items-center justify-between">
                <span>Appointment Summary</span>
                <span>${currentDoctor?.consultationFee}.00 USD</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-300 text-[11px] pt-1">
                <div>
                  <span className="text-slate-400 block">Doctor</span>
                  <span className="font-semibold">{currentDoctor?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Specialty</span>
                  <span className="font-semibold">{currentSpecialty?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Date</span>
                  <span className="font-semibold">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Time Slot</span>
                  <span className="font-semibold">{selectedTimeSlot}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Reserve Slot</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Success & Confirmation */}
        {step === 4 && confirmedAppt && (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-600 border border-teal-500/30 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Appointment Successfully Booked!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your consultation has been registered in the MediEra clinical practice management system.
              </p>
            </div>

            {/* Token Badge */}
            <div className="max-w-sm mx-auto p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                OPD Queue Token
              </div>
              <div className="text-3xl font-black text-teal-600 dark:text-teal-400">
                #{confirmedAppt.tokenNumber}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Appointment ID: <span className="font-mono font-bold text-slate-800 dark:text-white">{confirmedAppt.id}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <strong>{confirmedAppt.doctorName}</strong> — {confirmedAppt.date} @ {confirmedAppt.timeSlot}
              </div>
            </div>

            {/* WhatsApp Automated Notification Delivery Card */}
            <div className="max-w-md mx-auto p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-left space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    💬
                  </span>
                  <span>WhatsApp Confirmation Delivered</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100">
                  Active Meta Cloud API
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-[11px] font-mono leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
{`🏥 Appointment Confirmed

Hello ${patientName.trim() || 'Valued Patient'},

Your appointment has been confirmed. ✅

👨⚕️ Doctor: ${confirmedAppt.doctorName}
📅 Date: ${confirmedAppt.date}
⏰ Time: ${confirmedAppt.timeSlot}
🏥 Hospital: MediEra Medical Care
🆔 Appointment ID: ${confirmedAppt.id}

Please arrive 10–15 minutes before your appointment.

Thank you for choosing MediEra Medical Care.`}
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
                <span>To: {patientPhone}</span>
                <span>⏰ 24h & 2h Reminders Queued</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {onOpenPrintModal && (
                <button
                  type="button"
                  onClick={() => onOpenPrintModal('token', { appointment: confirmedAppt })}
                  className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print OPD Token</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
