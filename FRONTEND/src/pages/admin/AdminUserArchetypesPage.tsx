import React, { useState, useEffect } from 'react';
import { userArchetypesApi, UserArchetypeRecord } from '../../api/user-archetypes.api';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/common/Guards';
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Eye,
  Trash2,
  RefreshCw,
  X,
  Users,
  Layers,
  Lock,
  Tag
} from 'lucide-react';

interface AdminUserArchetypesPageProps {
  onNavigate?: (view: string) => void;
}

export const AdminUserArchetypesPage: React.FC<AdminUserArchetypesPageProps> = ({ onNavigate }) => {
  const { currentRole } = useAuth();
  const [archetypes, setArchetypes] = useState<UserArchetypeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingArchetype, setEditingArchetype] = useState<UserArchetypeRecord | null>(null);
  const [viewingArchetype, setViewingArchetype] = useState<UserArchetypeRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<UserArchetypeRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<UserArchetypeRecord>>({
    name: '',
    code: '',
    category: 'Clinical',
    description: '',
    active: true,
  });

  const loadArchetypes = async () => {
    try {
      setRefreshing(true);
      const res = await userArchetypesApi.getArchetypes();
      if (res.success && res.data) {
        setArchetypes(res.data);
      } else {
        const errMsg = typeof res.error === 'string' ? res.error : res.error?.message || 'Failed to load user archetypes.';
        setAlertNotice({ type: 'error', message: errMsg });
      }
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Error connecting to user archetypes API.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadArchetypes();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: any) => {
    const text = typeof message === 'string' ? message : message?.message || 'Operation error occurred.';
    setAlertNotice({ type, message: text });
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingArchetype(null);
    setFormData({
      name: '',
      code: `ARCH-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Clinical',
      description: '',
      active: true,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (arch: UserArchetypeRecord) => {
    setEditingArchetype(arch);
    setFormData({
      name: arch.name,
      code: arch.code,
      category: arch.category,
      description: arch.description || '',
      active: arch.active,
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showFeedback('error', 'Archetype name is mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingArchetype) {
        const res = await userArchetypesApi.updateArchetype(editingArchetype.id, formData);
        if (res.success) {
          showFeedback('success', `User Archetype "${formData.name}" successfully updated.`);
          setIsCreateModalOpen(false);
          await loadArchetypes();
        } else {
          showFeedback('error', res.error || 'Failed to update archetype.');
        }
      } else {
        const res = await userArchetypesApi.createArchetype(formData);
        if (res.success) {
          showFeedback('success', `User Archetype "${formData.name}" added successfully.`);
          setIsCreateModalOpen(false);
          await loadArchetypes();
        } else {
          showFeedback('error', res.error || 'Failed to create user archetype.');
        }
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Error occurred while saving user archetype.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      setSubmitting(true);
      const res = await userArchetypesApi.deleteArchetype(deleteConfirmItem.id);
      if (res.success) {
        showFeedback('success', `Archetype "${deleteConfirmItem.name}" deleted successfully.`);
        setDeleteConfirmItem(null);
        await loadArchetypes();
      } else {
        showFeedback('error', res.error || 'Cannot delete archetype: system archetype or active staff assigned.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Error deleting archetype.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredArchetypes = archetypes.filter((arch) => {
    const matchesSearch =
      arch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      arch.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (arch.description && arch.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'All' ? true : arch.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'CLINIC_ADMIN']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                User Management &bull; User Archetypes
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              User Archetypes &amp; Types
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure personnel categories, user types, and workflow access archetypes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadArchetypes}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh User Archetypes"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add User Archetype</span>
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
              placeholder="Search user archetypes by name or code..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-teal-600"
            />
          </div>

          <div className="flex items-center gap-2">
            {(['All', 'Clinical', 'Administrative', 'Technical', 'Support'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Archetypes Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading user archetypes from database...</span>
            </div>
          ) : filteredArchetypes.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No user archetypes found</p>
              <p className="text-[11px] text-slate-400">Define user archetypes to categorize organizational personnel.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-3 px-4">Archetype Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredArchetypes.map((arch) => (
                    <tr key={arch.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {arch.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {arch.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {arch.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full font-semibold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {arch.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {arch.description || '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {arch.isSystem ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            <Lock className="w-3 h-3" />
                            System
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">Custom</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            arch.active
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${arch.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {arch.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Eye / View icon */}
                          <button
                            type="button"
                            onClick={() => setViewingArchetype(arch)}
                            className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-500 hover:text-teal-600 cursor-pointer transition-colors"
                            title="View Archetype"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit icon */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(arch)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
                            title="Edit Archetype"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete icon */}
                          {!arch.isSystem && (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem(arch)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                              title="Delete Archetype"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {editingArchetype ? 'Edit User Archetype' : 'Create User Archetype'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Configure user archetype classification
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
                    Archetype Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Doctor, Nurse, Receptionist, Administrator"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Archetype Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. ARCH-DOC"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono focus:outline-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Archetype Category
                    </label>
                    <select
                      value={formData.category || 'Clinical'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-teal-600"
                    >
                      <option value="Clinical">Clinical</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Technical">Technical</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description &amp; Workflow Capabilities
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Operational workflow and authorization profile..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-teal-600"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="arch-active-toggle"
                    checked={formData.active !== false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                  />
                  <label htmlFor="arch-active-toggle" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Active user archetype
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
                    {submitting ? 'Saving...' : editingArchetype ? 'Save Changes' : 'Create Archetype'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {viewingArchetype && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                      {viewingArchetype.name}
                    </h3>
                    <span className="font-mono text-xs text-teal-600 dark:text-teal-400 font-bold">
                      {viewingArchetype.code}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingArchetype(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Category</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {viewingArchetype.category}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-bold text-[10px] uppercase">Archetype Level</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {viewingArchetype.isSystem ? 'Built-in System Archetype' : 'Custom Organization Type'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Description &amp; Workflow Profile:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {viewingArchetype.description || 'No detailed workflow profile on record.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingArchetype;
                    setViewingArchetype(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Archetype</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingArchetype(null)}
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
                    Confirm Archetype Deletion
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Relational verification will ensure no users currently depend on this archetype
                  </p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Are you sure you want to delete user archetype <strong className="text-slate-900 dark:text-white font-bold">"{deleteConfirmItem.name}"</strong>?
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
                  {submitting ? 'Deleting...' : 'Delete Archetype'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};
