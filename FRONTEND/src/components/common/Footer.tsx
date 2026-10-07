import React from 'react';
import { FOOTER_NAV_ITEMS, FooterNavItem } from '../../config/navigation';
import {
  HeartPulse,
  Phone,
  ShieldCheck,
  Award,
  ChevronRight,
  MapPin,
  Calendar
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenBookingModal }) => {
  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Value Banner */}
      <div className="border-b border-slate-800 py-10 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">24/7 Clinical Hotline</h4>
              <p className="text-slate-400 text-xs mt-1">Direct access to triage nurses and emergency ambulance coordination.</p>
              <p className="text-teal-400 font-bold text-sm mt-1">+1 (800) 555-APEX</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Verified Medical Specialists</h4>
              <p className="text-slate-400 text-xs mt-1">Board-certified physicians, modern diagnostic pathology and digital prescriptions.</p>
              <p className="text-slate-400 font-medium text-xs mt-1">100% HIPAA & GDPR Compliant</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">JCI Gold Seal of Quality</h4>
              <p className="text-slate-400 text-xs mt-1">Recognized nationally for patient safety standards and clinical excellence.</p>
              <p className="text-teal-400 font-bold text-xs mt-1">4.9/5 Average Patient Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="flex items-center gap-3 cursor-pointer select-none inline-flex"
              aria-label="MediEra Home"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-white leading-none">
                  Medi<span className="text-teal-400">Era</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">
                  Medical CRM + ERP System | by YantraEra
                </div>
              </div>
            </a>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              MediEra is an enterprise-grade Medical CRM and ERP system engineered by YantraEra for multi-branch clinics, patient engagement, role-based workflows, and full-spectrum practice administration.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate('/book-appointment')}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Appointment Online</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Col 2: Navigation Links (ONLY: About Us, Contact Us, FAQ) */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">
              Navigation
            </h4>
            <ul className="space-y-3 text-xs text-slate-400" aria-label="Footer Navigation">
              {FOOTER_NAV_ITEMS.map((item: FooterNavItem) => (
                <li key={item.id}>
                  <a
                    href={item.path}
                    onClick={(e) => handleLinkClick(e, item.path)}
                    className="hover:text-teal-400 transition-colors inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Branch Locations & Facilities */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">
              Clinical Branches
            </h4>
            <div className="space-y-4 text-xs text-slate-400">
              <div>
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Downtown Central Clinic
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 pl-5">100 Medical Center Way, Suite 400</p>
                <p className="text-[11px] text-slate-400 pl-5">Tel: +1 (555) 234-5670</p>
              </div>

              <div>
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Metro North Specialty Pavilion
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 pl-5">880 North Boulevard, Medical Wing B</p>
                <p className="text-[11px] text-slate-400 pl-5">Tel: +1 (555) 789-1020</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
          <p>
            © 2026 <strong>MediEra</strong> — Medical CRM &amp; ERP System. Copyright by{' '}
            <a
              href="https://yantraera.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 underline font-semibold transition-colors"
            >
              YantraEra
            </a>
            . All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Clinical Service</span>
            <span className="hover:text-slate-400 cursor-pointer">HIPAA Compliance Notice</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
