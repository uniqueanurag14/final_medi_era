import React from 'react';
import {
  HeartPulse,
  ShieldCheck,
  Award,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  Stethoscope,
  Activity,
  ArrowRight,
  Globe2,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { dbService } from '../../services/mockDatabase';

interface PublicAboutPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: () => void;
}

export const PublicAboutPage: React.FC<PublicAboutPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const doctors = dbService.doctors;
  const specialties = dbService.specialties;
  const branches = dbService.branches;

  const leadership = [
    {
      name: 'Dr. Sarah Jenkins, MD, FACC',
      role: 'Chief Medical Officer & Senior Cardiologist',
      experience: '18+ Years',
      education: 'Johns Hopkins School of Medicine',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      bio: 'Pioneering minimally invasive cardiovascular interventions and clinical quality benchmarks across all NovaCare facilities.',
    },
    {
      name: 'Dr. Vikram Malhotra, MS, MCh',
      role: 'Director of Orthopedic Surgery & Trauma',
      experience: '16+ Years',
      education: 'Royal College of Surgeons',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      bio: 'Specialist in robotic-assisted joint arthroplasty, complex trauma reconstruction, and sports injury rehabilitation.',
    },
    {
      name: 'Dr. Priya Desai, MD, FAAP',
      role: 'Head of Pediatrics & Neonatal Intensive Care',
      experience: '14+ Years',
      education: 'Harvard Medical School',
      image: 'https://images.unsplash.com/photo-1594824813596-f09b55f1f83c?auto=format&fit=crop&q=80&w=300',
      bio: 'Passionate advocate for preventive pediatric health, developmental pediatrics, and family-centered pediatric emergency care.',
    },
    {
      name: 'Dr. Rahul Sharma, MD (Internal Med)',
      role: 'Chief of Outpatient Services & Preventive Health',
      experience: '12+ Years',
      education: 'Stanford University Medical Center',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
      bio: 'Leading outpatient chronic disease management protocols for diabetes, hypertension, and preventive wellness checks.',
    },
  ];

  const milestones = [
    { year: '2012', title: 'Foundation', desc: 'Established our flagship Downtown Central Clinic with 4 core specialties.' },
    { year: '2016', title: 'JCI Accreditation', desc: 'Awarded Joint Commission International accreditation for patient safety standards.' },
    { year: '2020', title: 'Telemedicine & EMR', desc: 'Digitized 100% of patient records and launched HIPAA-compliant teleconsultations.' },
    { year: '2024', title: 'Multi-Branch Network', desc: 'Expanded to Metro North Pavilion and Westside Community Health Center.' },
    { year: '2026', title: 'NovaCare OS Platform', desc: 'Operating advanced AI-guided clinical CRM with 50,000+ happy active patients.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-8 sm:p-14 overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/30">
            About NovaCare Health System
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 leading-tight">
            Excellence in Clinical Care. Driven by Compassion.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-4 leading-relaxed">
            NovaCare is a multi-specialty healthcare network dedicated to delivering evidence-based medicine, advanced diagnostic precision, and seamless digital patient journeys.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onOpenBookingModal}
              className="px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Book In-Person Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('public-doctors')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Explore 40+ Physicians
            </button>
          </div>
        </div>

        {/* Decorative Grid Stats Overlay */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center opacity-10 pointer-events-none">
          <HeartPulse className="w-96 h-96 text-teal-400" />
        </div>
      </div>

      {/* Trust Numbers & Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-teal-700">50,000+</p>
          <p className="text-xs font-bold text-slate-900 mt-1">Patients Treated</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across OPD & Inpatient Care</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-teal-700">99.4%</p>
          <p className="text-xs font-bold text-slate-900 mt-1">Patient Satisfaction</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Verified CSAT Post-Care</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-teal-700">{specialties.length}+</p>
          <p className="text-xs font-bold text-slate-900 mt-1">Super Specialties</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Cardiology, Ortho, Neuro & More</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm text-center">
          <p className="text-3xl sm:text-4xl font-extrabold text-teal-700">{branches.length}</p>
          <p className="text-xs font-bold text-slate-900 mt-1">Modern Campuses</p>
          <p className="text-[11px] text-slate-500 mt-0.5">24/7 Emergency & Walk-in OPD</p>
        </div>
      </div>

      {/* Mission, Vision & Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Our Clinical Mission</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            To provide compassionate, patient-centered healthcare of uncompromising clinical quality, accessible to all communities through ethical medical practice and advanced technology.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Globe2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Our Vision</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            To be recognized as the regional benchmark in clinical outcomes, zero-wait outpatient operations, and integrated preventive wellness through innovative digital health systems.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Core Values</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Integrity, clinical transparency, patient empathy, and technological excellence. Every treatment plan is discussed openly with patients and their families.
          </p>
        </div>
      </div>

      {/* Accreditations & Quality Standards */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
            Gold Standard Accreditations
          </span>
          <h2 className="text-2xl font-extrabold text-slate-950 mt-1">
            Certified by Leading Global Healthcare Bodies
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-slate-800">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-xs">
            <Award className="w-8 h-8 text-teal-600 mb-2" />
            <p className="text-sm font-extrabold text-slate-900">JCI Accredited</p>
            <p className="text-[10px] text-slate-400 font-normal">Joint Commission International</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="text-sm font-extrabold text-slate-900">HIPAA Compliant</p>
            <p className="text-[10px] text-slate-400 font-normal">Protected Health Information</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm font-extrabold text-slate-900">NABH Standards</p>
            <p className="text-[10px] text-slate-400 font-normal">National Hospital Board</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center text-center shadow-xs">
            <Sparkles className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-sm font-extrabold text-slate-900">ISO 9001:2015</p>
            <p className="text-[10px] text-slate-400 font-normal">Certified Clinical Processes</p>
          </div>
        </div>
      </div>

      {/* Clinical Leadership Team */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
            Medical Board
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
            Meet Our Clinical Leadership
          </h2>
          <p className="text-xs text-slate-600 mt-2">
            Board-certified physicians and surgical directors heading our patient safety protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((leader, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              <img
                src={leader.image}
                alt={leader.name}
                className="w-full h-52 object-cover"
              />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{leader.name}</h3>
                  <p className="text-xs font-bold text-teal-700">{leader.role}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{leader.education}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{leader.bio}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Experience:</span>
                  <span className="font-bold text-slate-800">{leader.experience}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Milestones */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700">
            Journey of Excellence
          </span>
          <h2 className="text-2xl font-extrabold text-slate-950 mt-1">
            Over a Decade of Healthcare Innovation
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {milestones.map((m, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-lg font-black text-teal-700 font-mono">{m.year}</span>
              <h4 className="text-xs font-extrabold text-slate-900">{m.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-teal-700 text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to experience patient-first care?</h3>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
            Schedule an appointment with our specialist physicians or walk into any of our clinic branches for urgent consultations.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenBookingModal}
            className="px-6 py-3 rounded-xl bg-white text-teal-900 font-extrabold text-xs sm:text-sm shadow-md hover:bg-teal-50 transition-all cursor-pointer"
          >
            Book Appointment
          </button>
          <button
            type="button"
            onClick={() => onNavigate('public-contact')}
            className="px-5 py-3 rounded-xl bg-teal-800 text-white border border-teal-600 font-bold text-xs sm:text-sm hover:bg-teal-900 transition-all cursor-pointer"
          >
            Find Branches
          </button>
        </div>
      </div>
    </div>
  );
};
