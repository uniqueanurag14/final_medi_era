import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { communicationService } from '../../services/communicationProviders';
import { CommunicationTemplate, CommunicationChannel } from '../../types';
import {
  MessageSquare,
  Plus,
  Mail,
  Smartphone,
  Bell,
  Eye,
  Send,
  Sparkles,
  Copy,
  CheckCircle2,
  Sliders,
  Filter
} from 'lucide-react';

interface AdminTemplatesPageProps {
  onNavigate: (view: string) => void;
}

export const AdminTemplatesPage: React.FC<AdminTemplatesPageProps> = ({ onNavigate }) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(
    dbService.communicationTemplates[0] || null
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestSendModalOpen, setIsTestSendModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<CommunicationChannel>('whatsapp');
  const [eventTrigger, setEventTrigger] = useState('appointment.booked');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('Dear {{patientName}}, your appointment with {{doctorName}} is confirmed for {{appointmentDate}} at {{appointmentTime}}. Token: {{tokenNumber}}.');

  // Test Send State
  const [testRecipient, setTestRecipient] = useState('+1 (555) 234-5678');

  const templates = dbService.communicationTemplates;

  const filteredTemplates = templates.filter((t) => {
    if (selectedChannel !== 'all' && t.channel !== selectedChannel) return false;
    return true;
  });

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !body) return;

    const newTpl = dbService.createCommunicationTemplate({
      name,
      channel,
      eventTrigger,
      subject: channel === 'email' ? subject : undefined,
      body,
      variables: ['patientName', 'doctorName', 'appointmentDate', 'appointmentTime', 'clinicName', 'clinicPhone'],
      isActive: true,
    });

    setIsModalOpen(false);
    setSelectedTemplate(newTpl);
    setName('');
    alert(`Template "${name}" saved successfully!`);
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !testRecipient) return;

    const log = await communicationService.send({
      patientId: 'simulated-patient-id',
      recipient: testRecipient,
      channel: selectedTemplate.channel,
      templateId: selectedTemplate.id,
      templateSubject: selectedTemplate.subject,
      templateBody: selectedTemplate.body,
      variables: {
        patientName: 'Jane Smith',
        doctorName: 'Dr. Sarah Jenkins, MD',
        clinicName: 'NovaCare Wellness Hospital',
        clinicPhone: '+1 (555) 019-2834',
        appointmentDate: '2026-09-04',
        appointmentTime: '10:30 AM',
        tokenNumber: 'A-12',
      },
    });

    setIsTestSendModalOpen(false);
    alert(`Simulated ${selectedTemplate.channel.toUpperCase()} message sent to ${testRecipient}!\nStatus: ${log.status}\nRendered message:\n"${log.renderedBody || log.content}"`);
  };

  const renderedPreviewText = selectedTemplate
    ? selectedTemplate.body
        .replace(/{{patientName}}/g, 'Jane Smith')
        .replace(/{{doctorName}}/g, 'Dr. Sarah Jenkins, MD')
        .replace(/{{clinicName}}/g, 'NovaCare Wellness')
        .replace(/{{clinicPhone}}/g, '+1 (555) 019-2834')
        .replace(/{{appointmentDate}}/g, 'Sep 4, 2026')
        .replace(/{{appointmentTime}}/g, '10:30 AM')
        .replace(/{{tokenNumber}}/g, 'A-12')
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Omnichannel Communication Templates
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Messaging Studio
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standardize transactional notifications, booking confirmations, and health advisories across WhatsApp, SMS, Email & Push
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Channel Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
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
      </div>

      {/* Template Grid & Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Templates List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tpl) => {
            const isSelected = selectedTemplate?.id === tpl.id;
            const ChannelIcon =
              tpl.channel === 'whatsapp'
                ? MessageSquare
                : tpl.channel === 'email'
                ? Mail
                : tpl.channel === 'push'
                ? Bell
                : Smartphone;

            const channelColor =
              tpl.channel === 'whatsapp'
                ? 'bg-emerald-100 text-emerald-800'
                : tpl.channel === 'email'
                ? 'bg-blue-100 text-blue-800'
                : tpl.channel === 'push'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-amber-100 text-amber-800';

            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplate(tpl)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-600 shadow-md ring-1 ring-teal-600'
                    : 'bg-white border-slate-200 shadow-xs hover:border-teal-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg ${channelColor}`}>
                        <ChannelIcon className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm leading-tight">{tpl.name}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">Event: {tpl.eventTrigger}</span>
                      </div>
                    </div>

                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      {tpl.channel}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{tpl.body}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{tpl.variables?.length || 4} dynamic tokens</span>
                  <span className="text-teal-700 font-bold">Click to Preview →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Live Mockup Preview */}
        <div className="lg:col-span-1">
          {selectedTemplate ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Live Smartphone Preview</h3>
                  <p className="text-[10px] text-slate-400">Rendered with simulated patient variables</p>
                </div>

                <button
                  onClick={() => setIsTestSendModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  Test Dispatch
                </button>
              </div>

              {/* Mockup Frame */}
              <div className="bg-slate-900 p-4 rounded-3xl shadow-xl max-w-[320px] mx-auto border-4 border-slate-800 space-y-3">
                {/* Status Bar */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-2">
                  <span>9:41 AM</span>
                  <div className="flex gap-1">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Sender Header */}
                <div className="bg-slate-800 p-2.5 rounded-2xl flex items-center gap-2 text-white">
                  <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center font-bold text-xs">
                    N
                  </div>
                  <div>
                    <p className="font-bold text-xs">NovaCare Hospital</p>
                    <p className="text-[9px] text-teal-400">Verified Business Account</p>
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="bg-teal-900/40 text-teal-100 p-3.5 rounded-2xl border border-teal-700/50 space-y-2 text-xs leading-relaxed">
                  {selectedTemplate.subject && (
                    <p className="font-bold text-teal-300 border-b border-teal-700/50 pb-1">
                      {selectedTemplate.subject}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{renderedPreviewText}</p>
                  <div className="text-right text-[9px] text-teal-400/80 font-mono">
                    Just now • Delivered ✓✓
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] space-y-1">
                <span className="font-bold text-slate-800 block text-[10px] uppercase">Detected Tokens:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.variables?.map((v, i) => (
                    <span key={i} className="bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded text-[9px] font-mono">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
              Select a template to view the live device mockup
            </div>
          )}
        </div>
      </div>

      {/* CREATE TEMPLATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Create Message Template</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Appointment Confirmation WhatsApp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Channel *</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="whatsapp">WhatsApp Business API</option>
                    <option value="sms">SMS Text</option>
                    <option value="email">Email</option>
                    <option value="push">Mobile App Push</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trigger Event</label>
                  <select
                    value={eventTrigger}
                    onChange={(e) => setEventTrigger(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  >
                    <option value="appointment.booked">appointment.booked</option>
                    <option value="appointment.reminder">appointment.reminder</option>
                    <option value="lead.welcome">lead.welcome</option>
                    <option value="followup.reminder">followup.reminder</option>
                    <option value="feedback.request">feedback.request</option>
                    <option value="invoice.created">invoice.created</option>
                  </select>
                </div>
              </div>

              {channel === 'email' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    placeholder="Your Consultation Summary - NovaCare"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Template Content</label>
                <textarea
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEST SEND MODAL */}
      {isTestSendModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900">Simulate Test Dispatch</h2>
              <button onClick={() => setIsTestSendModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleTestSend} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recipient Destination *</label>
                <input
                  type="text"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="+1 (555) 234-5678 or user@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
                <strong>Channel:</strong> {selectedTemplate.channel.toUpperCase()}<br />
                <strong>Template:</strong> {selectedTemplate.name}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestSendModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Test Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
