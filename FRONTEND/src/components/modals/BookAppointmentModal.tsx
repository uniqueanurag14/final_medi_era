import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../../services/mockDatabase';
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
  X,
  CreditCard,
  Building2,
  FileText,
  Printer,
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newAppt: Appointment) => void;
  initialDoctorId?: string;
  prefilledDoctorId?: string;
  initialSpecialtyId?: string;
  prefilledSpecialtyId?: string;
  prefilledService?: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDoctorId,
  prefilledDoctorId,
  initialSpecialtyId,
  prefilledSpecialtyId,
  prefilledService,
}) => {
  const specialties = dbService.specialties;
  const doctors = dbService.doctors;
  const patients = dbService.patients;

  const effectiveDoctorId = prefilledDoctorId || initialDoctorId;
  const effectiveSpecialtyId = prefilledSpecialtyId || initialSpecialtyId;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>(
    effectiveSpecialtyId || specialties[0]?.id || ''
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    effectiveDoctorId || doctors[0]?.id || ''
  );
  const [selectedVisitType, setSelectedVisitType] = useState<VisitType>('In Clinic');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-01');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [chiefComplaint, setChiefComplaint] = useState<string>(prefilledService ? `Clinical Service / Package: ${prefilledService}` : '');

  // Patient mode: 'existing' or 'new'
  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  const [selectedExistingPatientId, setSelectedExistingPatientId] = useState<string>(patients[0]?.id || '');
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>('');

  // New patient inline fields
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newDob, setNewDob] = useState('1990-05-15');
  const [newBloodGroup, setNewBloodGroup] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [newAddress, setNewAddress] = useState('');

  // Result state
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  // Sync prefilled props if changed
  useEffect(() => {
    if (effectiveSpecialtyId) {
      setSelectedSpecialtyId(effectiveSpecialtyId);
    }
    if (effectiveDoctorId) {
      setSelectedDoctorId(effectiveDoctorId);
    }
    if (prefilledService) {
      setChiefComplaint(`Clinical Service / Package: ${prefilledService}`);
      const matchedSrv = dbService.services.find(
        (s) => s.name.toLowerCase() === prefilledService.toLowerCase()
      );
      if (matchedSrv) {
        if (matchedSrv.departmentId) {
          setSelectedSpecialtyId(matchedSrv.departmentId);
        }
        if (matchedSrv.assignedDoctorIds && matchedSrv.assignedDoctorIds.length > 0) {
          setSelectedDoctorId(matchedSrv.assignedDoctorIds[0]);
        }
      }
    }
  }, [effectiveDoctorId, effectiveSpecialtyId, prefilledService]);

  if (!isOpen) return null;

  const filteredDoctors = doctors.filter((d) => !selectedSpecialtyId || d.specialtyId === selectedSpecialtyId);
  const activeDoctor = doctors.find((d) => d.id === selectedDoctorId) || filteredDoctors[0] || doctors[0];

  // Dynamic slot engine computation
  const availableSlots = dbService.getAvailableSlots(activeDoctor?.id || '', selectedDate);

  // Check if doctor is on leave
  const doctorLeaves = dbService.getDoctorLeaves(activeDoctor?.id);
  const activeLeave = doctorLeaves.find(
    (l) => l.status === 'Approved' && selectedDate >= l.startDate && selectedDate <= l.endDate
  );

  // Check duplicate patient for new patient mode
  const duplicateMatch = patientMode === 'new' && (newPhone || newEmail)
    ? dbService.checkDuplicatePatient(newPhone, newEmail)
    : undefined;

  const handleSpecialtyChange = (specId: string) => {
    setSelectedSpecialtyId(specId);
    const docs = doctors.filter((d) => d.specialtyId === specId);
    if (docs.length > 0) {
      setSelectedDoctorId(docs[0].id);
    }
  };

  const handleConfirmBooking = () => {
    if (!activeDoctor) {
      alert('No physician is selected. Please select a specialist before booking.');
      return;
    }
    if (!selectedTimeSlot && availableSlots.length > 0) {
      alert('Please select an appointment time slot.');
      return;
    }
    if (activeLeave) {
      alert(`Dr. ${activeDoctor.name} is on leave on this date. Please select another date or physician.`);
      return;
    }

    let patientIdToUse = selectedExistingPatientId;

    if (patientMode === 'new') {
      if (!newFirstName.trim() || !newLastName.trim() || !newPhone.trim()) {
        alert('Please fill out patient first name, last name and phone number.');
        return;
      }
      const createdPatient = dbService.createPatient({
        organizationId: 'org-01',
        branchId: activeDoctor.branchId || 'branch-downtown',
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        dateOfBirth: newDob,
        gender: newGender,
        bloodGroup: newBloodGroup,
        phone: newPhone.trim(),
        email: newEmail.trim() || `${newFirstName.toLowerCase().trim()}.${newLastName.toLowerCase().trim()}@example.com`,
        address: newAddress.trim() || '123 Medical Way',
        city: 'Metro City',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: newPhone.trim(),
        emergencyRelationship: 'Relative',
        allergies: ['None Known'],
        medicalConditions: ['None / Healthy'],
        currentMedications: ['None'],
        category: 'New',
      });
      patientIdToUse = createdPatient.id;
    }

    try {
      const slotToBook = selectedTimeSlot || availableSlots[0] || '09:00';
      const appt = dbService.createAppointment({
        patientId: patientIdToUse,
        doctorId: activeDoctor.id,
        date: selectedDate,
        timeSlot: slotToBook,
        visitType: selectedVisitType,
        chiefComplaint: chiefComplaint.trim() || 'General OPD consultation request.',
      });

      setConfirmedAppt(appt);
      setStep(4);
      if (onSuccess) onSuccess(appt);

      // Trigger automatic WhatsApp confirmation and reminder schedule via backend
      try {
        const patientObj = patients.find((p) => p.id === patientIdToUse);
        const recipientPhone = patientObj?.phone || newPhone.trim();
        const recipientName = patientObj ? `${patientObj.firstName} ${patientObj.lastName}`.trim() : `${newFirstName} ${newLastName}`.trim();

        if (recipientPhone) {
          fetch('/api/whatsapp/test-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: recipientPhone,
              type: 'confirmation',
              patientName: recipientName,
              doctorName: activeDoctor.name,
              hospitalName: 'MediEra Medical Care',
              appointmentDate: selectedDate,
              appointmentTime: slotToBook,
            }),
          }).catch((e) => console.warn('[WhatsApp Booking Trigger]', e));
        }
      } catch {}
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to book appointment.');
    }
  };

  const searchedPatients = patients.filter((p) => {
    if (!patientSearchQuery) return true;
    const q = patientSearchQuery.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      p.phone.includes(q)
    );
  }).slice(0, 8);

  const selectedPatientObj = patients.find((p) => p.id === selectedExistingPatientId) || patients[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Book Clinical Appointment</h3>
              <p className="text-xs text-slate-400">Step {step} of 4 • Guaranteed Doctor Slot & Token Allocation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="bg-slate-100 px-6 py-2.5 flex items-center justify-between border-b border-slate-200 text-xs font-bold text-slate-600">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-teal-700 font-extrabold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-300'}`}>1</span>
            <span>Doctor & Date</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-teal-700 font-extrabold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-300'}`}>2</span>
            <span>Time Slot</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-teal-700 font-extrabold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-300'}`}>3</span>
            <span>Patient Info</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-teal-700 font-extrabold' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-teal-600 text-white' : 'bg-slate-300'}`}>4</span>
            <span>Token Slip</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* STEP 1: Specialty, Doctor & Date */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Department / Specialty</label>
                  <select
                    value={selectedSpecialtyId}
                    onChange={(e) => handleSpecialtyChange(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:outline-teal-600"
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Consulting Physician</label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:outline-teal-600"
                  >
                    {filteredDoctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.title}) • ${d.consultationFee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected doctor summary banner */}
              {activeDoctor && (
                <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center gap-3.5">
                  <img
                    src={activeDoctor.photo}
                    alt={activeDoctor.name}
                    className="w-12 h-12 rounded-xl object-cover border border-teal-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">{activeDoctor.name}</h4>
                    <p className="text-teal-800 font-semibold">{activeDoctor.specialtyName} • Room {activeDoctor.roomNumber || '101'}</p>
                    <p className="text-slate-500 text-[11px] truncate">{activeDoctor.qualification}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Consultation Fee</span>
                    <span className="text-base font-black text-teal-800">${activeDoctor.consultationFee}.00</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTimeSlot('');
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-teal-600 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Visit Type</label>
                  <select
                    value={selectedVisitType}
                    onChange={(e) => setSelectedVisitType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white focus:outline-teal-600 font-semibold"
                  >
                    <option value="In Clinic">In Clinic (Chamber Visit)</option>
                    <option value="Video Consultation">Video Consultation (Telehealth)</option>
                    <option value="Follow-up">Follow-up Assessment</option>
                    <option value="Emergency">Urgent Care / Emergency</option>
                  </select>
                </div>
              </div>

              {/* Leave alert if doctor is away */}
              {activeLeave && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Doctor is on Approved Leave on this Date</p>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      {activeLeave.reason} ({activeLeave.startDate} to {activeLeave.endDate}). Please select a different date.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={Boolean(activeLeave)}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  Continue to Select Slot
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Time Slot Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h4 className="font-bold text-slate-900">Available Slots for {activeDoctor?.name || 'Physician'}</h4>
                  <p className="text-slate-500 text-[11px]">Date: {selectedDate} • Chamber {activeDoctor?.roomNumber || '101'}</p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-teal-700 font-bold hover:underline"
                >
                  Change Date / Doctor
                </button>
              </div>

              {availableSlots.length === 0 ? (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                  <h4 className="font-bold text-slate-900">No Open Time Slots on this Date</h4>
                  <p className="text-slate-600 text-xs">
                    All consultation slots are either booked, outside the doctor's weekly shift, or blocked for clinical meetings.
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
                  >
                    Select Another Date
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-600 font-semibold mb-2">Select an Available Slot ({availableSlots.length} available):</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`py-2 px-1 rounded-xl text-center font-bold text-xs transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-600/30'
                              : 'bg-slate-50 hover:bg-teal-50 text-slate-800 border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 mx-auto mb-0.5 opacity-70" />
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Chief Complaint / Reason for Visit</label>
                <textarea
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Chest discomfort, palpitations, hypertension medication review..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-teal-600 text-xs"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedTimeSlot && availableSlots.length > 0) {
                      setSelectedTimeSlot(availableSlots[0]);
                    }
                    setStep(3);
                  }}
                  disabled={availableSlots.length === 0}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  Continue to Patient Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Patient Selection or Quick Inline Registration */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPatientMode('existing')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      patientMode === 'existing'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Select Existing Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientMode('new')}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      patientMode === 'new'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    + Register Walk-in / New Patient
                  </button>
                </div>
              </div>

              {patientMode === 'existing' ? (
                <div className="space-y-3">
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search patient by name, ID (e.g. PAT-0001), or phone..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {searchedPatients.map((p) => {
                      const isSelected = selectedExistingPatientId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedExistingPatientId(p.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-teal-50 border-teal-500 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-900">{p.firstName} {p.lastName}</span>
                            <span className="text-[10px] text-slate-500 ml-2">({p.patientId} • {p.phone})</span>
                            <p className="text-[11px] text-slate-500">{p.gender} • Blood: {p.bloodGroup} • {p.address}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Inline New Patient Registration */
                <div className="space-y-3">
                  {duplicateMatch && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                      <strong>Warning: </strong> Existing patient "{duplicateMatch.firstName} {duplicateMatch.lastName}" ({duplicateMatch.patientId}) matches this contact.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="First name"
                        value={newFirstName}
                        onChange={(e) => setNewFirstName(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Last name"
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Gender</label>
                      <select
                        value={newGender}
                        onChange={(e) => setNewGender(e.target.value as any)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                      <select
                        value={newBloodGroup}
                        onChange={(e) => setNewBloodGroup(e.target.value as any)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                      >
                        <option value="O+">O+</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="AB+">AB+</option>
                        <option value="O-">O-</option>
                        <option value="A-">A-</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Order / Booking Summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-700">
                <div className="flex justify-between font-semibold">
                  <span>Physician:</span>
                  <span className="text-slate-900">{activeDoctor?.name || 'Assigned Physician'} ({activeDoctor?.specialtyName || 'General'})</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Slot & Date:</span>
                  <span className="text-slate-900">{selectedDate} at {selectedTimeSlot || availableSlots[0] || '10:00 AM'}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Chamber:</span>
                  <span className="text-slate-900">Room {activeDoctor?.roomNumber || '101'}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-teal-900">
                  <span>Payable Fee:</span>
                  <span>${activeDoctor?.consultationFee || 0}.00</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Generate OPD Token
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Token Slip */}
          {step === 4 && confirmedAppt && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">Appointment Confirmed!</h3>
                <p className="text-xs text-slate-500">
                  Your appointment and token number have been generated in the clinic queue.
                </p>
              </div>

              {/* Printable Token Slip Card */}
              <div className="max-w-sm mx-auto p-5 bg-slate-900 text-white rounded-2xl shadow-xl space-y-3 text-left border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <p className="text-[10px] text-teal-400 uppercase font-black tracking-wider">APEX CLINICS OPD TOKEN</p>
                    <p className="text-xs text-slate-400">{confirmedAppt.branchName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-teal-400">#{confirmedAppt.tokenNumber}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking No:</span>
                    <span className="font-mono font-bold text-white">{confirmedAppt.appointmentNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient:</span>
                    <span className="font-bold text-white">{confirmedAppt.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consultant:</span>
                    <span className="font-bold text-white">{confirmedAppt.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Slot:</span>
                    <span className="font-bold text-teal-300">{confirmedAppt.date} at {confirmedAppt.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-bold text-amber-400">{confirmedAppt.status}</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Notification Status Card */}
              <div className="max-w-sm mx-auto p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <span>💬 WhatsApp Delivered</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    Meta Cloud API
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-emerald-100 text-[11px] font-mono text-slate-700 leading-tight whitespace-pre-line">
{`🏥 Appointment Confirmed
Hello ${confirmedAppt.patientName}, your appointment has been confirmed. ✅
👨⚕️ ${confirmedAppt.doctorName}
📅 ${confirmedAppt.date} @ ${confirmedAppt.timeSlot}
🏥 Hospital: MediEra Medical Care`}
                </div>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  Automatic 24h & 2h reminders scheduled before appointment.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print Token Slip
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
