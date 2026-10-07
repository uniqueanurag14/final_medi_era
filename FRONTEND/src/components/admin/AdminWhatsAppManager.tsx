/**
 * Admin WhatsApp Business Platform & Notification Manager
 * 
 * Provides clinic administrators and staff with complete oversight of:
 * - Meta WhatsApp Business Cloud API health & config
 * - Real delivery metrics (Sent, Delivered, Read, Queued, Failed)
 * - Approved template definitions (Confirmation, 24h Reminder, 2h Reminder)
 * - Automated scheduler status & manual run trigger
 * - Live notification logs with WAMID tracking and 1-click retry
 * - Interactive test dispatch modal
 */

import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Play,
  Phone,
  ShieldCheck,
  Eye,
  CheckCheck,
  XCircle,
  X,
} from 'lucide-react';

interface WhatsAppNotification {
  id: string;
  appointmentId?: string;
  patientId?: string;
  phone: string;
  type: string;
  templateName: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED' | 'SKIPPED';
  provider: string;
  providerMessageId?: string;
  messageBody: string;
  variables?: any;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  scheduledFor: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  patientName?: string;
  doctorName?: string;
  appointmentDate?: string;
}

interface WhatsAppStats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  queued: number;
  cancelled: number;
}

interface WhatsAppConfigInfo {
  enabled: boolean;
  provider: string;
  apiUrl: string;
  hasApiKey: boolean;
  phoneNumberId: string;
  businessAccountId: string;
  templateLang: string;
  clinicName: string;
}

