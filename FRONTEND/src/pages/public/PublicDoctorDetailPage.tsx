import React from 'react';
import { dbService } from '../../services/mockDatabase';
import {
  Stethoscope,
  Star,
  Calendar,
  Award,
  Globe,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';

interface PublicDoctorDetailPageProps {
  doctorId: string;
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
}

export const PublicDoctorDetailPage: React.FC<PublicDoctorDetailPageProps> = ({
  doctorId,
  onNavigate,
  onOpenBookingModal,
}) => {
  const doctor = dbService.doctors.find((d) => d.id === doctorId) || dbService.doctors[0];
  const branch = doctor ? (dbService.branches.find((b) => b.id === doctor.branchId) || dbService.branches[0]) : undefined;

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <button
          onClick={() => onNavigate('public-doctors')}
          className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Specialists Directory
        </button>
        <div className="bg-white rounded-3xl border border-slate-200 p-12 max-w-lg mx-auto shadow-sm">
          <p className="text-base font-bold text-slate-800">Specialist Profile Unavailable</p>
          <p className="text-xs text-slate-500 mt-2">
            The requested medical specialist profile is not available in the current database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => onNavigate('public-doctors')}
        className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Specialists Directory
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Photo & Quick Stats */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl overflow-hidden border-2 border-slate-200">
              <img
                src={doctor.photo || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'}
                alt={doctor.name}
                className="w-full h-80 object-cover"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Registration / License:</span>
                <span className="font-mono font-bold text-slate-800">{doctor.registrationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Consultation Fee:</span>
                <span className="font-extrabold text-teal-800 text-sm">${doctor.consultationFee}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Languages:</span>
                <span className="font-medium text-slate-800">{doctor.languages.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-2">
                <Stethoscope className="w-3.5 h-3.5" />
                {doctor.specialtyName} Specialist
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                {doctor.name}
              </h1>
              <p className="text-sm font-semibold text-teal-700 mt-0.5">{doctor.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{doctor.qualification}</p>

              <div className="flex items-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{doctor.rating}</span>
                  <span className="text-slate-400 font-normal">({doctor.reviewCount} Verified Reviews)</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">{doctor.experienceYears} Years Clinical Experience</span>
              </div>
            </div>

            {/* About & Bio */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                Physician Profile & Clinical Philosophy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {doctor.bio}
              </p>
            </div>

            {/* Practice Location & Schedules */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Weekly Consultation Schedule & Branch Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>{branch.name}</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{branch.address}, {branch.city}, {branch.state}</p>
                  <p className="text-slate-500 text-[11px]">Direct Phone: {branch.phone}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>Regular OPD Hours</span>
                  </div>
                  <p className="text-slate-700 font-medium">Monday - Saturday</p>
                  <p className="text-slate-500 text-[11px]">09:00 AM – 05:00 PM (20 Min Slots)</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenBookingModal(doctor.id, doctor.specialtyId)}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Book Consultation with {doctor.name.split(' ')[1]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
