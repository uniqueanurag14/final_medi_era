import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Calendar,
  CreditCard,
  Video,
  FlaskConical,
  Pill,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../../services/mockDatabase';

interface PublicFaqPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const PublicFaqPage: React.FC<PublicFaqPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0, 1]);

  const faqs: FaqItem[] = [
    {
      category: 'Appointments',
      question: 'How do I book an appointment with a specialist?',
      answer:
        'You can book an appointment online anytime through our website by clicking "Book Appointment", selecting your specialty and preferred doctor, and picking an available time slot. You can also walk into any of our clinic branches for same-day walk-in consultation.',
    },
    {
      category: 'Appointments',
      question: 'What is the Live Queue Token system?',
      answer:
        'NovaCare operates an intelligent real-time OPD token dispenser. When you arrive at the reception desk, you receive a digital queue token. Your live position in the waiting queue and estimated consultation time is displayed on clinic monitor screens and on your Patient Health Portal.',
    },
    {
      category: 'Appointments',
      question: 'Can I reschedule or cancel my appointment?',
      answer:
        'Yes. You can reschedule or cancel your appointment up to 2 hours prior to the slot through your Patient Portal or by contacting our 24/7 reception helpline at +1 (800) 555-NOVA with no cancellation penalty.',
    },
    {
      category: 'Insurance',
      question: 'Do you accept health insurance and cashless TPA claims?',
      answer:
        'Yes, NovaCare is empaneled with all major commercial insurers and government health programs including Blue Cross Blue Shield, Aetna, Cigna, UnitedHealthcare, and Medicare. Our on-site Insurance Desk handles pre-authorization and instant cashless settlement.',
    },
    {
      category: 'Insurance',
      question: 'What documents are needed for cashless insurance pre-authorization?',
      answer:
        'Please bring your Government-issued Photo ID (Driver License or Passport), your active Insurance Card / Policy number, and any prior medical referral letters or diagnostic reports.',
    },
    {
      category: 'Telemedicine',
      question: 'How do video teleconsultations work?',
      answer:
        'Video consultations are conducted securely inside your browser using encrypted WebRTC streaming. No software downloads are required. Once you schedule a Tele-OPD slot, you will receive a secure portal link. Your doctor will join the room and review your clinical notes live.',
    },
    {
      category: 'Telemedicine',
      question: 'Will I receive a digital prescription after a teleconsultation?',
      answer:
        'Yes. Following the video consultation, your physician issues a digitally signed electronic prescription (e-Rx) with medication dosages and instructions, immediately downloadable from your Patient Portal.',
    },
    {
      category: 'Diagnostics',
      question: 'How quickly are diagnostic blood and pathology lab reports ready?',
      answer:
        'Routine laboratory tests (CBC, Lipid Panel, Blood Sugar, HbA1c, Liver Function) are processed within 2 to 4 hours. Specialized endocrine, cardiac markers, and microbiology cultures are typically ready within 24 to 48 hours and published directly to your portal.',
    },
    {
      category: 'Diagnostics',
      question: 'Is fasting required for routine annual health checkup packages?',
      answer:
        'Yes, for comprehensive metabolic panels, lipid profiles, and fasting blood glucose tests, we recommend an 8 to 10 hour overnight water-only fasting period prior to blood sample collection.',
    },
    {
      category: 'Pharmacy',
      question: 'Can I get my prescribed medicines delivered to my home?',
      answer:
        'Yes. Our in-house pharmacy fulfills all prescriptions issued by NovaCare doctors. You can request contactless home delivery through your portal, or collect your medication directly from the clinic pharmacy counter on your way out.',
    },
    {
      category: 'Emergency',
      question: 'What are your emergency care and trauma center hours?',
      answer:
        'Our Emergency & Level-1 Trauma Center at the Downtown Central Clinic operates 24 hours a day, 7 days a week, 365 days a year, with full on-call trauma surgeons, anesthesiologists, and intensive care specialists.',
    },
  ];

  const categories = ['All', 'Appointments', 'Insurance', 'Telemedicine', 'Diagnostics', 'Pharmacy', 'Emergency'];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleFaq = (index: number) => {
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter((i) => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Knowledge Base & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-3">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Everything you need to know about clinic visits, appointments, insurance coverage, and digital health records.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions (e.g., insurance, fasting, teleconsultation)..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm shadow-sm focus:outline-teal-600 font-medium"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No questions found matching your search</p>
            <p className="text-xs text-slate-500 mt-1">Try different keywords or clear the category filter.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndices.includes(idx);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {faq.category}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-extrabold">Still have unanswered questions?</h3>
          <p className="text-xs text-slate-400 max-w-lg">
            Our 24/7 patient support coordination team is available to assist you with scheduling, insurance verification, and billing inquiries.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('public-contact')}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
          <button
            type="button"
            onClick={onOpenBookingModal}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};
