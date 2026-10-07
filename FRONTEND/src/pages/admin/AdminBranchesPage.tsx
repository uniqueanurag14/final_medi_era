import React, { useState, useEffect } from 'react';
import { branchesApi, BranchRecord } from '../../api/branches.api';
import { organizationsApi, OrganizationRecord } from '../../api/organizations.api';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/common/Guards';
import {
  GitBranch,
  Plus,
  Search,
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Star,
  Users,
  Settings,
  SlidersHorizontal,
  Calendar,
  Layers,
  Receipt,
  Boxes,
  Bell
} from 'lucide-react';

interface AdminBranchesPageProps {
  onNavigate?: (view: string) => void;
}

export const AdminBranchesPage: React.FC<AdminBranchesPageProps> = ({ onNavigate }) => {
  const { currentRole } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);
  const [viewingBranch, setViewingBranch] = useState<BranchRecord | null>(null);
  const [branchForSettings, setBranchForSettings] = useState<BranchRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State: Branch Core Info
  const [formData, setFormData] = useState<Partial<BranchRecord>>({
    name: '',
    code: '',
    organizationId: '',
    address: '',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    pincode: '201301',
    phone: '',
    email: '',
    timezone: 'Asia/Kolkata',
    isMainBranch: false,
    status: 'Active',
  });

  // Form State: Branch Settings
  const [branchSettings, setBranchSettings] = useState({
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    openingTime: '08:00',
    closingTime: '20:00',
    appointmentSlotDuration: 15,
    maxDailyTokens: 150,
    allowWalkIns: true,
    autoQueueTokens: true,
    autoBillingAlerts: true,
    lowStockThresholdAlerts: true,
    enableMedicalStorePOS: true,
    notificationChannel: 'EMAIL_AND_WHATSAPP',
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [orgsRes, branchRes] = await Promise.all([
        organizationsApi.getOrganizations(),
        branchesApi.getBranches({
          organizationId: selectedOrgId === 'all' ? undefined : selectedOrgId,
          search: searchQuery,
          status: statusFilter,
        }),
      ]);

      if (orgsRes.success && orgsRes.data) {
        setOrganizations(orgsRes.data);
      }
      if (branchRes.success && branchRes.data) {
        setBranches(branchRes.data);
      } else {
        const errMsg = typeof branchRes.error === 'string' ? branchRes.error : branchRes.error?.message || 'Failed to load branches from database.';
        setAlertNotice({ type: 'error', message: errMsg });
      }
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Error connecting to branches API.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedOrgId, statusFilter]);

  const showFeedback = (type: 'success' | 'error', message: any) => {
    const text = typeof message === 'string' ? message : message?.message || 'Operation error occurred.';
    setAlertNotice({ type, message: text });
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingBranch(null);
    const defaultOrg = selectedOrgId !== 'all' ? selectedOrgId : organizations[0]?.id || 'org-mediera-01';
    setFormData({
      name: '',
      code: `BR-${Math.floor(100 + Math.random() * 900)}`,
      organizationId: defaultOrg,
      address: '',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      pincode: '201301',
      phone: '+91 (120) 456-7890',
      email: '',
      timezone: 'Asia/Kolkata',
      isMainBranch: branches.length === 0,
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: BranchRecord) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      organizationId: branch.organizationId,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || 'India',
      pincode: branch.pincode || '',
      phone: branch.phone || '',
      email: branch.email || '',
      timezone: branch.timezone || 'Asia/Kolkata',
      isMainBranch: branch.isMainBranch,
      status: branch.status,
    });
    setIsModalOpen(true);
  };

  const handleOpenSettings = (branch: BranchRecord) => {
    setBranchForSettings(branch);
    const s = branch.settings || {};
    setBranchSettings({
      workingDays: s.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      openingTime: s.openingTime || '08:00',
      closingTime: s.closingTime || '20:00',
      appointmentSlotDuration: s.appointmentSlotDuration || 15,
      maxDailyTokens: s.maxDailyTokens || 150,
      allowWalkIns: s.allowWalkIns ?? true,
      autoQueueTokens: s.autoQueueTokens ?? true,
      autoBillingAlerts: s.autoBillingAlerts ?? true,
      lowStockThresholdAlerts: s.lowStockThresholdAlerts ?? true,
      enableMedicalStorePOS: s.enableMedicalStorePOS ?? true,
      notificationChannel: s.notificationChannel || 'EMAIL_AND_WHATSAPP',
    });
    setIsSettingsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showFeedback('error', 'Branch name is required.');
      return;
    }
    if (!formData.organizationId) {
      showFeedback('error', 'Please select an Organization for this branch.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingBranch) {
        const res = await branchesApi.updateBranch(editingBranch.id, formData);
        if (res.success) {
          showFeedback('success', `Branch "${res.data.name}" updated successfully.`);
          setIsModalOpen(false);
          loadData();
        } else {
          showFeedback('error', res.error || 'Failed to update branch.');
        }
      } else {
        const res = await branchesApi.createBranch(formData);
        if (res.success) {
          showFeedback('success', `Branch "${res.data.name}" created successfully.`);
          setIsModalOpen(false);
          loadData();
        } else {
          showFeedback('error', res.error || 'Failed to create branch.');
        }
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForSettings) return;

    try {
      setSubmitting(true);
      const res = await branchesApi.updateSettings(branchForSettings.id, branchSettings);
      if (res.success) {
        showFeedback('success', `Configuration settings updated for branch "${branchForSettings.name}".`);
        setIsSettingsModalOpen(false);
        loadData();
      } else {
        showFeedback('error', res.error || 'Failed to update branch settings.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save settings.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (branch: BranchRecord) => {
    const nextStatus = branch.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await branchesApi.setStatus(branch.id, nextStatus);
      if (res.success) {
        showFeedback('success', `Branch "${branch.name}" status updated to ${nextStatus}.`);
        loadData();
      } else {
        showFeedback('error', res.error || 'Failed to update branch status.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Status update error.');
    }
  };

  const handleDelete = async (branch: BranchRecord) => {
    if (branch.isMainBranch) {
      showFeedback('error', 'The primary headquarters branch cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove branch "${branch.name}"?`)) {
      return;
    }

    try {
      const res = await branchesApi.deleteBranch(branch.id);
      if (res.success) {
        showFeedback('success', `Branch "${branch.name}" deleted.`);
        loadData();
      } else {
        showFeedback('error', res.error || 'Delete failed.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete branch.');
    }
  };

  const filteredBranches = branches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      (b.city && b.city.toLowerCase().includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q))
    );
  });

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CLINIC_ADMIN', 'MANAGER']}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Super Admin</span>
              <span>/</span>
              <span>Organization</span>
              <span>/</span>
              <span className="text-teal-600 dark:text-teal-400 font-medium">Branch Management</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-teal-600" />
              Clinic Branches & Regional Sites
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure clinic locations, operating schedules, token queues, billing overrides, and branch settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={refreshing}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh from Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Branch</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {alertNotice && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              alertNotice.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{alertNotice.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlertNotice(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Branches</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{branches.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Sites</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {branches.filter((b) => b.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Primary HQ Sites</p>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {branches.filter((b) => b.isMainBranch).length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Assigned Staff</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {branches.reduce((acc, b) => acc + (b.usersCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filters & Organization Selector */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search branches, code, city..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Organization Dropdown */}
            <div className="w-full sm:w-60 flex items-center gap-1.5 text-xs">
              <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
              >
                <option value="all">All Organizations ({organizations.length})</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
            <span className="text-slate-500 text-[11px]">Status:</span>
            {(['All', 'Active', 'Inactive'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Branches Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading branches directly from database...</span>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <GitBranch className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No clinic branches found</p>
              <p className="text-[11px] text-slate-400">Click "+ Add Branch" above to create an operational clinic branch.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-2.5 px-3">Branch Details</th>
                    <th className="py-2.5 px-3">Belongs to Organization</th>
                    <th className="py-2.5 px-3">Location & Phone</th>
                    <th className="py-2.5 px-3">Operating Hours</th>
                    <th className="py-2.5 px-3">Assigned Personnel</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBranches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            branch.isMainBranch
                              ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                              : 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400'
                          }`}>
                            {branch.isMainBranch ? <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> : <GitBranch className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-white">{branch.name}</span>
                              {branch.isMainBranch && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                  HQ
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">Code: {branch.code}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Building className="w-3 h-3 text-teal-600" />
                          {branch.organizationName || 'MediEra Healthcare'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">Org ID: {branch.organizationId}</p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{branch.city || '—'}, {branch.state || branch.country}</span>
                        </div>
                        {branch.phone && (
                          <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {branch.settings?.openingTime || '08:00'} - {branch.settings?.closingTime || '20:00'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {Array.isArray(branch.settings?.workingDays) ? `${branch.settings.workingDays.length} Days/wk` : 'Mon - Sat'}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate('admin-employees')}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 text-[11px] font-medium cursor-pointer"
                        >
                          <Users className="w-3 h-3 text-teal-600" />
                          <span>{branch.usersCount || 0} Staff</span>
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(branch)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                            branch.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${branch.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {branch.status}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenSettings(branch)}
                            className="p-1.5 rounded-md hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-500 hover:text-teal-600 cursor-pointer"
                            title="Branch Settings & Working Hours"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(branch)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            title="Edit Branch"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {!branch.isMainBranch && (
                            <button
                              type="button"
                              onClick={() => handleDelete(branch)}
                              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Delete Branch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

        {/* Modal: Create or Edit Branch */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingBranch ? `Edit Branch: ${editingBranch.name}` : 'Register New Clinic Branch'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Parent Organization *
                    </label>
                    <select
                      required
                      value={formData.organizationId || ''}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">Select an organization...</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.city || org.country})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Branch Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Noida Sector 62 Branch"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Branch Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. BR-NOIDA"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Branch Direct Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. noida@mediera.health"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Branch Contact Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 (120) 456-7890"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Plot B-4, Sector 62 Institutional Area"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Noida"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Uttar Pradesh"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={formData.pincode || ''}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 201301"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone || 'Asia/Kolkata'}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isMainBranchCheck"
                    checked={Boolean(formData.isMainBranch)}
                    onChange={(e) => setFormData({ ...formData, isMainBranch: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <label htmlFor="isMainBranchCheck" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Mark as Primary Headquarters Branch (Main Site)
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingBranch ? 'Save Changes' : 'Create Branch'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Branch Settings (Section 5 from prompt) */}
        {isSettingsModalOpen && branchForSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Branch Configuration: {branchForSettings.name}
                    </h2>
                    <p className="text-[10px] text-slate-400">Section 5 — Branch-specific operational overrides</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="p-5 space-y-4 text-xs">
                {/* 1. Working Hours & Operating Days */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    Operating Schedule & Working Hours
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Opening Time</label>
                      <input
                        type="time"
                        value={branchSettings.openingTime}
                        onChange={(e) => setBranchSettings({ ...branchSettings, openingTime: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Closing Time</label>
                      <input
                        type="time"
                        value={branchSettings.closingTime}
                        onChange={(e) => setBranchSettings({ ...branchSettings, closingTime: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Appointments & Token Queue Settings */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Appointment & Live Token Queue Settings
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Consultation Slot Duration (mins)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={branchSettings.appointmentSlotDuration}
                        onChange={(e) => setBranchSettings({ ...branchSettings, appointmentSlotDuration: parseInt(e.target.value, 10) || 15 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Max Daily Tokens / Capacity</label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={branchSettings.maxDailyTokens}
                        onChange={(e) => setBranchSettings({ ...branchSettings, maxDailyTokens: parseInt(e.target.value, 10) || 100 })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={branchSettings.allowWalkIns}
                        onChange={(e) => setBranchSettings({ ...branchSettings, allowWalkIns: e.target.checked })}
                        className="w-3.5 h-3.5 text-teal-600 rounded"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">Allow Walk-in Tokens</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={branchSettings.autoQueueTokens}
                        onChange={(e) => setBranchSettings({ ...branchSettings, autoQueueTokens: e.target.checked })}
                        className="w-3.5 h-3.5 text-teal-600 rounded"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">Auto Increment Daily Tokens</span>
                    </label>
                  </div>
                </div>

                {/* 3. Pharmacy, Inventory & Billing Settings */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                    Pharmacy Dispensary, Medical Store & Billing Overrides
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={branchSettings.enableMedicalStorePOS}
                        onChange={(e) => setBranchSettings({ ...branchSettings, enableMedicalStorePOS: e.target.checked })}
                        className="w-3.5 h-3.5 text-teal-600 rounded"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">Enable On-site Medical Store POS</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={branchSettings.lowStockThresholdAlerts}
                        onChange={(e) => setBranchSettings({ ...branchSettings, lowStockThresholdAlerts: e.target.checked })}
                        className="w-3.5 h-3.5 text-teal-600 rounded"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">Alert on Formulary Low Stock</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={branchSettings.autoBillingAlerts}
                        onChange={(e) => setBranchSettings({ ...branchSettings, autoBillingAlerts: e.target.checked })}
                        className="w-3.5 h-3.5 text-teal-600 rounded"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">Auto Generate Invoice upon Dispensing</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Branch Settings</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};
