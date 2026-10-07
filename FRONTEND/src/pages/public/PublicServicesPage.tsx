import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { ServiceItem } from '../../types';
import {
  HeartPulse,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  FlaskConical,
  Stethoscope,
  Building2,
  AlertCircle,
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';

interface PublicServicesPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (serviceName?: string) => void;
}

export const PublicServicesPage: React.FC<PublicServicesPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const services = dbService.services;
  const specialties = dbService.specialties;
  const doctors = dbService.doctors;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = services.filter((srv) => {
    if (!srv.active) return false;
    if (selectedCategory !== 'all' && srv.category !== selectedCategory) return false;
    if (selectedDepartment !== 'all' && srv.departmentName !== selectedDepartment) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        srv.name.toLowerCase().includes(q) ||
        (srv.code && srv.code.toLowerCase().includes(q)) ||
        srv.description.toLowerCase().includes(q) ||
        (srv.departmentName && srv.departmentName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Consultation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Diagnostics':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Procedures':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Therapy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Vaccination':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Lab':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Transparent Clinical Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-3">
          Services, Diagnostics & Procedures
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Standardized clinical fees across specialty consultations, diagnostic imaging, lab panels, and minor surgical procedures.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('packages')}
            className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3.5 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Looking for Bundled Packages? View Health Packages</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search service, procedure, or lab test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50 focus:bg-white font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'Consultation', 'Diagnostics', 'Procedures', 'Therapy', 'Vaccination', 'Lab'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Services' : cat}
            </button>
          ))}
        </div>

        {/* Department Filter */}
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-teal-600 cursor-pointer"
        >
          <option value="all">All Specialties</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => {
          const assignedDoctors = (srv.assignedDoctorIds || [])
            .map((id) => doctors.find((d) => d.id === id))
            .filter(Boolean);

          return (
            <div
              key={srv.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    {srv.code || srv.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(srv.category)}`}>
                    {srv.category}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  {srv.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {srv.description}
                </p>

                {/* Department */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">{srv.departmentName || 'General Practice'}</span>
                </div>

                {/* Preparation Instructions */}
                {srv.preparationInstructions && (
                  <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Preparation: </span>
                      {srv.preparationInstructions}
                    </div>
                  </div>
                )}

                {/* Doctors Tag */}
                {assignedDoctors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinicians:</span>
                    {assignedDoctors.map((doc) => (
                      <span key={doc?.id} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {doc?.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {srv.durationMinutes} mins slot
                  </span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available Daily
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Standard Rate</span>
                  <span className="text-xl font-extrabold text-slate-950">${srv.price.toFixed(2)}</span>
                  {srv.taxRate > 0 && (
                    <span className="text-[10px] text-slate-400 block">+ {srv.taxRate}% tax</span>
                  )}
                </div>
                <button
                  onClick={() => onOpenBookingModal(srv.name)}
                  className="bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Service
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
