import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { Doctor, Specialty, Service } from '../../types';
import {
  Stethoscope,
  Search,
  Plus,
  Star,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  UserCheck,
  Edit2,
  Trash2,
  CalendarDays,
  Shield,
  Briefcase,
  Layers,
  CheckCircle2,
  XCircle,
  Coffee,
  UserPlus
} from 'lucide-react';

interface AdminDoctorsPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
}

export const AdminDoctorsPage: React.FC<AdminDoctorsPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'schedules' | 'specialties' | 'services'>('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  // Modals state
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // New/Edit Doctor Form State
  const [docName, setDocName] = useState('');
  const [docSpecialtyId, setDocSpecialtyId] = useState(dbService.specialties[0]?.id || '');
  const [docQualification, setDocQualification] = useState('');
  const [docExperience, setDocExperience] = useState('5');
  const [docFee, setDocFee] = useState('100');
  const [docRoom, setDocRoom] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docBio, setDocBio] = useState('');

  // Specialty & Service Form States
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecCode, setNewSpecCode] = useState('');
  const [newSpecDesc, setNewSpecDesc] = useState('');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceSpecId, setNewServiceSpecId] = useState(dbService.specialties[0]?.id || '');

  // Active Schedule editing
  const [selectedScheduleDoctorId, setSelectedScheduleDoctorId] = useState(dbService.doctors[0]?.id || '');

  const doctors = dbService.doctors;
  const specialties = dbService.specialties;
  const services = dbService.services;

  const specialtyNames = Array.from(new Set(doctors.map((d) => d.specialtyName)));

  const filteredDoctors = doctors.filter((doc) => {
    if (specialtyFilter !== 'all' && doc.specialtyName !== specialtyFilter) return false;
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

  const handleOpenNewDoctor = () => {
    setEditingDoctor(null);
    setDocName('');
    setDocSpecialtyId(specialties[0]?.id || '');
    setDocQualification('');
    setDocExperience('5');
    setDocFee('100');
    setDocRoom('');
    setDocPhone('');
    setDocEmail('');
    setDocBio('');
    setIsDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doc: Doctor) => {
    setEditingDoctor(doc);
    setDocName(doc.name);
    setDocSpecialtyId(doc.specialtyId);
    setDocQualification(doc.qualification);
    setDocExperience(String(doc.experienceYears));
    setDocFee(String(doc.consultationFee));
    setDocRoom(doc.roomNumber || '101');
    setDocPhone(doc.phone || '+1 (555) 400-0000');
    setDocEmail(doc.email || 'doctor@apexclinic.com');
    setDocBio(doc.bio || '');
    setIsDoctorModalOpen(true);
  };

  const handleSaveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    const spec = specialties.find((s) => s.id === docSpecialtyId);
    if (editingDoctor) {
      dbService.updateDoctor(editingDoctor.id, {
        name: docName,
        specialtyId: docSpecialtyId,
        specialtyName: spec?.name || 'General Medicine',
        qualification: docQualification,
        experienceYears: parseInt(docExperience) || 5,
        consultationFee: parseFloat(docFee) || 100,
        roomNumber: docRoom,
        phone: docPhone,
        email: docEmail,
        bio: docBio,
      });
    } else {
      dbService.createDoctor({
        organizationId: 'org-01',
        branchId: 'branch-01',
        name: docName,
        title: 'Dr.',
        specialtyId: docSpecialtyId,
        specialtyName: spec?.name || 'General Medicine',
        qualification: docQualification,
        experienceYears: parseInt(docExperience) || 5,
        consultationFee: parseFloat(docFee) || 100,
        registrationNumber: 'MED-REG-2026',
        languages: ['English', 'Spanish'],
        active: true,
        rating: 4.9,
        reviewCount: 15,
        photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        roomNumber: docRoom,
        bio: docBio,
        phone: docPhone,
        email: docEmail,
        schedules: [
          { dayOfWeek: 1, dayName: 'Monday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 20, isAvailable: true, breakStart: '13:00', breakEnd: '14:00' },
          { dayOfWeek: 2, dayName: 'Tuesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 20, isAvailable: true, breakStart: '13:00', breakEnd: '14:00' },
          { dayOfWeek: 3, dayName: 'Wednesday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 20, isAvailable: true, breakStart: '13:00', breakEnd: '14:00' },
          { dayOfWeek: 4, dayName: 'Thursday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 20, isAvailable: true, breakStart: '13:00', breakEnd: '14:00' },
          { dayOfWeek: 5, dayName: 'Friday', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 20, isAvailable: true, breakStart: '13:00', breakEnd: '14:00' },
          { dayOfWeek: 6, dayName: 'Saturday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20, isAvailable: false },
          { dayOfWeek: 0, dayName: 'Sunday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20, isAvailable: false },
        ]
      });
    }
    setIsDoctorModalOpen(false);
  };

  const handleCreateSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.createSpecialty({
      name: newSpecName,
      code: newSpecCode || newSpecName.toUpperCase().slice(0, 4),
      description: newSpecDesc,
      iconName: 'Stethoscope',
      color: '#0d9488',
      active: true,
    });
    setNewSpecName('');
    setNewSpecCode('');
    setNewSpecDesc('');
    setIsSpecModalOpen(false);
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.createService({
      organizationId: 'org-01',
      name: newServiceName,
      code: newServiceName.toUpperCase().slice(0, 5),
      description: `${newServiceName} clinical diagnostic/treatment procedure`,
      durationMinutes: parseInt(newServiceDuration) || 20,
      price: parseFloat(newServicePrice) || 50,
      taxRate: 5,
      active: true,
      category: 'Procedures',
    });
    setNewServiceName('');
    setIsServiceModalOpen(false);
  };

  const activeScheduleDoctor = doctors.find((d) => d.id === selectedScheduleDoctorId) || doctors[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Doctor Roster & OPD Scheduling Manager
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {doctors.length} Physicians
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Doctor Profiles, Chamber Room Numbers, Weekly Shift Schedules, Breaks, Specialties & Services Catalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenNewDoctor}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add New Physician
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'doctors'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          Physicians Directory ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'schedules'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Weekly Schedules & Breaks
        </button>
        <button
          onClick={() => setActiveTab('specialties')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'specialties'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Clinical Specialties ({specialties.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === 'services'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          OPD Services & Fee Catalog ({services.length})
        </button>
      </div>

      {/* TAB 1: DOCTORS DIRECTORY */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[260px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search doctor by name, qualification, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700"
              >
                <option value="all">All Specialties</option>
                {specialtyNames.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors Grid */}
          {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs max-w-lg mx-auto my-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {doctors.length === 0
                  ? 'No doctors found. Add a doctor to begin managing your medical team.'
                  : 'No doctors found matching current filter criteria.'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {doctors.length === 0
                  ? 'Create specialist doctor profiles, assign departments, and configure OPD consultation schedules.'
                  : 'Try adjusting your search terms or department filter.'}
              </p>
              {doctors.length === 0 && (
                <button
                  onClick={handleOpenNewDoctor}
                  className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Doctor
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                <div className="space-y-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">{doc.name}</h3>
                        <button
                          onClick={() => handleOpenEditDoctor(doc)}
                          className="text-slate-400 hover:text-teal-600 p-1"
                          title="Edit Doctor Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-teal-700 font-bold text-xs">{doc.specialtyName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{doc.qualification}</p>
                      <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doc.rating}</span>
                        <span className="text-slate-400 font-normal">({doc.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>OPD Chamber / Room:</span>
                      <strong className="text-slate-900">Room {doc.roomNumber || '101'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <strong className="text-slate-900">{doc.experienceYears} Years</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Consultation Fee:</span>
                      <strong className="text-teal-800 font-bold">${doc.consultationFee}.00</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Working Days:</span>
                      <span className="text-slate-700 font-semibold">{doc.availableDays.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedScheduleDoctorId(doc.id);
                      setActiveTab('schedules');
                    }}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3 h-3 text-slate-500" />
                    Shift Timetable
                  </button>
                  <button
                    onClick={() => onOpenBookingModal(doc.id, doc.specialtyId)}
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
      )}

      {/* TAB 2: WEEKLY SCHEDULES & BREAKS BUILDER */}
      {activeTab === 'schedules' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-700">Select Doctor for Shift Configuration:</label>
              <select
                value={selectedScheduleDoctorId}
                onChange={(e) => setSelectedScheduleDoctorId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-bold text-slate-900 focus:outline-teal-600"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialtyName})</option>
                ))}
              </select>
            </div>
            <p className="text-slate-500">
              Chamber: <strong className="text-slate-800">Room {activeScheduleDoctor?.roomNumber || '101'}</strong> • Fee: <strong className="text-teal-800">${activeScheduleDoctor?.consultationFee || 0}</strong>
            </p>
          </div>

          {/* Timetable schedule cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Weekly OPD Consultation Shifts — {activeScheduleDoctor?.name || 'Physician'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure daily working hours, consultation slot duration (mins), and lunch/break buffer windows.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(activeScheduleDoctor?.schedules || []).map((schedule, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 text-xs transition-colors ${
                    schedule.isAvailable
                      ? 'bg-slate-50/80 border-slate-200'
                      : 'bg-slate-100/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="w-32">
                    <span className="font-black text-sm text-slate-900 block">{schedule.dayOfWeek}</span>
                    <span className={`text-[10px] font-bold ${schedule.isAvailable ? 'text-teal-700' : 'text-slate-400'}`}>
                      {schedule.isAvailable ? 'Active OPD Day' : 'Day Off / Closed'}
                    </span>
                  </div>

                  {schedule.isAvailable ? (
                    <div className="flex flex-wrap items-center gap-4 text-slate-700 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <span>Working Hours:</span>
                        <strong className="text-slate-900">{schedule.startTime} — {schedule.endTime}</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-4 h-4 text-amber-600" />
                        <span>Lunch Break:</span>
                        <strong className="text-slate-900">{schedule.breakStart || '13:00'} — {schedule.breakEnd || '14:00'}</strong>
                      </div>

                      <div className="bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 text-teal-900 font-bold">
                        Slot: {schedule.slotDurationMinutes || 20} mins / patient
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic font-medium">Doctor does not take OPD appointments on {schedule.dayOfWeek}.</span>
                  )}

                  <div>
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      schedule.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {schedule.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SPECIALTIES MANAGEMENT */}
      {activeTab === 'specialties' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Clinical Departments & Specialties</h3>
              <p className="text-xs text-slate-500">Manage medical departments and triage categories.</p>
            </div>
            <button
              onClick={() => setIsSpecModalOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Add Specialty
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialties.map((spec) => {
              const docCount = doctors.filter((d) => d.specialtyId === spec.id).length;
              return (
                <div key={spec.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {spec.code}
                    </span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                      {docCount} Doctors
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">{spec.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{spec.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES & FEE CATALOG */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">OPD Services & Fee Catalog</h3>
              <p className="text-xs text-slate-500">Set procedure pricing, diagnostic test durations, and service categories.</p>
            </div>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Add Clinical Service
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Department / Specialty</th>
                  <th className="py-3 px-4">Standard Duration</th>
                  <th className="py-3 px-4">Price (USD)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{svc.name}</span>
                      <span className="text-[11px] text-slate-500">{svc.description}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-teal-800">{svc.category}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{svc.durationMinutes} minutes</td>
                    <td className="py-3 px-4 font-black text-slate-900">${svc.price}.00</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCTOR CREATE / EDIT MODAL */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 text-xs space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-base text-slate-900">
                {editingDoctor ? 'Edit Doctor Profile' : 'Add New Physician'}
              </h3>
              <button onClick={() => setIsDoctorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDoctor} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jennifer Lawrence"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialty *</label>
                  <select
                    value={docSpecialtyId}
                    onChange={(e) => setDocSpecialtyId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBBS, MD (Cardiology), FACC"
                    value={docQualification}
                    onChange={(e) => setDocQualification(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chamber / Room #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 204"
                    value={docRoom}
                    onChange={(e) => setDocRoom(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    value={docExperience}
                    onChange={(e) => setDocExperience(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    required
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={docPhone}
                    onChange={(e) => setDocPhone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={docEmail}
                    onChange={(e) => setDocEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Clinical Bio</label>
                <textarea
                  rows={2}
                  value={docBio}
                  onChange={(e) => setDocBio(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDoctorModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Physician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPECIALTY MODAL */}
      {isSpecModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Add Clinical Specialty</h3>
            <form onSubmit={handleCreateSpecialty} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neurology"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Code</label>
                <input
                  type="text"
                  placeholder="e.g. NEUR"
                  value={newSpecCode}
                  onChange={(e) => setNewSpecCode(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSpecDesc}
                  onChange={(e) => setNewSpecDesc(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSpecModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg"
                >
                  Save Specialty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">Add Clinical Service / Procedure</h3>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Echocardiogram (2D)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Specialty</label>
                <select
                  value={newServiceSpecId}
                  onChange={(e) => setNewServiceSpecId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  {specialties.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
