import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { PatientFeedback, ServiceRecoveryTask } from '../../types';
import {
  Star,
  MessageSquare,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  User,
  Stethoscope,
  TrendingUp,
  HeartPulse,
  Smile,
  Frown,
  Meh,
  Search,
  Filter
} from 'lucide-react';

interface AdminFeedbackPageProps {
  onNavigate: (view: string) => void;
}

export const AdminFeedbackPage: React.FC<AdminFeedbackPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'recovery'>('feedback');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  // Service Recovery Resolution Modal
  const [selectedRecoveryTask, setSelectedRecoveryTask] = useState<ServiceRecoveryTask | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Submit Feedback Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [fbPatientId, setFbPatientId] = useState(dbService.patients[0]?.id || '');
  const [fbDoctorId, setFbDoctorId] = useState(dbService.doctors[0]?.id || '');
  const [fbRating, setFbRating] = useState(5);
  const [fbCategory, setFbCategory] = useState<'Doctor Care' | 'Wait Time' | 'Staff Friendliness' | 'Facility Cleanliness' | 'Billing'>('Doctor Care');
  const [fbComment, setFbComment] = useState('Excellent care and very attentive doctor!');

  const feedbacks = dbService.patientFeedback;
  const recoveryTasks = dbService.serviceRecoveryTasks;
  const metrics = dbService.getCrmDashboardMetrics();

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (selectedDoctor !== 'all' && fb.doctorId !== selectedDoctor) return false;
    if (selectedRating !== 'all' && fb.rating !== Number(selectedRating)) return false;
    return true;
  });

  const handleResolveRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecoveryTask || !resolutionNotes) return;
    dbService.resolveServiceRecoveryTask(selectedRecoveryTask.id, resolutionNotes);
    setSelectedRecoveryTask(null);
    setResolutionNotes('');
    alert(`Service recovery task resolved successfully!`);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = dbService.getPatientById(fbPatientId);
    const doctor = dbService.doctors.find((d) => d.id === fbDoctorId);
    if (!patient || !doctor) return;

    dbService.submitFeedback({
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      doctorId: doctor.id,
      doctorName: doctor.name,
      branchId: patient.branchId,
      branchName: 'NovaCare Downtown',
      rating: fbRating,
      category: fbCategory,
      comment: fbComment,
    });

    setIsSubmitModalOpen(false);
    if (fbRating <= 2) {
      alert(`Feedback recorded. Low rating (★${fbRating}) triggered an automated Urgent Service Recovery task!`);
    } else {
      alert(`Patient feedback submitted successfully!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Satisfaction & Service Recovery
            </h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current text-amber-500" />
              CSAT & NPS Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor patient reviews, sentiment scores across departments, and manage 24h SLA service recovery workflows
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Patient Review
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Average CSAT Score</span>
            <Star className="w-4 h-4 text-amber-500 fill-current" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.avgRating} <span className="text-sm font-normal text-slate-400">/ 5.0</span></p>
          <span className="text-[10px] text-emerald-600 font-semibold">94% Positive Feedback</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-teal-700 mt-1">{metrics.totalFeedback}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Verified patient responses</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Service Recovery SLA</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {recoveryTasks.filter((t) => t.status === 'Open').length} <span className="text-xs font-normal text-slate-400">Open</span>
          </p>
          <span className="text-[10px] text-rose-600 font-semibold">Under 24h response SLA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Resolved Incidents</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {recoveryTasks.filter((t) => t.status === 'Resolved').length}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Patient retention</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'feedback'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className="w-4 h-4" />
          Patient Reviews & Ratings ({feedbacks.length})
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'recovery'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Urgent Service Recovery Tasks ({recoveryTasks.length})
        </button>
      </div>

      {/* TAB 1: PATIENT REVIEWS LIST */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700"
              >
                <option value="all">All Doctors</option>
                {dbService.doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars (Promoter)</option>
                <option value="4">4 Stars (Satisfied)</option>
                <option value="3">3 Stars (Neutral)</option>
                <option value="2">2 Stars (Detractor)</option>
                <option value="1">1 Star (Critical)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.map((fb) => {
              const isDetractor = fb.rating <= 2;
              return (
                <div
                  key={fb.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 text-xs ${
                    isDetractor
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">{fb.patientName}</span>
                        <span className="bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded text-[10px]">
                          {fb.category}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">Physician: {fb.doctorName}</p>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < fb.rating ? 'text-amber-500 fill-current' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700 italic text-[11px] bg-white/80 p-3 rounded-xl border border-slate-100">
                    "{fb.comment}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>{fb.createdAt.split('T')[0]}</span>
                    {isDetractor && !fb.isResolved ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Service Recovery Active
                      </span>
                    ) : fb.isResolved ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Care Satisfaction Resolved
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SERVICE RECOVERY TASK BOARD */}
      {activeTab === 'recovery' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">Rating & Issue Summary</th>
                <th className="p-3.5">Assigned Agent</th>
                <th className="p-3.5">24-Hour SLA Target</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Outreach Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recoveryTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{task.patientName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{task.patientPhone}</p>
                  </td>

                  <td className="p-3.5 max-w-[280px]">
                    <div className="flex items-center gap-1 text-rose-600 font-bold mb-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      ★{task.rating} Rating
                    </div>
                    <p className="text-slate-700 text-[11px] truncate">{task.issueSummary}</p>
                  </td>

                  <td className="p-3.5 font-medium text-slate-800">
                    {task.assignedStaffName}
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {task.slaDue?.replace('T', ' ').substring(0, 16)}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        task.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    {task.status !== 'Resolved' ? (
                      <button
                        onClick={() => setSelectedRecoveryTask(task)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolve Incident
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolved: {task.resolutionNotes?.substring(0, 20)}...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* RESOLVE RECOVERY MODAL */}
      {selectedRecoveryTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Resolve Service Recovery Task</h2>
              <button onClick={() => setSelectedRecoveryTask(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleResolveRecovery} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p><strong>Patient:</strong> {selectedRecoveryTask.patientName} ({selectedRecoveryTask.patientPhone})</p>
                <p><strong>Issue:</strong> "{selectedRecoveryTask.issueSummary}"</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Outreach Outcome & Corrective Action *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g., Called patient, apologized for doctor delay due to emergency, and offered complimentary follow-up slot."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRecoveryTask(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Complete Service Recovery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG REVIEW MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Log Patient Satisfaction Review</h2>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient *</label>
                <select
                  value={fbPatientId}
                  onChange={(e) => setFbPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  {dbService.patients.slice(0, 15).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.patientId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Attending Physician *</label>
                <select
                  value={fbDoctorId}
                  onChange={(e) => setFbDoctorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                >
                  {dbService.doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Star Rating *</label>
                  <select
                    value={fbRating}
                    onChange={(e) => setFbRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-black text-amber-600"
                  >
                    <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                    <option value={4}>★★★★☆ (4 Stars - Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                    <option value={2}>★★☆☆☆ (2 Stars - Poor)</option>
                    <option value={1}>★☆☆☆☆ (1 Star - Critical)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Feedback Category</label>
                  <select
                    value={fbCategory}
                    onChange={(e) => setFbCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Doctor Care">Doctor Care</option>
                    <option value="Wait Time">Wait Time</option>
                    <option value="Staff Friendliness">Staff Friendliness</option>
                    <option value="Facility Cleanliness">Facility Cleanliness</option>
                    <option value="Billing">Billing & Pricing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Remarks / Review</label>
                <textarea
                  rows={2}
                  required
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
