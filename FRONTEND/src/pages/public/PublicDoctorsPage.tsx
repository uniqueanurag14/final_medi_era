import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import {
  Stethoscope,
  Star,
  Calendar,
  Search,
  Filter,
  Award,
  Globe,
  MapPin,
  Clock,
  UserX
} from 'lucide-react';

interface PublicDoctorsPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
}

export const PublicDoctorsPage: React.FC<PublicDoctorsPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const doctors = dbService.doctors;
  const specialties = dbService.specialties;
  const branches = dbService.branches;

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedSpecialty !== 'all' && doc.specialtyId !== selectedSpecialty) return false;
    if (selectedBranch !== 'all' && doc.branchId !== selectedBranch) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.specialtyName.toLowerCase().includes(q) ||
        doc.qualification.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Medical Staff Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-3">
          Our Specialist Physicians & Consultants
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Consult with board-certified doctors across cardiology, internal medicine, dermatology, orthopedics, pediatrics, and more.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-teal-600 bg-slate-50"
          >
            <option value="all">All Specialities ({specialties.length})</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-teal-600 bg-slate-50"
          >
            <option value="all">All Clinic Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Grid or Empty State */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8 max-w-xl mx-auto">
          <UserX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Doctors Available</h3>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no consulting physicians matching your search criteria or registered in the directory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            const branch = branches.find((b) => b.id === doc.branchId) || branches[0];
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
              <div>
                <div className="p-6 flex items-start gap-4">
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-600/20 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      {doc.specialtyName}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 leading-tight pt-1">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">{doc.title}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({doc.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4 space-y-2 text-xs text-slate-600">
                  <p className="line-clamp-2 text-slate-500 text-[11px]">{doc.bio}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <Award className="w-3.5 h-3.5 text-teal-600" /> {doc.experienceYears} Years Exp.
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-teal-600" /> {doc.languages.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{branch.name}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                  <span className="text-base font-extrabold text-slate-900">${doc.consultationFee}.00</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate(`public-doctor-detail-${doc.id}`)}
                    className="px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-white border border-slate-300 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onOpenBookingModal(doc.id, doc.specialtyId)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Slot
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
