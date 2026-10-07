import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

interface PublicContactPageProps {
  onNavigate: (view: string) => void;
}

export const PublicContactPage: React.FC<PublicContactPageProps> = ({ onNavigate }) => {
  const branches = dbService.branches;
  const org = dbService.organization;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState(branches[0]?.id || 'branch-downtown');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name || !phone) {
      setFormError('Please provide your name and contact phone number.');
      return;
    }

    dbService.createLead({
      organizationId: 'org-01',
      branchId: branch,
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      source: 'Website',
      notes: message || 'Contact form inquiry',
      status: 'New',
    });

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Locations & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-3">
          Contact Our Clinical Branches
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          We are available 6 days a week for in-person appointments and 24/7 for emergency patient triage.
        </p>
      </div>

      {/* Locations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {branches.map((b) => (
          <div key={b.id} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest">Branch Location</span>
                <h3 className="text-lg font-extrabold text-slate-900">{b.name}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{b.address}, {b.city}, {b.state} - {b.postalCode}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Desk Phone: <strong>{b.phone}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Branch Email: {b.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                <span>OPD Hours: {b.operatingHours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inquiry Form & Map card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-2xl font-extrabold text-slate-950">Send Us an Inquiry</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Have questions about specialized procedures, insurance acceptance, or doctor availability? Fill out this quick form and our reception desk will contact you within 1 hour.
            </p>

            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-950 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-teal-900">
                <ShieldCheck className="w-4 h-4" /> Direct Emergency Hotline
              </p>
              <p className="text-slate-700">In case of acute medical emergencies, please call our 24/7 triage dispatch directly at <strong>+1 (800) 555-9999</strong>.</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-base text-emerald-950">Inquiry Received!</h4>
                <p className="text-xs text-emerald-800">Our patient relations team has registered your inquiry into the CRM and will call you shortly.</p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-bold text-emerald-700 hover:underline pt-2"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. eleanor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Preferred Branch</label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-teal-600 bg-white"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Message / Question</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what you need help with..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-teal-600"
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Submit Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
