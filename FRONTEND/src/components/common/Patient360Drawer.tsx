import React from 'react';
import { dbService } from '../../services/mockDatabase';
import { Patient } from '../../types';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  AlertTriangle,
  Pill,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Shield,
  Activity,
  ChevronRight,
  Stethoscope,
  ExternalLink,
  Plus
} from 'lucide-react';

interface Patient360DrawerProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: string) => void;
  onOpenBookingModal?: (doctorId?: string, specialtyId?: string) => void;
}

export const Patient360Drawer: React.FC<Patient360DrawerProps> = ({
  patientId,
  isOpen,
  onClose,
  onNavigate,
  onOpenBookingModal,
}) => {
  if (!isOpen || !patientId) return null;

  const patient = dbService.getPatientById(patientId);
  if (!patient) return null;

  const patientAge = 2026 - parseInt(patient.dateOfBirth.split('-')[0]);
  const patientBranch = dbService.branches.find((b) => b.id === patient.branchId);
  const patientStatus = patient.status || 'Active';
  const appointments = dbService.appointments.filter((a) => a.patientId === patient.id);
  const prescriptions = dbService.prescriptions.filter((p) => p.patientId === patient.id);
  const labOrders = dbService.labOrders.filter((l) => l.patientId === patient.id);
  const invoices = dbService.invoices.filter((i) => i.patientId === patient.id);
  const documents = dbService.documents.filter((d) => d.patientId === patient.id);

  const handleViewFullProfile = () => {
    onClose();
    if (onNavigate) {
      onNavigate(`admin-patient-detail-${patient.id}`);
    }
  };

  const handleBookAppointment = () => {
    onClose();
    if (onOpenBookingModal) {
      onOpenBookingModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Top Banner Header */}
          <div className="bg-slate-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-black text-xl shrink-0">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </div>
              <div className="overflow-hidden pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-white truncate">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                    {patient.patientId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      patientStatus === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : patientStatus === 'Inactive'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {patientStatus}
                  </span>
                  {patientBranch && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                      {patientBranch.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {patientAge} yrs • {patient.gender} • Blood Group:{' '}
                  <span className="text-rose-400 font-bold">{patient.bloodGroup}</span>
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    {patient.phone}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-teal-400" />
                    {patient.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800">
              <button
                onClick={handleBookAppointment}
                className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book Slot
              </button>
              <button
                onClick={handleViewFullProfile}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                Full EHR File
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* Critical Clinical Alerts */}
            {(patient.allergies.length > 0 || patient.medicalConditions.length > 0) && (
              <div className="bg-rose-50/70 border border-rose-200 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Clinical Risk & Allergy Alerts</span>
                </div>
                <div className="space-y-1">
                  {patient.allergies.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-600 font-semibold w-24 shrink-0">Allergies:</span>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((a, i) => (
                          <span
                            key={i}
                            className="bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-md text-[11px]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {patient.medicalConditions.length > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-slate-600 font-semibold w-24 shrink-0">Conditions:</span>
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalConditions.map((c, i) => (
                          <span
                            key={i}
                            className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-md text-[11px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-medium">Total Visits</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{patient.totalVisits}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-medium">Prescriptions</p>
                <p className="text-base font-black text-indigo-700 mt-0.5">{prescriptions.length}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-medium">Lab Tests</p>
                <p className="text-base font-black text-teal-700 mt-0.5">{labOrders.length}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-medium">Total Spent</p>
                <p className="text-base font-black text-slate-900 mt-0.5">${patient.totalSpent}</p>
              </div>
            </div>

            {/* Current Active Medications */}
            {patient.currentMedications.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <span>Current Ongoing Medications</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.currentMedications.map((med, i) => (
                    <span
                      key={i}
                      className="bg-indigo-50 text-indigo-900 border border-indigo-200 font-medium px-2.5 py-1 rounded-lg text-xs"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance & Emergency Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Insurance Provider:</span>
                <span className="font-bold text-slate-900">{patient.insuranceProvider || 'Self Pay'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Policy Number:</span>
                <span className="font-mono text-slate-900">{patient.insurancePolicyNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-medium">Emergency Contact:</span>
                <span className="font-bold text-slate-900">
                  {patient.emergencyContactName} ({patient.emergencyRelationship}) • {patient.emergencyContactPhone}
                </span>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Recent Clinical Appointments
                </span>
                <span className="text-[11px] text-slate-400">{appointments.length} records</span>
              </div>

              {appointments.length === 0 ? (
                <p className="text-slate-400 italic py-2">No previous appointments found.</p>
              ) : (
                <div className="space-y-2">
                  {appointments.slice(0, 3).map((appt) => (
                    <div
                      key={appt.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs hover:border-teal-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{appt.doctorName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {appt.date} at {appt.timeSlot} • {appt.doctorSpecialty}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-teal-800">${appt.fee}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Prescriptions */}
            {prescriptions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Latest Prescriptions
                  </span>
                </div>
                <div className="space-y-2">
                  {prescriptions.slice(0, 2).map((rx) => (
                    <div
                      key={rx.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{rx.prescriptionNumber}</span>
                        <span className="text-[11px] text-slate-500">{rx.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Diagnosis: <span className="font-semibold text-slate-800">{rx.diagnosis}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {rx.items.map((i) => i.medicineName).join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
