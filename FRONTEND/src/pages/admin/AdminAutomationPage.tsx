import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { automationEngine } from '../../services/automationEngine';
import { AutomationRule, AutomationTriggerEvent, AutomationActionType } from '../../types';
import {
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Sliders,
  Send,
  MessageSquare,
  AlertTriangle,
  History,
  Tag,
  Calendar,
  Activity,
  ArrowRight,
  Filter
} from 'lucide-react';

interface AdminAutomationPageProps {
  onNavigate: (view: string) => void;
}

export const AdminAutomationPage: React.FC<AdminAutomationPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'simulator'>('rules');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState<AutomationTriggerEvent>('appointment.completed');
  const [actionType, setActionType] = useState<AutomationActionType>('schedule_followup');
  const [delayMinutes, setDelayMinutes] = useState(0);

  // Simulator State
  const [simEvent, setSimEvent] = useState<AutomationTriggerEvent>('appointment.completed');
  const [simPatientId, setSimPatientId] = useState(dbService.patients[0]?.id || '');
  const [simDoctorId, setSimDoctorId] = useState(dbService.doctors[0]?.id || '');
  const [simLog, setSimLog] = useState<string[]>([]);

  const rules = dbService.getAutomationRules();
  const executions = dbService.getAutomationExecutions();

  const handleToggleRule = (ruleId: string, currentStatus: boolean) => {
    dbService.updateAutomationRule(ruleId, { isActive: !currentStatus });
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    dbService.createAutomationRule({
      name,
      description,
      triggerEvent,
      isActive: true,
      conditions: [],
      actions: [
        {
          id: `act-${Date.now()}`,
          type: actionType,
          delayMinutes: Number(delayMinutes),
          config: {
            followupType: 'Post-Consultation Routine',
            taskTitle: `Automated Task: ${name}`,
            channel: 'whatsapp',
          },
        },
      ],
    });

    setIsCreateModalOpen(false);
    setName('');
    setDescription('');
    alert(`Automation rule "${name}" created and active!`);
  };

  const handleRunSimulator = async () => {
    const patient = dbService.getPatientById(simPatientId) || dbService.patients[0];
    const doctor = dbService.doctors.find((d) => d.id === simDoctorId) || dbService.doctors[0];

    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'System Patient';
    const patientId = patient?.id || 'demo-pat-01';
    const doctorName = doctor?.name || 'Attending Physician';

    const logs: string[] = [
      `[Trigger Initialized] Event: "${simEvent}" for Patient: ${patientName} (ID: ${patient?.patientId || 'N/A'})`,
      `[Processing Context] Doctor: ${doctorName}, Branch: Downtown Clinic`,
    ];

    const res = await automationEngine.trigger(simEvent, {
      patientId: patientId,
      patientName: patientName,
      patientPhone: patient?.phone || '+1 555-0100',
      patientEmail: patient?.email || 'patient@example.com',
      doctorId: doctor?.id || 'doc-general',
      doctorName: doctorName,
      appointmentDate: new Date().toISOString().split('T')[0],
      rating: 1, // for testing low rating service recovery
      comment: 'Wait time was too long before doctor saw me.',
    });

    res.forEach((r) => {
      logs.push(`[Rule Triggered] "${r.ruleName}" -> Executed Action: ${r.actionsExecuted.join(', ')} (Status: ${r.status})`);
    });

    if (res.length === 0) {
      logs.push(`[Info] No active rules matched the conditions for this test event.`);
    }

    setSimLog(logs);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clinical & CRM Automation Engine
            </h1>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              Event-Driven Workflows
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated rules triggered by clinical consultations, no-shows, overdue invoices, and patient feedback
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('simulator')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200"
          >
            <Play className="w-3.5 h-3.5 text-amber-600 fill-current" />
            Event Simulator
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Automation Rule
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Active Automation Recipes ({rules.length})
        </button>

        <button
          onClick={() => setActiveTab('executions')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'executions'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Execution Audit Log ({executions.length})
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'simulator'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          Live Event Simulator & Test Lab
        </button>
      </div>

      {/* TAB 1: AUTOMATION RULES */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => {
            return (
              <div
                key={rule.id}
                className={`p-5 rounded-2xl border transition-all space-y-4 text-xs ${
                  rule.isActive
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-sm">{rule.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1">{rule.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleRule(rule.id, rule.isActive)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      rule.isActive
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {rule.isActive ? 'Turn Off' : 'Activate'}
                  </button>
                </div>

                {/* Event -> Action Flow Ribbon */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                      WHEN: {rule.triggerEvent}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">
                      THEN: {rule.actions.map((a) => a.type.replace('_', ' ')).join(' + ')}
                    </span>
                  </div>

                  {rule.conditions && rule.conditions.length > 0 && (
                    <div className="text-[10px] text-slate-500">
                      <strong>Conditions:</strong> {rule.conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-teal-700 font-semibold">
                    <Zap className="w-3 h-3" />
                    Triggered {rule.triggerCount || 0} times
                  </span>
                  <span>Created {rule.createdAt.split('T')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: EXECUTIONS AUDIT LOG */}
      {activeTab === 'executions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Trigger Event</th>
                <th className="p-3.5">Rule Executed</th>
                <th className="p-3.5">Patient / Entity</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {executions.map((exe) => (
                <tr key={exe.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">
                    {exe.executedAt.replace('T', ' ').substring(0, 19)}
                  </td>
                  <td className="p-3.5 font-bold text-amber-800">
                    <span className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {exe.triggerEvent}
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-slate-900">{exe.ruleName}</td>
                  <td className="p-3.5 text-slate-700 font-medium">
                    {exe.patientName || exe.patientId || 'General Entity'}
                  </td>
                  <td className="p-3.5">
                    <span className="bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200 text-[11px]">
                      {exe.actionsExecuted.join(', ')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      {exe.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: EVENT SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div>
              <h2 className="text-base font-black text-slate-900">Event Trigger Test Simulator</h2>
              <p className="text-slate-500 mt-0.5">
                Simulate application events (consultation completed, no-show, low review) to verify automation rules and communication logs in real time
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Event Type to Emit *</label>
                <select
                  value={simEvent}
                  onChange={(e) => setSimEvent(e.target.value as AutomationTriggerEvent)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-800"
                >
                  <option value="appointment.completed">appointment.completed (Consultation Finished)</option>
                  <option value="appointment.no_show">appointment.no_show (Patient missed slot)</option>
                  <option value="feedback.low_rating">feedback.low_rating (1-2★ Review Submitted)</option>
                  <option value="invoice.overdue">invoice.overdue (Outstanding balance alert)</option>
                  <option value="patient.created">patient.created (New registration welcome)</option>
                  <option value="lead.created">lead.created (New inquiry capture)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Patient *</label>
                <select
                  value={simPatientId}
                  onChange={(e) => setSimPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  {dbService.patients.slice(0, 10).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.patientId}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Associated Physician</label>
                <select
                  value={simDoctorId}
                  onChange={(e) => setSimDoctorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  {dbService.doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRunSimulator}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 text-xs"
              >
                <Zap className="w-4 h-4 fill-current" />
                Emit Event & Execute Matching Rules
              </button>
            </div>
          </div>

          {/* Console / Output */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl shadow-xl flex flex-col justify-between font-mono text-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-teal-400 font-bold">AUTOMATION ENGINE CONSOLE</span>
                <span className="text-[10px] text-slate-400">Live Worker Active</span>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {simLog.length === 0 ? (
                  <p className="text-slate-600 italic">Select an event and click "Emit Event" to observe rule evaluations and dispatch logs...</p>
                ) : (
                  simLog.map((line, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {line.startsWith('[Trigger') && <span className="text-amber-400">{line}</span>}
                      {line.startsWith('[Processing') && <span className="text-blue-300">{line}</span>}
                      {line.startsWith('[Rule') && <span className="text-emerald-400 font-bold">{line}</span>}
                      {line.startsWith('[Info') && <span className="text-slate-400">{line}</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Status: Ready</span>
              <span>All storage mutations committed</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RULE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Create Automation Recipe</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Post-Consultation 48h Care Follow-up"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g., Automatically schedules nurse wellness check after consultation"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trigger Event *</label>
                  <select
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="appointment.completed">appointment.completed</option>
                    <option value="appointment.no_show">appointment.no_show</option>
                    <option value="invoice.overdue">invoice.overdue</option>
                    <option value="feedback.low_rating">feedback.low_rating</option>
                    <option value="patient.created">patient.created</option>
                    <option value="lead.created">lead.created</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Automated Action *</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="schedule_followup">Schedule Follow-up</option>
                    <option value="send_communication">Send WhatsApp / SMS</option>
                    <option value="create_crm_task">Create Staff Task</option>
                    <option value="apply_patient_tag">Apply Patient Tag</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Execution Delay (Minutes)</label>
                <input
                  type="number"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  placeholder="0 for immediate"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save & Enable Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
