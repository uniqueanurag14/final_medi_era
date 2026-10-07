import React from 'react';
import { dbService } from '../../services/mockDatabase';
import {
  HeartPulse,
  Sparkles,
  Activity,
  Baby,
  Stethoscope,
  Brain,
  Ear,
  Users,
  ChevronRight,
  Calendar,
  Layers
} from 'lucide-react';

interface PublicSpecialtiesPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
}

export const PublicSpecialtiesPage: React.FC<PublicSpecialtiesPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const specialties = dbService.specialties;
  const doctors = dbService.doctors;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Clinical Departments
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-3">
          Specialities & Centers of Care
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Discover our specialized departments offering comprehensive diagnostic, medical, and preventative interventions.
        </p>
      </div>

      {/* Grid or Empty State */}
      {specialties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 max-w-xl mx-auto">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Specialties Registered</h3>
          <p className="text-xs text-slate-500 mt-1">
            Clinical specialties and departments are managed directly by Super Admin and will appear here once added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {specialties.map((spec) => {
            const Icon = iconMap[spec.iconName] || Stethoscope;
            const assignedDocs = doctors.filter((d) => d.specialtyId === spec.id);

            return (
              <div
                key={spec.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{spec.code}</span>
                    <h3 className="text-xl font-extrabold text-slate-950 leading-tight">{spec.name}</h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {spec.description}
                </p>

                {/* Assigned Doctors */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Specialist Physicians in Department:
                  </h4>
                  <div className="space-y-2">
                    {assignedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={doc.photo}
                            alt={doc.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                            <p className="text-[11px] text-slate-500">{doc.title} • {doc.experienceYears} yrs exp</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onOpenBookingModal(doc.id, spec.id)}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                        >
                          Book Slot
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">{assignedDocs.length} Active Consultant{assignedDocs.length !== 1 ? 's' : ''}</span>
                <button
                  onClick={() => onOpenBookingModal(undefined, spec.id)}
                  className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
                >
                  Schedule Appointment in {spec.name.split('&')[0]} →
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
