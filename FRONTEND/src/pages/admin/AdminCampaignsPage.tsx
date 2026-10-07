import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { Campaign, CommunicationChannel, CampaignGoal } from '../../types';
import {
  Send,
  Plus,
  Play,
  Pause,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  Eye,
  Clock,
  Sparkles,
  BarChart3,
  Copy,
  ChevronRight,
  Filter,
  Layers
} from 'lucide-react';

interface AdminCampaignsPageProps {
  onNavigate: (view: string) => void;
}

export const AdminCampaignsPage: React.FC<AdminCampaignsPageProps> = ({ onNavigate }) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<CampaignGoal>('Recall');
  const [channel, setChannel] = useState<CommunicationChannel>('whatsapp');
  const [segmentId, setSegmentId] = useState(dbService.patientSegments[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('Dear {{patientName}}, your routine health check-up is due. Book your appointment at NovaCare with Dr. {{doctorName}} for special 15% discount. Call {{clinicPhone}}.');
  const [scheduledAt, setScheduledAt] = useState('2026-09-05T10:00');
  const [budget, setBudget] = useState(100);

  const campaigns = dbService.getCampaigns();
  const segments = dbService.getPatientSegments();

  const filteredCampaigns = campaigns.filter((c) => {
    if (selectedChannel !== 'all' && c.channel !== selectedChannel) return false;
    if (selectedStatus !== 'all' && c.status !== selectedStatus) return false;
    return true;
  });

  const totalRevenue = campaigns.reduce((s, c) => s + (c.revenueGenerated || 0), 0);
  const totalAppointments = campaigns.reduce((s, c) => s + (c.appointmentsGenerated || 0), 0);
  const totalAudience = campaigns.reduce((s, c) => s + (c.audienceCount || 0), 0);
  const totalDelivered = campaigns.reduce((s, c) => s + (c.deliveredCount || 0), 0);
  const avgDeliveryRate = totalAudience > 0 ? ((totalDelivered / totalAudience) * 100).toFixed(1) : '94.2';

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !body) return;

    const segment = segments.find((s) => s.id === segmentId);
    const audience = segment ? dbService.evaluateSegmentPatients(segment) : dbService.patients.slice(0, 15);

    const newCamp = dbService.createCampaign({
      name,
      goal,
      channel,
      segmentId,
      segmentName: segment?.name || 'All Active Patients',
      audienceCount: audience.length,
      templateSubject: subject,
      templateBody: body,
      status: 'Scheduled',
      scheduledAt: scheduledAt,
      budget: Number(budget),
    });

    setIsCreateModalOpen(false);
    setName('');
    setSelectedCampaign(newCamp);
    alert(`Campaign "${name}" scheduled successfully targeting ${audience.length} patients!`);
  };

  const handleRunNow = (campaignId: string) => {
    const updated = dbService.runCampaign(campaignId);
    if (updated) {
      setSelectedCampaign(updated);
      alert(`Campaign "${updated.name}" broadcast executed! Generated ${updated.appointmentsGenerated} bookings and $${updated.revenueGenerated} simulated revenue.`);
    }
  };

  const handleInsertToken = (token: string) => {
    setBody((prev) => `${prev} {{${token}}}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Patient Recall & Marketing Campaigns
            </h1>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Automated Outreach
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast targeted health recalls, seasonal check-up reminders, and promotional packages across SMS, WhatsApp & Email
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('admin-segments')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200"
          >
            <Layers className="w-4 h-4 text-purple-600" />
            Audience Segments
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* KPI Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Total Campaign Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-1">${totalRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">From recalled patient visits</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Appointments Generated</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalAppointments}</p>
          <span className="text-[10px] text-teal-600 font-semibold">Direct conversions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Audience Reach</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-700 mt-1">{totalAudience}</p>
          <span className="text-[10px] text-slate-500 font-semibold">{avgDeliveryRate}% avg delivery rate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase">
            <span>Active Campaigns</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {campaigns.filter((c) => c.status === 'Running' || c.status === 'Scheduled').length}
          </p>
          <span className="text-[10px] text-amber-700 font-semibold">Scheduled / in progress</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {['all', 'whatsapp', 'sms', 'email', 'push'].map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-all ${
                selectedChannel === ch
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {ch === 'all' ? 'All Channels' : ch}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-slate-700 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="Running">Running</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((camp) => {
          const ChannelIcon =
            camp.channel === 'whatsapp'
              ? MessageSquare
              : camp.channel === 'email'
              ? Mail
              : camp.channel === 'push'
              ? Bell
              : Smartphone;

          const channelColor =
            camp.channel === 'whatsapp'
              ? 'bg-emerald-100 text-emerald-800'
              : camp.channel === 'email'
              ? 'bg-blue-100 text-blue-800'
              : camp.channel === 'push'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-amber-100 text-amber-800';

          const statusColor =
            camp.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : camp.status === 'Running'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : camp.status === 'Scheduled'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-slate-100 text-slate-700 border-slate-200';

          return (
            <div
              key={camp.id}
              onClick={() => setSelectedCampaign(camp)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-500 transition-all p-5 flex flex-col justify-between cursor-pointer space-y-4 text-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${channelColor}`}>
                      <ChannelIcon className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-tight">{camp.name}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold">Goal: {camp.goal}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                    {camp.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600 text-[11px] line-clamp-2 border border-slate-100 italic">
                  "{camp.templateBody}"
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Target Segment</span>
                    <span className="font-bold text-slate-800 truncate block">{camp.segmentName}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Audience Size</span>
                    <span className="font-bold text-purple-700">{camp.audienceCount} Patients</span>
                  </div>
                </div>

                {/* Progress / Metrics */}
                {camp.status === 'Completed' ? (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Delivered / Read:</span>
                      <span className="font-bold text-emerald-700">{camp.deliveredCount} ({camp.readCount} read)</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Appointments Booked:</span>
                      <span className="font-bold text-teal-700">{camp.appointmentsGenerated}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Revenue Yield:</span>
                      <span className="font-black text-emerald-600">${camp.revenueGenerated?.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Scheduled for:</span>
                    <span className="font-bold text-slate-700">{camp.scheduledAt?.replace('T', ' ')}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                {camp.status !== 'Completed' ? (
                  <button
                    onClick={() => handleRunNow(camp.id)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Launch Broadcast Now
                  </button>
                ) : (
                  <div className="w-full text-center text-emerald-700 font-bold text-xs flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Campaign Broadcast Finished
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE CAMPAIGN WIZARD MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Create Patient Recall Campaign</h2>
                <p className="text-xs text-slate-500">Design dynamic broadcast messages targeting segmented cohorts</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Seasonal Flu Vaccine & Immunity Booster Recall"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Outreach Channel *</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value="whatsapp">WhatsApp Business API</option>
                    <option value="sms">SMS Text Message</option>
                    <option value="email">Email Newsletter</option>
                    <option value="push">App Push Notification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campaign Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as CampaignGoal)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value="Recall">Patient Recall / Checkup</option>
                    <option value="Chronic Care">Chronic Disease Care</option>
                    <option value="Promotional Package">Health Package Promotion</option>
                    <option value="Seasonal Reminder">Seasonal Health Advisory</option>
                    <option value="Birthday Greeting">Birthday Wellness Offer</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Target Patient Segment *</label>
                  <select
                    value={segmentId}
                    onChange={(e) => setSegmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-purple-700"
                  >
                    {segments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.memberCount} eligible patients) - {s.description}
                      </option>
                    ))}
                  </select>
                </div>

                {channel === 'email' && (
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Email Subject Line</label>
                    <input
                      type="text"
                      placeholder="Your Preventive Wellness Check-up is Due - NovaCare"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Tokens Bar */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Content & Tokens</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['patientName', 'doctorName', 'clinicName', 'clinicPhone', 'appointmentDate'].map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => handleInsertToken(token)}
                      className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-[10px] font-bold"
                    >
                      + {`{{${token}}}`}
                    </button>
                  ))}
                </div>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Broadcast Schedule Date/Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Budget ($)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
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
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Schedule Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
