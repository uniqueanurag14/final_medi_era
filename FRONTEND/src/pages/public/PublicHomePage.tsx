import React from 'react';
import { dbService } from '../../services/mockDatabase';
import { useDemoMode } from '../../hooks/useDemoMode';
import { HeroSection } from '../../components/hero/HeroSection';
import {
  HeartPulse,
  Calendar,
  ShieldCheck,
  Award,
  Clock,
  MapPin,
  Star,
  ArrowRight,
  Stethoscope,
  Sparkles,
  Activity,
  CheckCircle2,
  Users,
  Building2,
  Phone,
  Layers,
  ChevronRight,
  Baby,
  Brain,
  Ear,
  UserRound,
  PackageCheck
} from 'lucide-react';

interface PublicHomePageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const isDemo = useDemoMode();

  const doctors = dbService?.doctors || [];
  const specialties = dbService?.specialties || [];
  const packages = dbService?.packages || [];

  const featuredDoctor = doctors.length > 0 ? doctors[0] : null;

  const iconMap: Record<string, any> = {
    HeartPulse,
    Sparkles,
    Activity,
    Baby,
    Stethoscope,
    Brain,
    Ear,
    Users,
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. CINEMATIC HERO SLIDESHOW SECTION */}
      <HeroSection
        onOpenBookingModal={onOpenBookingModal}
        onNavigate={onNavigate}
      />

      {/* 2. SPECIALTIES DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            Center of Clinical Excellence
          </span>
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-3">
            Comprehensive Medical Specialities
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Integrated departments staffed by senior physicians and equipped with cutting-edge diagnostic infrastructure.
          </p>
        </div>

        {specialties.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No medical specialities registered yet.</p>
            <p className="text-xs text-slate-400 mt-1">Specialties and clinical centers will appear here once configured by the Super Admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.map((spec) => {
              const Icon = (spec?.iconName && iconMap[spec.iconName]) || Stethoscope;
              const docCount = doctors.filter((d) => d && d.specialtyId === spec?.id).length;
              return (
                <div
                  key={spec?.id || Math.random().toString()}
                  onClick={() => onOpenBookingModal(undefined, spec?.id)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs hover:shadow-md hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-400 mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {spec?.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {spec?.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{docCount} Specialist{docCount !== 1 ? 's' : ''}</span>
                    <span className="text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Book Slot <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. FEATURED DOCTORS CAROUSEL / GRID */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-16 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                Board-Certified Consultants
              </span>
              <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-3">
                Meet Our Senior Physicians
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Distinguished medical professionals with decades of clinical experience and international fellowship.
              </p>
            </div>
            <button
              onClick={() => onNavigate('public-doctors')}
              className="text-xs font-extrabold text-teal-700 dark:text-teal-400 hover:text-teal-800 flex items-center gap-1 underline underline-offset-4 cursor-pointer"
            >
              View All Doctors & Detailed Profiles →
            </button>
          </div>

          {doctors.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400">
              <UserRound className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No medical specialists are currently listed.</p>
              <p className="text-xs text-slate-400 mt-1">Specialist schedules will be visible once synchronized from the clinical database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.slice(0, 4).map((doc) => (
                <div
                  key={doc?.id || Math.random().toString()}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img
                        src={doc?.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
                        alt={doc?.name || 'Doctor'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-extrabold text-slate-900 dark:text-white shadow-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {doc?.rating ?? 5}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                        {doc?.specialtyName || 'Specialist'}
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug">
                        {doc?.name || 'Medical Specialist'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {doc?.qualification || 'Board Certified'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {doc?.experienceYears ?? 0} Years Experience • {(doc?.languages || ['English']).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">${doc?.consultationFee ?? 0}.00</span>
                    </div>
                    <button
                      onClick={() => onOpenBookingModal(doc?.id, doc?.specialtyId)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HEALTH PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            Preventative Wellness
          </span>
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-3">
            Comprehensive Health Screening Packages
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Early detection saves lives. Transparent pricing with full blood biochemistry, imaging, and specialist review.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            <PackageCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No health screening packages listed.</p>
            <p className="text-xs text-slate-400 mt-1">Preventative wellness packages will be displayed here once configured in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg?.id || Math.random().toString()}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all bg-white dark:bg-slate-800 relative ${
                  pkg?.badge ? 'border-teal-500 shadow-md ring-1 ring-teal-500/20' : 'border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300'
                }`}
              >
                {pkg?.badge && (
                  <span className="absolute -top-3 left-6 bg-teal-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">{pkg?.name || 'Health Package'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pkg?.tagline || ''}</p>

                  <div className="my-5 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-950 dark:text-white">${pkg?.discountedPrice ?? 0}</span>
                    {pkg?.originalPrice && (
                      <span className="text-xs text-slate-400 line-through font-semibold">${pkg.originalPrice}</span>
                    )}
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4 mb-6">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Included In Package:</p>
                    {(pkg?.servicesIncluded || []).slice(0, 5).map((srv, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span>{srv}</span>
                      </div>
                    ))}
                    {(pkg?.servicesIncluded?.length || 0) > 5 && (
                      <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold pl-5.5">+ {(pkg.servicesIncluded.length) - 5} more diagnostic parameters</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onOpenBookingModal()}
                  className="w-full bg-slate-900 dark:bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Package
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. WHY CHOOSE APEX CLINIC */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
                Institutional Quality
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Why Thousands of Families Trust Apex Healthcare
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We eliminate the stress of clinic visits with digital queue management, electronic prescriptions, instant lab reporting, and zero wait times.
              </p>

              <div className="space-y-4 pt-2 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-500/30 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Live Queue & Digital Check-In</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Real-time token allocation ensures you know exactly when your doctor is ready for you.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-500/30 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Lifetime Patient 360 Records</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Access all past prescriptions, vitals charts, and lab reports anytime from your patient portal.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-600/20 text-teal-400 border border-teal-500/30 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Multi-Branch Seamless Sync</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Visit either of our branches; your medical history travels securely with you across our network.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <Award className="w-8 h-8 text-teal-400 mb-3" />
                <h4 className="font-extrabold text-base text-white">100% Board Certified</h4>
                <p className="text-xs text-slate-400 mt-1">Every doctor is vetted with active state medical licensing and board registrations.</p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <HeartPulse className="w-8 h-8 text-teal-400 mb-3" />
                <h4 className="font-extrabold text-base text-white">In-House Pathology</h4>
                <p className="text-xs text-slate-400 mt-1">Automated CBC, biochemistry, lipid panels, and hormones with 4-hour turnaround.</p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <Phone className="w-8 h-8 text-teal-400 mb-3" />
                <h4 className="font-extrabold text-base text-white">WhatsApp & SMS Updates</h4>
                <p className="text-xs text-slate-400 mt-1">Automated appointment reminders, lab alerts, and doctor follow-up schedules.</p>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <Layers className="w-8 h-8 text-teal-400 mb-3" />
                <h4 className="font-extrabold text-base text-white">Full In-House Pharmacy</h4>
                <p className="text-xs text-slate-400 mt-1">Direct prescription fulfillment with verified batch tracing and expiry controls.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PATIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            Real Experiences
          </span>
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-3">
            What Our Patients Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Rahul Sharma',
              role: 'Cardiology Patient',
              text: 'Dr. Sarah Jenkins took the time to explain my blood pressure trends and adjusted my medication perfectly. Being able to download the prescription on my phone immediately after leaving the clinic is incredible.',
              rating: 5,
            },
            {
              name: 'Priya Singh',
              role: 'Dermatology & Wellness',
              text: 'The check-in process at reception took literally 30 seconds. The queue token system meant no chaotic waiting room, and Dr. Watson resolved my skin allergy within two visits.',
              rating: 5,
            },
            {
              name: 'Amit Patel',
              role: 'Diabetic Health Check',
              text: 'I booked the Executive Health Package online. Fast blood collection, zero wait, and all reports were reviewed by Dr. Rahul Sharma the same afternoon. Very professional setup!',
              rating: 5,
            },
          ].map((t, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-16 border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300 bg-teal-100/60 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the online appointment and queue token work?',
                a: 'When you book an appointment online, you choose your doctor and slot. Upon arriving at the clinic, reception checks you in and hands you a live token number. You can monitor your position in real-time.',
              },
              {
                q: 'How do I access my prescription and lab reports after my visit?',
                a: 'Log into the Patient Portal with your registered email or phone number. All prescriptions (Rx), invoices, and lab diagnostics are immediately accessible and downloadable as PDFs.',
              },
              {
                q: 'What payment methods do you accept at the clinics?',
                a: 'We accept Cash, UPI (instant QR scan), Credit/Debit cards, and direct insurance co-pays with itemized digital tax receipts.',
              },
              {
                q: 'Can I do video consultations from home?',
                a: 'Yes! When booking an appointment, choose "Video Consultation" under visit type to schedule a secure tele-health session with your doctor.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{faq.q}</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to Experience Modern Healthcare?</h3>
            <p className="text-teal-100 text-xs sm:text-sm">
              Book your consultation today or explore our comprehensive health packages.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenBookingModal()}
              className="bg-white text-slate-950 hover:bg-teal-50 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-teal-700" />
              Book Appointment
            </button>
            <button
              onClick={() => onNavigate('public-contact')}
              className="bg-teal-700/60 hover:bg-teal-700 text-white border border-teal-400/40 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all cursor-pointer"
            >
              Contact Branch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
