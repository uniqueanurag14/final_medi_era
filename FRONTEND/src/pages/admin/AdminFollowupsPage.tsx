import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { FollowUp, FollowUpType } from '../../types';
import {
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Send,
  Calendar,
  User,
  Stethoscope,
  Filter,
  ArrowRight,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { communicationService } from '../../services/communicationProviders';

interface AdminFollowupsPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string) => void;
}

export const AdminFollowupsPage: React.FC<AdminFollowupsPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Pending');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState<FollowUp | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Add Form State
  const [patientId, setPatientId] = useState(dbService.patients[0]?.id || '');
  const [type, setType] = useState<FollowUpType>('Post-Consultation Routine');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedDoctorOrStaff, setAssignedDoctorOrStaff] = useState('Dr. Sarah Jenkins, MD');
  const [notes, setNotes] = useState('');

  const followups = dbService.followups;
  const metrics = dbService.getCrmDashboardMetrics();

  const filteredFollowups = followups.filter((f) => {
    if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
    if (selectedType !== 'all' && f.type !== selectedType) return false;
    if (selectedDoctor !== 'all' && f.assignedDoctorOrStaff !== selectedDoctor) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.patientName.toLowerCase().includes(q) ||
        f.patientPhone.includes(q) ||
        f.type.toLowerCase().includes(q) ||
        (f.notes && f.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = dbService.getPatientById(patientId);
    if (!patient) return;

    dbService.addFollowUp({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      type,
      date,
      assignedDoctorOrStaff,
      status: 'Pending',
      notes,
    });

    setIsAddModalOpen(false);
    setNotes('');
    alert(`Follow-up scheduled for ${patient.firstName} ${patient.lastName}!`);
  };

  const handleConfirmComplete = () => {
    if (!selectedFollowup) return;
    dbService.completeFollowUp(selectedFollowup.id, completionNotes);
    setIsCompleteModalOpen(false);
    setSelectedFollowup(null);
    setCompletionNotes('');
    alert(`Follow-up marked as completed!`);
  };

  const handleSendReminder = (f: FollowUp, channel: 'sms' | 'whatsapp') => {
    const template = dbService.communicationTemplates.find((t) => t.channel === channel && t.eventTrigger === 'followup.reminder');
    if (!template) {
      alert(`No template for ${channel}`);
      return;
    }

    communicationService.send({
      patientId: f.patientId,
      recipient: f.patientPhone,
      channel,
      templateId: template.id,
      templateSubject: template.subject,
      templateBody: template.body,
      variables: {
        patientName: f.patientName,
        doctorName: f.assignedDoctorOrStaff,
        clinicName: 'NovaCare Hospital',
        clinicPhone: '+1 (555) 019-2834',
        appointmentDate: f.date,
      },
    });

    dbService.addCrmActivity({
      entityId: f.patientId,
      entityType: 'Patient',
      userId: 'usr-reception',
      userName: 'Rachel Gomez',
      type: channel === 'whatsapp' ? 'WhatsApp' : 'SMS',
      title: `Sent Follow-up Reminder (${channel.toUpperCase()})`,
      description: `Dispatched message for follow-up date: ${f.date}`,
    });

    alert(`Simulated ${channel.toUpperCase()} reminder sent to ${f.patientName} (${f.patientPhone})!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Care Follow-ups & Recalls
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Clinical Outreach
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage post-consultation care checks, lab result reviews, chronic illness monitoring, and no-show patient recoveries
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Follow-up
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Pending Follow-ups</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.pendingFollowups}</p>
          <span className="text-[10px] text-amber-600 font-semibold">{metrics.overdueFollowups} overdue SLA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>No-Show Recovery</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.noShowRecoveryRate}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Patients re-engaged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Completed Care Checks</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-700 mt-1">
            {followups.filter((f) => f.status === 'Completed').length}
          </p>
          <span className="text-[10px] text-teal-600 font-semibold">Resolved clinical touchpoints</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Assigned Physicians</span>
            <Stethoscope className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 mt-1">{dbService.doctors.length}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Active care providers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient name, phone, or clinical outcome notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Outreach</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 text-xs"
          >
            <option value="all">All Follow-up Types</option>
            <option value="Post-Consultation Routine">Post-Consultation Routine</option>
            <option value="Lab Result Review">Lab Result Review</option>
            <option value="Chronic Care Monitoring">Chronic Care Monitoring</option>
            <option value="Preventive Recall">Preventive Recall</option>
            <option value="No-show Recovery">No-show Recovery</option>
            <option value="Prescription Refill">Prescription Refill</option>
          </select>
        </div>
      </div>

      {/* Follow-ups Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-3.5">Patient Details</th>
              <th className="p-3.5">Follow-up Category</th>
              <th className="p-3.5">Target Date</th>
              <th className="p-3.5">Assigned Clinician</th>
              <th className="p-3.5">Clinical Care Notes</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFollowups.map((f) => {
              const isOverdue = f.status === 'Pending' && new Date(f.date) < new Date();

              const typeColor =
                f.type === 'No-show Recovery'
                  ? 'bg-rose-100 text-rose-800'
                  : f.type === 'Lab Result Review'
                  ? 'bg-blue-100 text-blue-800'
                  : f.type === 'Chronic Care Monitoring'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-teal-100 text-teal-800';

              return (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <button
                      onClick={() => onNavigate(`admin-patient-detail-${f.patientId}`)}
                      className="text-left font-bold text-slate-900 hover:text-teal-600"
                    >
                      {f.patientName}
                    </button>
                    <p className="text-[11px] text-slate-500 font-mono">{f.patientPhone}</p>
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${typeColor}`}>
                      {f.type}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                        {f.date}
                      </span>
                    </div>
                    {isOverdue && <span className="text-[9px] font-bold text-rose-600">OVERDUE</span>}
                  </td>

                  <td className="p-3.5 font-medium text-slate-800">
                    {f.assignedDoctorOrStaff}
                  </td>

                  <td className="p-3.5 max-w-[220px]">
                    <p className="text-slate-600 text-[11px] truncate">{f.notes || 'Routine check'}</p>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.status === 'Cancelled'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {f.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleSendReminder(f, 'whatsapp')}
                            title="Send WhatsApp Reminder"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleSendReminder(f, 'sms')}
                            title="Send SMS Reminder"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedFollowup(f);
                              setIsCompleteModalOpen(true);
                            }}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                        </>
                      )}

                      {f.status === 'Completed' && (
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Care Resolved
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SCHEDULE FOLLOWUP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Schedule Patient Follow-up</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  {dbService.patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Follow-up Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FollowUpType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Post-Consultation Routine">Post-Consultation Routine</option>
                    <option value="Lab Result Review">Lab Result Review</option>
                    <option value="Chronic Care Monitoring">Chronic Care Monitoring</option>
                    <option value="Preventive Recall">Preventive Recall</option>
                    <option value="No-show Recovery">No-show Recovery</option>
                    <option value="Prescription Refill">Prescription Refill</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Doctor or Nurse</label>
                <select
                  value={assignedDoctorOrStaff}
                  onChange={(e) => setAssignedDoctorOrStaff(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  {dbService.doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                  <option value="Nurse Triage Desk">Nurse Triage Desk</option>
                  <option value="Rachel Gomez (Front Desk)">Rachel Gomez (Front Desk)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Check patient's blood pressure recovery and medication tolerance..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETE FOLLOWUP MODAL */}
      {isCompleteModalOpen && selectedFollowup && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Resolve Follow-up Task</h2>
              <button onClick={() => setIsCompleteModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p><strong>Patient:</strong> {selectedFollowup.patientName}</p>
                <p><strong>Category:</strong> {selectedFollowup.type}</p>
                <p><strong>Initial Notes:</strong> {selectedFollowup.notes || 'None'}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Outcome & Resolution Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Contacted patient via phone; patient confirmed symptoms resolved and medication finished."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Care Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
