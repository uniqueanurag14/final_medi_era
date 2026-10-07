import React, { useState, useEffect } from 'react';
import { designationsApi, DesignationRecord } from '../../api/designations.api';
import { departmentsApi, DepartmentRecord } from '../../api/departments.api';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/common/Guards';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Eye,
  Trash2,
  RefreshCw,
  X,
  Building2,
  Users,
  Briefcase
} from 'lucide-react';

interface AdminDesignationsPageProps {
  onNavigate?: (view: string) => void;
}

export const AdminDesignationsPage: React.FC<AdminDesignationsPageProps> = ({ onNavigate }) => {
  const { currentRole } = useAuth();
  const [designations, setDesignations] = useState<DesignationRecord[]>([]);
  const [departments, setDepartments] = useState<DepartmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<DesignationRecord | null>(null);
  const [viewingDesignation, setViewingDesignation] = useState<DesignationRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<DesignationRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<DesignationRecord>>({
    name: '',
    code: '',
    department: 'General Practice',
    description: '',
    active: true,
  });

  const loadAll = async () => {
    try {
      setRefreshing(true);
      const [desRes, deptRes] = await Promise.all([
        designationsApi.getDesignations(),
        departmentsApi.getDepartments(),
      ]);

      if (desRes.success && desRes.data) {
        setDesignations(desRes.data);
      } else {
        const errMsg = typeof desRes.error === 'string' ? desRes.error : desRes.error?.message || 'Failed to load designations.';
        setAlertNotice({ type: 'error', message: errMsg });
      }

      if (deptRes.success && deptRes.data) {
        setDepartments(deptRes.data);
      }
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Error connecting to designations API.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: any) => {
    const text = typeof message === 'string' ? message : message?.message || 'Operation error occurred.';
    setAlertNotice({ type, message: text });
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingDesignation(null);
    setFormData({
      name: '',
      code: `DES-${Math.floor(100 + Math.random() * 900)}`,
      department: departments[0]?.name || 'General Practice',
      description: '',
      active: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (des: DesignationRecord) => {
    setEditingDesignation(des);
    setFormData({
      name: des.name,
      code: des.code,
      department: des.department || departments[0]?.name || 'General Practice',
      description: des.description || '',
      active: des.active,
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showFeedback('error', 'Designation title is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingDesignation) {
        const res = await designationsApi.updateDesignation(editingDesignation.id, formData);
        if (res.success) {
          showFeedback('success', `Designation "${formData.name}" successfully updated.`);
          setIsCreateModalOpen(false);
          await loadAll();
        } else {
          showFeedback('error', res.error || 'Failed to update designation.');
        }
      } else {
        const res = await designationsApi.createDesignation(formData);
        if (res.success) {
          showFeedback('success', `Designation "${formData.name}" successfully added.`);
          setIsCreateModalOpen(false);
          await loadAll();
        } else {
          showFeedback('error', res.error || 'Failed to create designation.');
        }
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Error processing designation update.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      setSubmitting(true);
      const res = await designationsApi.deleteDesignation(deleteConfirmItem.id);
      if (res.success) {
        showFeedback('success', `Designation "${deleteConfirmItem.name}" deleted successfully.`);
        setDeleteConfirmItem(null);
        await loadAll();
      } else {
        showFeedback('error', res.error || 'Cannot delete designation: associated staff records exist.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Error deleting designation.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDesignations = designations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept =
      departmentFilter === 'All' ? true : item.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'CLINIC_ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                User Management &bull; Designations
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Designations &amp; Job Titles
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Maintain professional clinical titles, organizational grades, and staff designations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAll}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh Designations"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Designation</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {alertNotice && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              alertNotice.type === 'success'
                ? 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {alertNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{alertNotice.message}</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search designations by title or code..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-teal-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-semibold hidden md:inline">Department:</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading designations from database...</span>
            </div>
          ) : filteredDesignations.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Award className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No designations found</p>
              <p className="text-[11px] text-slate-400">Click "+ Add Designation" above to register job titles.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4">Designation Title</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDesignations.map((des) => (
                    <tr key={des.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold shrink-0">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {des.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {des.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {des.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {des.department || 'General Practice'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {des.description || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            des.active
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${des.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {des.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Eye / View icon */}
                          <button
                            type="button"
                            onClick={() => setViewingDesignation(des)}
                            className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-500 hover:text-teal-600 cursor-pointer transition-colors"
                            title="View Designation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit icon */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(des)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                            title="Edit Designation"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete icon */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(des)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                            title="Delete Designation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CREATE / EDIT MODAL */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {editingDesignation ? 'Edit Designation' : 'Create New Designation'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Define clinical or corporate role title
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Senior Consultant Cardiologist, Registered Nurse"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Designation Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. DES-101"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono focus:outline-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Parent Department
                    </label>
                    <select
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-teal-600"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Responsibilities &amp; Scope
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of duties and credentialing requirements..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-teal-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="des-active-toggle"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                  />
                  <label htmlFor="des-active-toggle" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Active designation
                  </label>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Saving...' : editingDesignation ? 'Save Changes' : 'Create Designation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {viewingDesignation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {viewingDesignation.name}
                    </h3>
                    <span className="font-mono text-xs text-teal-600 dark:text-teal-400 font-bold">
                      {viewingDesignation.code}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingDesignation(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Department</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {viewingDesignation.department || 'Clinical Practice'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Status</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {viewingDesignation.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Description &amp; Job Scope:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {viewingDesignation.description || 'No detailed job description on record.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingDesignation;
                    setViewingDesignation(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Designation</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingDesignation(null)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Confirm Designation Deletion
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Relational check will verify no active staff currently hold this designation
                  </p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete designation <strong className="text-slate-900 dark:text-white font-bold">"{deleteConfirmItem.name}"</strong>?
              </p>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Deleting...' : 'Delete Designation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};
