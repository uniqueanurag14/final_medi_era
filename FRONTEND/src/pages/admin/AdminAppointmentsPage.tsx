import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { Appointment, AppointmentStatus, DoctorLeave, BlockedSlot } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Patient360Drawer } from '../../components/common/Patient360Drawer';
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Plus,
  Printer,
  CheckCircle2,
  XCircle,
  Stethoscope,
  Activity,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  Eye,
  Phone,
  DollarSign,
  ArrowRight,
  UserCheck,
  CalendarDays,
  ListOrdered,
  CalendarRange,
  ShieldAlert,
  Ban
} from 'lucide-react';

interface AdminAppointmentsPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
  onOpenPrintModal: (type: any, data: any) => void;
}

export const AdminAppointmentsPage: React.FC<AdminAppointmentsPageProps> = ({
  onNavigate,
  onOpenBookingModal,
  onOpenPrintModal,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'calendar' | 'leaves'>('queue');
  const [calendarMode, setCalendarMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState('2026-09-01');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 360 Drawer state
  const [drawerPatientId, setDrawerPatientId] = useState<string | null>(null);

  // Leave & Blocked slot modal state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveDoctorId, setLeaveDoctorId] = useState(dbService.doctors[0]?.id || '');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-09-05');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-09-07');
  const [leaveReason, setLeaveReason] = useState('Medical Conference');

  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockDoctorId, setBlockDoctorId] = useState(dbService.doctors[0]?.id || '');
  const [blockDate, setBlockDate] = useState('2026-09-02');
  const [blockStartTime, setBlockStartTime] = useState('13:00');
  const [blockEndTime, setBlockEndTime] = useState('14:30');
  const [blockReason, setBlockReason] = useState('Hospital Executive Meeting');

  // Appointments & Doctors
  const appointments = dbService.appointments;
  const doctors = dbService.doctors;
  const doctorLeaves = dbService.doctorLeaves;
  const blockedSlots = dbService.blockedSlots;

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === 'queue' && selectedDate && a.date !== selectedDate) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (doctorFilter !== 'all' && a.doctorId !== doctorFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.patientName.toLowerCase().includes(q) ||
        a.doctorName.toLowerCase().includes(q) ||
        a.appointmentNumber.toLowerCase().includes(q) ||
        (a.tokenNumber && String(a.tokenNumber).includes(q))
      );
    }
    return true;
  });

  const handleStatusChange = (apptId: string, newStatus: AppointmentStatus) => {
    dbService.updateAppointmentStatus(apptId, newStatus);
    // Force re-render through dummy state if needed, or component automatically re-reads dbService
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.addDoctorLeave({
      doctorId: leaveDoctorId,
      branchId: dbService.doctors.find((d) => d.id === leaveDoctorId)?.branchId || 'branch-01',
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason,
      status: 'Approved',
    });
    setIsLeaveModalOpen(false);
  };

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.addBlockedSlot({
      doctorId: blockDoctorId,
      branchId: dbService.doctors.find((d) => d.id === blockDoctorId)?.branchId || 'branch-01',
      date: blockDate,
      startTime: blockStartTime,
      endTime: blockEndTime,
      reason: blockReason,
    });
    setIsBlockModalOpen(false);
  };

  // Queue metrics
  const waitingCount = appointments.filter((a) => a.date === selectedDate && (a.status === 'Waiting' || a.status === 'Checked In')).length;
  const inConsultationCount = appointments.filter((a) => a.date === selectedDate && a.status === 'In Consultation').length;
  const completedTodayCount = appointments.filter((a) => a.date === selectedDate && a.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical Appointments & OPD Operations
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredAppointments.length} Bookings
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Token Generation, Front Desk Check-in, OPD Schedule, Calendar & Leave Management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('doctor-queue')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            Doctor Live OPD Board
          </button>
          <button
            onClick={() => onOpenBookingModal()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Book / Walk-in Slot
          </button>
        </div>
      </div>

      {/* Operational Summary Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-slate-500 font-semibold">Total Booked ({selectedDate})</p>
          <p className="text-xl font-black text-slate-900 mt-1">
            {appointments.filter((a) => a.date === selectedDate).length}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
          <p className="text-amber-800 font-semibold">In Waiting Queue</p>
          <p className="text-xl font-black text-amber-700 mt-1">{waitingCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-teal-200/80 bg-teal-50/20 shadow-2xs">
          <p className="text-teal-800 font-semibold">In Consultation Now</p>
          <p className="text-xl font-black text-teal-700 mt-1">{inConsultationCount}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
          <p className="text-emerald-800 font-semibold">Completed Today</p>
          <p className="text-xl font-black text-emerald-700 mt-1">{completedTodayCount}</p>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'queue'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Live Queue & Front Desk Check-in
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Clinic Master Calendar
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'leaves'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Doctor Leaves & Blocked OPD Slots ({doctorLeaves.length + blockedSlots.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE QUEUE & LIST */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-slate-600">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-slate-900 focus:outline-hidden bg-transparent cursor-pointer"
              />
            </div>

            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, doctor, or token #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="Waiting">Waiting</option>
                <option value="Checked In">Checked In</option>
                <option value="In Consultation">In Consultation</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
              >
                <option value="all">All Doctors ({doctors.length})</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialtyName})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Token / No.</th>
                    <th className="py-3 px-4">Patient Profile</th>
                    <th className="py-3 px-4">Consultant Physician</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status & Front-Desk Action</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 px-4">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-slate-800">
                            {appointments.length === 0
                              ? 'No appointments scheduled. Your upcoming appointments will appear here.'
                              : 'No appointments found matching current filter criteria.'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {appointments.length === 0
                              ? 'Appointments booked by patients or clinic receptionists will be managed here.'
                              : 'Try adjusting your search terms or filter selection.'}
                          </p>
                          {appointments.length === 0 && (
                            <button
                              onClick={() => onOpenBookingModal()}
                              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Book New Appointment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-slate-900 text-teal-300 font-black flex items-center justify-center text-xs">
                              #{appt.tokenNumber || '—'}
                            </span>
                            <div>
                              <span className="text-[11px] text-slate-700 font-semibold block">{appt.appointmentNumber}</span>
                              {appt.isDemo ? (
                                <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                                  DEMO
                                </span>
                              ) : (
                                <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  PROD
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setDrawerPatientId(appt.patientId)}
                            className="font-bold text-slate-900 hover:text-teal-700 hover:underline block text-left"
                          >
                            {appt.patientName}
                          </button>
                          <span className="text-[11px] text-slate-500">
                            {appt.patientGender}, {appt.patientAge}y • {appt.patientPhone}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{appt.doctorName}</span>
                          <span className="text-[11px] text-teal-700 font-medium">{appt.doctorSpecialty}</span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {appt.timeSlot}
                          </span>
                          <span className="text-[10px] text-slate-400">{appt.visitType}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              appt.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            ${appt.fee} • {appt.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={appt.status}
                              onChange={(e) => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                              className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-teal-600"
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Checked In">Checked In</option>
                              <option value="Waiting">Waiting</option>
                              <option value="In Consultation">In Consultation</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="No Show">No Show</option>
                            </select>

                            {appt.status === 'Scheduled' && (
                              <button
                                onClick={() => handleStatusChange(appt.id, 'Checked In')}
                                className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Check in patient at reception"
                              >
                                <UserCheck className="w-3 h-3" />
                                Check In
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDrawerPatientId(appt.patientId)}
                              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                              title="Patient 360 View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onOpenPrintModal('token', { appointment: appt })}
                              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                              title="Print Token Slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLINIC MASTER CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Calendar Mode:</span>
              <button
                onClick={() => setCalendarMode('day')}
                className={`px-3 py-1 rounded-lg font-bold ${calendarMode === 'day' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Day View
              </button>
              <button
                onClick={() => setCalendarMode('week')}
                className={`px-3 py-1 rounded-lg font-bold ${calendarMode === 'week' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Week View
              </button>
              <button
                onClick={() => setCalendarMode('month')}
                className={`px-3 py-1 rounded-lg font-bold ${calendarMode === 'month' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Month View
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <Calendar className="w-4 h-4 text-teal-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-bold text-slate-900 bg-transparent focus:outline-hidden"
              />
            </div>
          </div>

          {/* Master Day Timeline Grid across Doctors */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Doctor OPD Chambers Schedule — {selectedDate}
              </h3>
              <span className="text-xs text-slate-500">
                Click any slot card to preview patient record or check in
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => {
                const docAppts = appointments.filter((a) => a.doctorId === doc.id && a.date === selectedDate);
                const isDocOnLeave = doctorLeaves.some(
                  (l) => l.doctorId === doc.id && l.status === 'Approved' && selectedDate >= l.startDate && selectedDate <= l.endDate
                );

                return (
                  <div key={doc.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{doc.name}</h4>
                        <p className="text-[11px] text-teal-700">{doc.specialtyName} • Room {doc.roomNumber || '101'}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {docAppts.length} Booked
                      </span>
                    </div>

                    {isDocOnLeave ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center text-rose-800 text-xs font-bold">
                        On Approved Leave Today
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto">
                        {docAppts.length === 0 ? (
                          <p className="text-slate-400 italic text-center py-4 text-[11px]">No slots booked today.</p>
                        ) : (
                          docAppts.map((a) => (
                            <div
                              key={a.id}
                              onClick={() => setDrawerPatientId(a.patientId)}
                              className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-teal-400 cursor-pointer flex items-center justify-between transition-colors"
                            >
                              <div className="overflow-hidden">
                                <span className="font-bold text-slate-900 block truncate">{a.patientName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">#{a.tokenNumber} • {a.timeSlot}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                a.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                a.status === 'In Consultation' ? 'bg-teal-100 text-teal-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {a.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCTOR LEAVES & BLOCKED SLOTS */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Doctor Leave & Blocked Slot Management</h3>
              <p className="text-xs text-slate-500">Prevent appointment bookings during CME conferences, personal leave & clinical meetings.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLeaveModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Apply Doctor Leave
              </button>
              <button
                onClick={() => setIsBlockModalOpen(true)}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                + Block OPD Slot
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Approved Leaves */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Doctor Approved Leaves ({doctorLeaves.length})
                </h4>
              </div>

              <div className="space-y-2">
                {doctorLeaves.map((leave) => (
                  <div key={leave.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{leave.doctorName}</span>
                      <span className="text-slate-600 text-[11px]">{leave.reason}</span>
                      <p className="text-rose-700 font-semibold text-[11px] mt-0.5">
                        {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                    <button
                      onClick={() => dbService.deleteDoctorLeave(leave.id)}
                      className="text-xs text-rose-600 hover:underline font-bold"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocked Slots */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  OPD Blocked Time Slots ({blockedSlots.length})
                </h4>
              </div>

              <div className="space-y-2">
                {blockedSlots.map((block) => {
                  const doc = doctors.find((d) => d.id === block.doctorId);
                  return (
                    <div key={block.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{doc?.name || 'Physician'}</span>
                        <span className="text-slate-600 text-[11px]">{block.reason}</span>
                        <p className="text-amber-800 font-semibold text-[11px] mt-0.5">
                          {block.date} • {block.startTime} to {block.endTime}
                        </p>
                      </div>
                      <button
                        onClick={() => dbService.deleteBlockedSlot(block.id)}
                        className="text-xs text-rose-600 hover:underline font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT 360 DRAWER */}
      <Patient360Drawer
        patientId={drawerPatientId}
        isOpen={Boolean(drawerPatientId)}
        onClose={() => setDrawerPatientId(null)}
        onNavigate={onNavigate}
        onOpenBookingModal={onOpenBookingModal}
      />

      {/* APPLY LEAVE MODAL */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-base text-slate-900">Apply Doctor Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLeave} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Physician</label>
                <select
                  value={leaveDoctorId}
                  onChange={(e) => setLeaveDoctorId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialtyName})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Medical Conference"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save & Approve Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK SLOT MODAL */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-base text-slate-900">Block OPD Time Slot</h3>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBlock} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Physician</label>
                <select
                  value={blockDoctorId}
                  onChange={(e) => setBlockDoctorId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialtyName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={blockStartTime}
                    onChange={(e) => setBlockStartTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={blockEndTime}
                    onChange={(e) => setBlockEndTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical Case Conference"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Block Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
