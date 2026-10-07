import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { Lead, LeadStage, LeadSource } from '../../types';
import {
  Contact2,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Filter,
  DollarSign,
  Clock,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List,
  User,
  Building2,
  CalendarDays,
  Send
} from 'lucide-react';
import { communicationService } from '../../services/communicationProviders';

interface AdminLeadsPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string) => void;
}

const STAGES: { id: LeadStage; label: string; color: string; bg: string; border: string }[] = [
  { id: 'New', label: 'New Inquiries', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'Contacted', label: 'Contacted', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'Qualified', label: 'Qualified', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'Appointment Scheduled', label: 'Scheduled', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'Converted', label: 'Converted Patient', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'Lost', label: 'Lost / Closed', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
];

export const AdminLeadsPage: React.FC<AdminLeadsPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Lead Selected for Drawer/Detail
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // New Lead Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadSource, setNewLeadSource] = useState<LeadSource>('Website Form');
  const [newLeadService, setNewLeadService] = useState('General Consultation');
  const [newLeadBranchId, setNewLeadBranchId] = useState('branch-01');
  const [newLeadAssignedStaff, setNewLeadAssignedStaff] = useState('Rachel Gomez');
  const [newLeadPriority, setNewLeadPriority] = useState<'Low' | 'Normal' | 'High' | 'Urgent'>('Normal');
  const [newLeadEstimatedValue, setNewLeadEstimatedValue] = useState(150);
  const [newLeadNotes, setNewLeadNotes] = useState('');

  // Lost Form State
  const [lostReason, setLostReason] = useState('Chose another clinic');
  const [lostNotes, setLostNotes] = useState('');

  // Activity Form State
  const [activityType, setActivityType] = useState<'Call' | 'Email' | 'WhatsApp' | 'Note' | 'Meeting'>('Call');
  const [activitySummary, setActivitySummary] = useState('');
  const [activityOutcome, setActivityOutcome] = useState('Interested in booking next week');

  const leads = dbService.leads;
  const metrics = dbService.getCrmDashboardMetrics();

  const filteredLeads = leads.filter((l) => {
    if (selectedStage !== 'all' && l.stage !== selectedStage && l.status !== selectedStage) return false;
    if (selectedSource !== 'all' && l.source !== selectedSource) return false;
    if (selectedPriority !== 'all' && l.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.interestedService && l.interestedService.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStageChange = (leadId: string, stage: LeadStage) => {
    dbService.updateLeadStage(leadId, stage, 'Front Desk Staff');
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(dbService.getLeadById(leadId) || null);
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadPhone) return;

    const lead = dbService.createLead({
      name: newLeadName,
      phone: newLeadPhone,
      email: newLeadEmail,
      source: newLeadSource,
      branchId: newLeadBranchId,
      preferredBranchId: newLeadBranchId,
      interestedService: newLeadService,
      assignedStaffName: newLeadAssignedStaff,
      assignedStaffId: 'stf-01',
      priority: newLeadPriority,
      estimatedValue: Number(newLeadEstimatedValue),
      stage: 'New',
      status: 'New',
      notes: newLeadNotes,
    });

    setIsAddModalOpen(false);
    // Reset Form
    setNewLeadName('');
    setNewLeadPhone('');
    setNewLeadEmail('');
    setNewLeadNotes('');
    setSelectedLead(lead);
  };

  const handleConfirmConvert = () => {
    if (!selectedLead) return;
    try {
      const patient = dbService.convertLeadToPatient(selectedLead.id);
      setIsConvertModalOpen(false);
      setSelectedLead(null);
      alert(`Lead ${selectedLead.name} successfully converted to patient ${patient.firstName} ${patient.lastName} (${patient.patientId})!`);
      onNavigate(`admin-patient-detail-${patient.id}`);
    } catch (e: any) {
      alert(e.message || 'Failed to convert lead');
    }
  };

  const handleConfirmLost = () => {
    if (!selectedLead) return;
    dbService.markLeadLost(selectedLead.id, `${lostReason}: ${lostNotes}`, 'Front Desk Staff');
    setIsLostModalOpen(false);
    setSelectedLead(dbService.getLeadById(selectedLead.id) || null);
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !activitySummary) return;

    dbService.addCrmActivity({
      entityId: selectedLead.id,
      entityType: 'Lead',
      userId: 'usr-reception',
      userName: 'Rachel Gomez',
      type: activityType,
      title: `${activityType}: ${activitySummary}`,
      description: activityOutcome,
    });

    // Also auto-update lead stage if it was 'New'
    if (selectedLead.stage === 'New' || selectedLead.status === 'New') {
      dbService.updateLeadStage(selectedLead.id, 'Contacted', 'Rachel Gomez', `Logged ${activityType}`);
    }

    setIsActivityModalOpen(false);
    setActivitySummary('');
    setActivityOutcome('');
    setSelectedLead(dbService.getLeadById(selectedLead.id) || null);
  };

  const handleQuickCommunication = (lead: Lead, channel: 'sms' | 'whatsapp' | 'email') => {
    const template = dbService.communicationTemplates.find((t) => t.channel === channel && t.eventTrigger === 'lead.welcome');
    if (!template) {
      alert(`No template configured for ${channel}.`);
      return;
    }

    communicationService.send({
      patientId: lead.id,
      recipient: channel === 'email' ? lead.email || lead.phone : lead.phone,
      channel,
      templateId: template.id,
      templateSubject: template.subject,
      templateBody: template.body,
      variables: {
        patientName: lead.name,
        clinicName: 'NovaCare Wellness Hospital',
        clinicPhone: '+1 (555) 019-2834',
        doctorName: 'Dr. Sarah Jenkins',
      },
    });

    dbService.addCrmActivity({
      entityId: lead.id,
      entityType: 'Lead',
      userId: 'usr-reception',
      userName: 'Rachel Gomez',
      type: channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'Email' : 'SMS',
      title: `Sent ${channel.toUpperCase()} message`,
      description: `Dispatched "${template.name}" template to ${lead.phone}`,
    });

    alert(`Simulated ${channel.toUpperCase()} message sent successfully to ${lead.name}!`);
    setSelectedLead(dbService.getLeadById(lead.id) || null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Acquisition & Leads Pipeline
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              CRM Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture prospective patient inquiries, nurture leads across touchpoints & convert into clinical records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table View
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Lead
          </button>
        </div>
      </div>

      {/* KPI Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Total Leads</span>
            <Contact2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalLeads}</p>
          <span className="text-[10px] text-blue-600 font-semibold">{metrics.newLeads} awaiting first contact</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.conversionRate}</p>
          <span className="text-[10px] text-slate-500 font-semibold">{metrics.convertedLeads} registered patients</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-700 mt-1">${metrics.pipelineValue.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500 font-semibold">Estimated prospective care</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Open Inquiries</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{metrics.openLeads}</p>
          <span className="text-[10px] text-amber-700 font-semibold">In active follow-up</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[260px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search lead name, phone, interested specialty, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700 text-xs"
          >
            <option value="all">All Sources</option>
            <option value="Website Form">Website Form</option>
            <option value="Phone Inquiry">Phone Inquiry</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Referral">Patient Referral</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Social Media">Social Media</option>
            <option value="Insurance Desk">Insurance Desk</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700 text-xs"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent Priority</option>
            <option value="High">High Priority</option>
            <option value="Normal">Normal Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700 text-xs"
          >
            <option value="all">All Stages</option>
            {STAGES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
          {STAGES.map((st) => {
            const stageLeads = filteredLeads.filter((l) => (l.stage || l.status) === st.id);
            const totalStageVal = stageLeads.reduce((s, l) => s + (l.estimatedValue || 0), 0);

            return (
              <div
                key={st.id}
                className="bg-slate-50/80 rounded-2xl border border-slate-200 flex flex-col min-h-[500px]"
              >
                {/* Stage Header */}
                <div className={`p-3 border-b ${st.border} ${st.bg} rounded-t-2xl flex items-center justify-between`}>
                  <div>
                    <h3 className={`text-xs font-black ${st.color}`}>{st.label}</h3>
                    <p className="text-[10px] text-slate-500 font-semibold">${totalStageVal.toLocaleString()}</p>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full bg-white ${st.color} border ${st.border}`}>
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[620px]">
                  {stageLeads.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs italic">
                      No inquiries in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const priorityColor =
                        lead.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : lead.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700';

                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md transition-all cursor-pointer space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-black text-slate-900 leading-tight truncate">
                              {lead.name}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${priorityColor}`}>
                              {lead.priority || 'Normal'}
                            </span>
                          </div>

                          <p className="text-teal-700 font-semibold text-[11px] truncate">
                            {lead.interestedService || 'General Inquiry'}
                          </p>

                          <div className="text-[10px] text-slate-500 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span className="truncate">{lead.source}</span>
                            </div>
                          </div>

                          {lead.estimatedValue ? (
                            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">Est. Value</span>
                              <span className="font-bold text-slate-900">${lead.estimatedValue}</span>
                            </div>
                          ) : null}

                          {/* Quick stage transition button */}
                          <div className="pt-1 flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.stage || lead.status}
                              onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStage)}
                              className="w-full text-[10px] font-bold py-1 px-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Move → {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3.5">Lead Name</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Interested Service</th>
                <th className="p-3.5">Source & Branch</th>
                <th className="p-3.5">Priority & Est. Value</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="p-3.5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <p>{lead.name}</p>
                        <p className="text-[10px] text-slate-400 font-normal">Assigned: {lead.assignedStaffName || 'Reception'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5">
                    <p className="text-slate-800 font-medium">{lead.phone}</p>
                    <p className="text-[10px] text-slate-400">{lead.email || 'No email'}</p>
                  </td>

                  <td className="p-3.5 font-semibold text-teal-700">
                    {lead.interestedService || 'General Consultation'}
                  </td>

                  <td className="p-3.5">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                      {lead.source}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          lead.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-800'
                            : lead.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {lead.priority || 'Normal'}
                      </span>
                      <span className="font-bold text-slate-900">${lead.estimatedValue || 150}</span>
                    </div>
                  </td>

                  <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.stage || lead.status}
                      onChange={(e) => handleStageChange(lead.id, e.target.value as LeadStage)}
                      className="px-2 py-1 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 bg-white"
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    {lead.stage !== 'Converted' && lead.status !== 'Converted' ? (
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsConvertModalOpen(true);
                        }}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs inline-flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Convert
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Patient Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LEAD DETAIL DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">{selectedLead.name}</h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      selectedLead.stage === 'Converted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedLead.stage === 'Lost'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {selectedLead.stage || selectedLead.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Lead ID: {selectedLead.id} • Created {selectedLead.createdAt.split('T')[0]}</p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-3 bg-teal-50 border-b border-teal-100 flex items-center justify-between gap-2 overflow-x-auto text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleQuickCommunication(selectedLead, 'whatsapp')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </button>

                <button
                  onClick={() => handleQuickCommunication(selectedLead, 'sms')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  SMS
                </button>

                <button
                  onClick={() => setIsActivityModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Log Call / Note
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {selectedLead.stage !== 'Converted' && (
                  <>
                    <button
                      onClick={() => setIsConvertModalOpen(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Convert to Patient
                    </button>
                    <button
                      onClick={() => setIsLostModalOpen(true)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-lg"
                    >
                      Mark Lost
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Contact Information Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Contact & Preference Info</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number</span>
                    <span className="font-bold text-slate-800">{selectedLead.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email Address</span>
                    <span className="font-bold text-slate-800">{selectedLead.email || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Source Channel</span>
                    <span className="font-bold text-teal-700">{selectedLead.source}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Interested Specialty</span>
                    <span className="font-bold text-slate-800">{selectedLead.interestedService || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Staff</span>
                    <span className="font-bold text-slate-800">{selectedLead.assignedStaffName || 'Reception'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Treatment Value</span>
                    <span className="font-black text-purple-700">${selectedLead.estimatedValue || 150}</span>
                  </div>
                </div>

                {selectedLead.notes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Inquiry Notes</span>
                    <p className="text-slate-700 mt-0.5">{selectedLead.notes}</p>
                  </div>
                )}
              </div>

              {/* Stage Transition History */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center justify-between">
                  <span>Stage Progression History</span>
                  <span className="text-teal-600 font-semibold">{selectedLead.stageHistory?.length || 1} Events</span>
                </h3>

                <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-2">
                  {selectedLead.stageHistory && selectedLead.stageHistory.length > 0 ? (
                    selectedLead.stageHistory.map((sh, idx) => (
                      <div key={sh.id || idx} className="relative pb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-600 absolute -left-[17px] top-1" />
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>Moved to {sh.newStage}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{sh.timestamp.replace('T', ' ').substring(0, 16)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">By {sh.changedBy} {sh.reason ? `• ${sh.reason}` : ''}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 italic">Initial creation stage: {selectedLead.stage || 'New'}</div>
                  )}
                </div>
              </div>

              {/* CRM Interaction Log Timeline for this Lead */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Interactions & Communications
                  </h3>
                  <button
                    onClick={() => setIsActivityModalOpen(true)}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    + Add Log
                  </button>
                </div>

                <div className="space-y-2">
                  {dbService.getCrmActivities({ entityId: selectedLead.id }).map((act) => (
                    <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px]">{act.type}</span>
                          {act.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">{act.createdAt.split('T')[0]}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{act.description}</p>
                    </div>
                  ))}
                  {dbService.getCrmActivities({ entityId: selectedLead.id }).length === 0 && (
                    <div className="p-3 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No activity logged yet. Click "+ Add Log" or send a message.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW LEAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Add Prospective Patient Lead</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Jonathan Vance"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 234-5678"
                    value={newLeadPhone}
                    onChange={(e) => setNewLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="jonathan@example.com"
                    value={newLeadEmail}
                    onChange={(e) => setNewLeadEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value as LeadSource)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Website Form">Website Form</option>
                    <option value="Phone Inquiry">Phone Inquiry</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Referral">Patient Referral</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Insurance Desk">Insurance Desk</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newLeadPriority}
                    onChange={(e) => setNewLeadPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Interested Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology, Dental, Dermatology"
                    value={newLeadService}
                    onChange={(e) => setNewLeadService(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Est. Treatment Value ($)</label>
                  <input
                    type="number"
                    value={newLeadEstimatedValue}
                    onChange={(e) => setNewLeadEstimatedValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inquiry Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Patient requested info regarding consultation pricing and availability..."
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                  Save Lead Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONVERT TO PATIENT CONFIRMATION MODAL */}
      {isConvertModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h2 className="text-lg font-black text-slate-900">Convert Lead to Registered Patient</h2>
              <p className="text-xs text-slate-500 mt-1">
                This will create a permanent Medical Record (MRN / Patient ID) for <strong>{selectedLead.name}</strong>, transferring phone ({selectedLead.phone}), source ({selectedLead.source}), and tags.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-bold text-slate-800">{selectedLead.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-800">{selectedLead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Referral Channel:</span>
                <span className="font-bold text-teal-700">{selectedLead.source}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConvert}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Conversion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK LOST MODAL */}
      {isLostModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Mark Lead as Lost</h2>
              <button onClick={() => setIsLostModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Loss *</label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="Chose another clinic">Chose another clinic / competitor</option>
                  <option value="Price too high">Price / Budget too high</option>
                  <option value="Unreachable / No response">Unreachable / No response after 3 attempts</option>
                  <option value="Specialty not offered">Requested treatment specialty not offered</option>
                  <option value="Location too far">Location / Distance not convenient</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  value={lostNotes}
                  onChange={(e) => setLostNotes(e.target.value)}
                  placeholder="Patient stated they opted for clinic closer to home..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLostModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLost}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Mark as Lost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOG ACTIVITY MODAL */}
      {isActivityModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Log Interaction for {selectedLead.name}</h2>
              <button onClick={() => setIsActivityModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Interaction Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp Message</option>
                  <option value="Email">Email Communication</option>
                  <option value="Meeting">In-Person Consultation Desk</option>
                  <option value="Note">Internal Staff Note</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Called to explain Cardiology package pricing"
                  value={activitySummary}
                  onChange={(e) => setActivitySummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discussion Outcome & Next Step</label>
                <textarea
                  rows={2}
                  placeholder="Patient asked to follow up on Friday after 4 PM to confirm slot..."
                  value={activityOutcome}
                  onChange={(e) => setActivityOutcome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
