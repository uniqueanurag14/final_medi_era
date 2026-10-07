import React, { useState } from 'react';
import { dbService } from '../../services/mockDatabase';
import { Patient } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Patient360Drawer } from '../../components/common/Patient360Drawer';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Calendar,
  Phone,
  Mail,
  HeartPulse,
  Eye,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Shield,
  Activity,
  Plus,
  Stethoscope,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  Building2,
  MapPin,
  CheckCircle2,
  X,
  Lock,
  AlertTriangle
} from 'lucide-react';

interface AdminPatientsPageProps {
  onNavigate: (view: string) => void;
  onOpenNewPatientModal: () => void;
  onOpenBookingModal: (doctorId?: string, specialtyId?: string) => void;
}

export const AdminPatientsPage: React.FC<AdminPatientsPageProps> = ({
  onNavigate,
  onOpenNewPatientModal,
  onOpenBookingModal,
}) => {
  const { hasPermission } = useAuth();
  const [dataVersion, setDataVersion] = useState(0);

  const canView = hasPermission('patient.view');
  const canCreate = hasPermission('patient.create');
  const canUpdate = hasPermission('patient.update');
  const canDelete = hasPermission('patient.delete');

  const allPatients = dbService.patients;
  const allBranches = dbService.branches;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 360 Drawer state
  const [drawerPatientId, setDrawerPatientId] = useState<string | null>(null);

  // Edit Patient State
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    address: string;
    city: string;
    branchId: string;
    status: 'Active' | 'Inactive' | 'Archived';
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyRelationship: string;
    notes: string;
  }>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    city: '',
    branchId: 'branch-01',
    status: 'Active',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyRelationship: 'Family',
    notes: '',
  });

  // Delete Safeguard Modal State
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [deleteSafeguardError, setDeleteSafeguardError] = useState<string | null>(null);
  const [forceDelete, setForceDelete] = useState(false);

  // Banner notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setEditForm({
      firstName: p.firstName,
      lastName: p.lastName,
      phone: p.phone,
      email: p.email,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      address: p.address,
      city: p.city || 'Metro City',
      branchId: p.branchId || 'branch-01',
      status: p.status || 'Active',
      emergencyContactName: p.emergencyContactName || '',
      emergencyContactPhone: p.emergencyContactPhone || '',
      emergencyRelationship: p.emergencyRelationship || 'Family',
      notes: p.notes || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      showToast('First and last name are required.', 'error');
      return;
    }

    const updated = dbService.updatePatient(editingPatient.id, {
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      dateOfBirth: editForm.dateOfBirth,
      gender: editForm.gender,
      bloodGroup: editForm.bloodGroup,
      address: editForm.address.trim(),
      city: editForm.city.trim(),
      branchId: editForm.branchId,
      status: editForm.status,
      emergencyContactName: editForm.emergencyContactName.trim(),
      emergencyContactPhone: editForm.emergencyContactPhone.trim(),
      emergencyRelationship: editForm.emergencyRelationship,
      notes: editForm.notes.trim() || undefined,
    });

    if (updated) {
      setDataVersion((v) => v + 1);
      setEditingPatient(null);
      showToast(`Updated record for ${updated.firstName} ${updated.lastName} (${updated.patientId})`, 'success');
    }
  };

  const handleArchive = (p: Patient) => {
    const res = dbService.archivePatient(p.id);
    if (res.success) {
      setDataVersion((v) => v + 1);
      showToast(`Archived patient record for ${p.firstName} ${p.lastName}.`, 'info');
    } else {
      showToast(res.error || 'Failed to archive patient.', 'error');
    }
  };

  const handleReactivate = (p: Patient) => {
    const res = dbService.reactivatePatient(p.id);
    if (res.success) {
      setDataVersion((v) => v + 1);
      showToast(`Reactivated patient record for ${p.firstName} ${p.lastName}.`, 'success');
    } else {
      showToast(res.error || 'Failed to reactivate patient.', 'error');
    }
  };

  const handleOpenDelete = (p: Patient) => {
    setDeletingPatient(p);
    setDeleteSafeguardError(null);
    setForceDelete(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingPatient) return;
    const res = dbService.deletePatient(deletingPatient.id, forceDelete);
    if (res.success) {
      setDataVersion((v) => v + 1);
      showToast(`Patient ${deletingPatient.firstName} ${deletingPatient.lastName} (${deletingPatient.patientId}) purged.`, 'info');
      setDeletingPatient(null);
    } else {
      setDeleteSafeguardError(res.error || 'Failed to delete patient record.');
    }
  };

  const filteredPatients = allPatients.filter((p) => {
    const pStatus = p.status || 'Active';
    if (statusFilter !== 'all' && pStatus !== statusFilter) return false;
    if (branchFilter !== 'all' && p.branchId !== branchFilter) return false;
    if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
    if (bloodFilter !== 'all' && p.bloodGroup !== bloodFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const counts = {
    total: allPatients.length,
    active: allPatients.filter((p) => (p.status || 'Active') === 'Active').length,
    inactive: allPatients.filter((p) => p.status === 'Inactive').length,
    archived: allPatients.filter((p) => p.status === 'Archived').length,
  };

  if (!canView) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Access Restricted: Customer & Patient Management</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your current account role lacks the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-700 font-mono">patient.view</code> permission key.
          Under MediEra medical data governance and patient privacy protocols, access to electronic health records is restricted to authorized clinic staff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="cursor-pointer p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Status Highlights */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Customer & Patient Management
            </h1>
            <span className="bg-teal-100 text-teal-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
              {counts.total} Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Guarded EHR Profile Records • Demographics • Multi-Branch Allocations • Archival & Safe Purge
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <button
              onClick={onOpenNewPatientModal}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Register Customer / Patient
            </button>
          )}
        </div>
      </div>

      {/* Status Counters Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Patients</span>
          <span className="text-xl font-black text-slate-900">{counts.total}</span>
        </button>

        <button
          onClick={() => { setStatusFilter('Active'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Active'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active</span>
          </div>
          <span className="text-xl font-black text-emerald-700">{counts.active}</span>
        </button>

        <button
          onClick={() => { setStatusFilter('Inactive'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Inactive'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Inactive</span>
          </div>
          <span className="text-xl font-black text-amber-700">{counts.inactive}</span>
        </button>

        <button
          onClick={() => { setStatusFilter('Archived'); setCurrentPage(1); }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Archived'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Archived</span>
          </div>
          <span className="text-xl font-black text-purple-700">{counts.archived}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, ID (e.g. PAT-2026-0001), phone, email, city or notes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-teal-600 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700 focus:outline-teal-600"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
              <option value="Archived">Archived Only</option>
            </select>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-700 focus:outline-teal-600"
            >
              <option value="all">All Branches</option>
              {allBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {/* Blood Group Filter */}
            <select
              value={bloodFilter}
              onChange={(e) => {
                setBloodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Blood Groups</option>
              <option value="O+">O+</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
              <option value="A-">A-</option>
              <option value="B-">B-</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Customer / Patient</th>
                <th className="py-3 px-4">Status & Branch</th>
                <th className="py-3 px-4">Contact & Residence</th>
                <th className="py-3 px-4">Emergency Contact</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Visits & Care</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {allPatients.length === 0
                          ? 'No patients found. Add your first patient to get started.'
                          : 'No matching patient records found.'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {allPatients.length === 0
                          ? 'Connected to real database. All patient medical records and demographics are saved directly to your database.'
                          : 'Try adjusting your search terms or filter criteria.'}
                      </p>
                      {allPatients.length === 0 && canCreate && (
                        <button
                          onClick={onOpenNewPatientModal}
                          className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          + Register Customer / Patient
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient) => {
                  const birthYear = parseInt(patient.dateOfBirth.split('-')[0]) || 1990;
                  const age = 2026 - birthYear;
                  const patientBranch = allBranches.find((b) => b.id === patient.branchId);
                  const patientStatus = patient.status || 'Active';

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setDrawerPatientId(patient.id)}
                    >
                      {/* Patient Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-black flex items-center justify-center text-xs shrink-0">
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors block">
                                {patient.firstName} {patient.lastName}
                              </span>
                              {patient.isDemo ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200" title="Demo sample record">
                                  DEMO
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200" title="Live production record">
                                  PROD
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-teal-700 font-semibold">
                              {patient.patientId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status & Branch */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              patientStatus === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : patientStatus === 'Inactive'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                patientStatus === 'Active'
                                  ? 'bg-emerald-500'
                                  : patientStatus === 'Inactive'
                                  ? 'bg-amber-500'
                                  : 'bg-purple-500'
                              }`}
                            ></span>
                            {patientStatus}
                          </span>
                          <span className="text-[11px] text-slate-600 block flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            {patientBranch ? patientBranch.name : 'Main Medical Center'}
                          </span>
                        </div>
                      </td>

                      {/* Contact & Location */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1 text-slate-800 font-semibold">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {patient.phone}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                            {patient.email}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                            {patient.address}, {patient.city || 'Metro City'}
                          </span>
                        </div>
                      </td>

                      {/* Emergency Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 block">
                            {patient.emergencyContactName || 'None Listed'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {patient.emergencyContactPhone || '—'} ({patient.emergencyRelationship || 'Contact'})
                          </span>
                        </div>
                      </td>

                      {/* Demographics & Blood */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">
                            {age} yrs, {patient.gender}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-800 font-bold border border-rose-200 text-[10px]">
                            {patient.bloodGroup}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Registered: {patient.registeredDate}
                        </span>
                      </td>

                      {/* Visit History */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          {patient.totalVisits || 0} Visits
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Last: {patient.lastVisitDate || 'No record'}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDrawerPatientId(patient.id)}
                            className="p-1.5 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Patient 360 Quick View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onNavigate(`admin-patient-detail-${patient.id}`)}
                            className="p-1.5 text-slate-400 hover:text-indigo-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                            title="Full EHR File"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEdit(patient)}
                              className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Edit Patient Information"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {canUpdate && patientStatus === 'Active' && (
                            <button
                              onClick={() => handleArchive(patient)}
                              className="p-1.5 text-slate-400 hover:text-purple-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Archive Patient"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          {canUpdate && (patientStatus === 'Archived' || patientStatus === 'Inactive') && (
                            <button
                              onClick={() => handleReactivate(patient)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Reactivate Patient"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleOpenDelete(patient)}
                              className="p-1.5 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Delete Patient Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenBookingModal()}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg text-[10px] flex items-center gap-1 border border-teal-200 cursor-pointer ml-1"
                          >
                            <Calendar className="w-3 h-3" />
                            Book
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing {filteredPatients.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of{' '}
            {filteredPatients.length} patients
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT PATIENT MODAL */}
      {editingPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Patient Record</h3>
                  <p className="text-xs text-slate-400">
                    {editingPatient.firstName} {editingPatient.lastName} • {editingPatient.patientId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPatient(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Blood Group</label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Clinic Branch</label>
                  <select
                    value={editForm.branchId}
                    onChange={(e) => setEditForm({ ...editForm, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    {allBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactName}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={editForm.emergencyContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Relationship</label>
                  <input
                    type="text"
                    value={editForm.emergencyRelationship}
                    onChange={(e) => setEditForm({ ...editForm, emergencyRelationship: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Administrative / Care Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / RETENTION SAFEGUARD MODAL */}
      {deletingPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-rose-200 overflow-hidden my-6">
            <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-base">Purge Patient Record</h3>
              </div>
              <button
                onClick={() => setDeletingPatient(null)}
                className="text-rose-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-700">
                You are about to permanently purge the patient record for{' '}
                <strong className="text-slate-900">{deletingPatient.firstName} {deletingPatient.lastName}</strong> (
                <span className="font-mono text-teal-700">{deletingPatient.patientId}</span>).
              </p>

              {deleteSafeguardError ? (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Regulatory & Billing Retention Active:</strong>
                      <span className="text-[11px] leading-relaxed">{deleteSafeguardError}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="forceOverride"
                      checked={forceDelete}
                      onChange={(e) => setForceDelete(e.target.checked)}
                      className="rounded border-amber-300 text-rose-600"
                    />
                    <label htmlFor="forceOverride" className="text-[11px] font-bold text-rose-900 cursor-pointer">
                      Administrative Override: Force permanent purge (audited)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Recommended Alternative:</p>
                  <p>
                    Rather than permanent deletion, consider changing the status to <strong>Archived</strong> or <strong>Inactive</strong> to retain historical diagnostic and billing integrity.
                  </p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-slate-200 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleArchive(deletingPatient);
                    setDeletingPatient(null);
                  }}
                  className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 cursor-pointer"
                >
                  Archive Instead
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeletingPatient(null)}
                    className="px-3 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Purge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT 360 DRAWER */}
      <Patient360Drawer
        patientId={drawerPatientId}
        isOpen={Boolean(drawerPatientId)}
        onClose={() => setDrawerPatientId(null)}
        onNavigate={onNavigate}
        onOpenBookingModal={onOpenBookingModal}
      />
    </div>
  );
};