export const AdminWhatsAppManager: React.FC = () => {
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);
  const [stats, setStats] = useState<WhatsAppStats>({
    total: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    queued: 0,
    cancelled: 0,
  });
  const [config, setConfig] = useState<WhatsAppConfigInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedNotifForView, setSelectedNotifForView] = useState<WhatsAppNotification | null>(null);
  const [schedulerNotice, setSchedulerNotice] = useState<string | null>(null);

  // Test send form state
  const [testPhone, setTestPhone] = useState('+91 98765 43210');
  const [testType, setTestType] = useState<'confirmation' | 'reminder_24h' | 'reminder_2h'>('confirmation');
  const [testPatientName, setTestPatientName] = useState('Rahul Verma');
  const [testDoctorName, setTestDoctorName] = useState('Dr. Sarah Jenkins');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifsRes, statsRes, configRes] = await Promise.all([
        fetch('/api/whatsapp/notifications?limit=30').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/whatsapp/stats').then((r) => r.json()).catch(() => ({ data: {} })),
        fetch('/api/whatsapp/config').then((r) => r.json()).catch(() => ({ data: null })),
      ]);

      if (notifsRes?.data) setNotifications(notifsRes.data);
      if (statsRes?.data) setStats(statsRes.data);
      if (configRes?.data) setConfig(configRes.data);
    } catch (err: any) {
      console.warn('[WhatsApp Manager fetch error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunScheduler = async () => {
    try {
      setSchedulerNotice('Running background reminder check...');
      const res = await fetch('/api/whatsapp/scheduler/tick', { method: 'POST' }).then((r) => r.json());
      if (res?.data) {
        setSchedulerNotice(
          `Scheduler cycle complete: ${res.data.processedCount} processed, ${res.data.sentCount} sent, ${res.data.skippedCount} skipped.`
        );
      }
      fetchData();
      setTimeout(() => setSchedulerNotice(null), 6000);
    } catch (e: any) {
      setSchedulerNotice(`Scheduler error: ${e.message}`);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      const res = await fetch(`/api/whatsapp/notifications/${id}/retry`, { method: 'POST' }).then((r) => r.json());
      if (res.success) {
        alert('Notification retry initiated successfully.');
        fetchData();
      } else {
        alert(`Retry failed: ${res.data?.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      alert(`Network error: ${e.message}`);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          type: testType,
          patientName: testPatientName,
          doctorName: testDoctorName,
          hospitalName: config?.clinicName || 'MediEra Medical Care',
          appointmentDate: new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
          appointmentTime: '10:30 AM',
        }),
      }).then((r) => r.json());

      if (res.success) {
        setTestResult({ success: true, message: 'WhatsApp message sent successfully via Meta provider.' });
        fetchData();
        setTimeout(() => {
          setIsTestModalOpen(false);
          setTestResult(null);
        }, 2000);
      } else {
        setTestResult({ success: false, message: res.error || 'Failed to dispatch WhatsApp message.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestSending(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'READ':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <CheckCheck className="w-3 h-3 text-blue-600" />
            Read
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCheck className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            Sent
          </span>
        );
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Queued
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            Cancelled
          </span>
        );
      default:
        return <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Meta Cloud API Credentials Status */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  WhatsApp Business Platform
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                  {config?.provider === 'meta' ? 'Meta Cloud API Live' : 'Meta Simulation Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated appointment confirmations, 24-hour reminders, and 2-hour pre-visit notifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRunScheduler}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-teal-600" />
              <span>Trigger Scheduler</span>
            </button>
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Test Template</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {schedulerNotice && (
          <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-900 dark:text-teal-200 font-medium">
            {schedulerNotice}
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Messages</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">Sent</p>
          <p className="text-2xl font-black text-teal-800 dark:text-teal-300 mt-1">{stats.sent}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Delivered</p>
          <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">{stats.delivered}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Read</p>
          <p className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1">{stats.read}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Queued Reminders</p>
          <p className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">{stats.queued}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">Failed</p>
          <p className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1">{stats.failed}</p>
        </div>
      </div>

      {/* Approved Templates Accordion / Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Approved Meta WhatsApp Templates
            </h4>
          </div>
          <span className="text-xs text-slate-500">Language: {config?.templateLang || 'en_US'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* 1. Confirmation */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">1. Immediate Confirmation</span>
              <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400">appointment_confirmation</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
{`🏥 Appointment Confirmed
Hello {{patient_name}},
Your appointment has been confirmed. ✅
👨⚕️ Doctor: {{doctor_name}}
📅 Date: {{date}}
⏰ Time: {{time}}
🏥 Hospital: MediEra Medical Care
🆔 ID: {{appointment_id}}`}
            </div>
            <p className="text-[10px] text-slate-500">Trigger: Instant on appointment booking.</p>
          </div>

          {/* 2. 24-Hour Reminder */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">2. 24-Hour Reminder</span>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">appointment_reminder_24h</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
{`🏥 Appointment Reminder
Hello {{patient_name}},
This is a reminder that you have an appointment tomorrow.
👨⚕️ Doctor: {{doctor_name}}
📅 Date: {{date}}
⏰ Time: {{time}}
🏥 Hospital: MediEra Medical Care`}
            </div>
            <p className="text-[10px] text-slate-500">Trigger: Automatically 24 hours prior.</p>
          </div>

          {/* 3. 2-Hour Reminder */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">3. 2-Hour Reminder</span>
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">appointment_reminder_2h</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
{`🏥 Appointment Reminder
Hello {{patient_name}},
Your appointment is scheduled in approximately 2 hours.
👨⚕️ Doctor: {{doctor_name}}
⏰ Time: {{time}}
🏥 Hospital: MediEra Medical Care
Please arrive 10–15 minutes early.`}
            </div>
            <p className="text-[10px] text-slate-500">Trigger: Automatically 2 hours prior.</p>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Notification & Reminder Audit Logs
            </h4>
            <p className="text-xs text-slate-500">
              Complete idempotency tracking, Meta WAMID receipts, and delivery timeline.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            Showing {notifications.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Patient / Phone</th>
                <th className="p-3.5">Template Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Scheduled / Sent At</th>
                <th className="p-3.5">Provider ID (WAMID)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No WhatsApp notifications logged yet. Book an appointment or send a test template to start tracking.
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {n.patientName || 'Patient'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{n.phone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {n.type === 'confirmation' ? 'Appointment Confirmation' : n.type === 'reminder_24h' ? '24h Reminder' : '2h Reminder'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{n.templateName}</div>
                    </td>
                    <td className="p-3.5">
                      {renderStatusBadge(n.status)}
                      {n.errorMessage && (
                        <div className="text-[10px] text-rose-500 truncate max-w-xs mt-0.5">
                          {n.errorMessage}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <div>Scheduled: {new Date(n.scheduledFor).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      {n.sentAt && (
                        <div className="text-[10px] text-teal-700 dark:text-teal-400">
                          Sent: {new Date(n.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500 truncate max-w-[160px]">
                      {n.providerMessageId || '—'}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedNotifForView(n)}
                        className="px-2.5 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                      >
                        View
                      </button>
                      {n.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetry(n.id)}
                          className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Message Modal */}
      {selectedNotifForView && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  WhatsApp Notification Details
                </h4>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedNotifForView.id}</p>
              </div>
              <button
                onClick={() => setSelectedNotifForView(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Phone:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedNotifForView.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Template:</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">{selectedNotifForView.templateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Status:</span>
                <span>{renderStatusBadge(selectedNotifForView.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Provider Message ID:</span>
                <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300">{selectedNotifForView.providerMessageId || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Delivered Message Body:</span>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono whitespace-pre-line leading-relaxed text-slate-800 dark:text-slate-200">
                {selectedNotifForView.messageBody}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNotifForView(null)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Send Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Send Test WhatsApp Message
                </h4>
                <p className="text-xs text-slate-500">Verify live delivery with approved Meta template parameters.</p>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient WhatsApp Number (E.164)
                </label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-teal-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Approved Message Template
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 focus:outline-teal-600 font-semibold"
                >
                  <option value="confirmation">appointment_confirmation (Instant Booking)</option>
                  <option value="reminder_24h">appointment_reminder_24h (1 Day Before)</option>
                  <option value="reminder_2h">appointment_reminder_2h (2 Hours Before)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={testPatientName}
                    onChange={(e) => setTestPatientName(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    required
                    value={testDoctorName}
                    onChange={(e) => setTestDoctorName(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:text-rose-200'
                  }`}
                >
                  {testResult.message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testSending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testSending ? 'Sending...' : 'Dispatch Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
