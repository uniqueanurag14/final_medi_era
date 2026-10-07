import React, { useState, useEffect } from 'react';
import { organizationsApi, OrganizationRecord } from '../../api/organizations.api';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/common/Guards';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  RefreshCw,
  X,
  FileText,
  Clock,
  Coins,
  Calendar,
  Layers,
  Users
} from 'lucide-react';

interface AdminOrganizationsPageProps {
  onNavigate?: (view: string) => void;
}

export const AdminOrganizationsPage: React.FC<AdminOrganizationsPageProps> = ({ onNavigate }) => {
  const { currentRole } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationRecord | null>(null);
  const [viewingOrg, setViewingOrg] = useState<OrganizationRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<OrganizationRecord>>({
    name: '',
    legalName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    logoUrl: '',
    website: '',
    taxId: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    dateFormat: 'DD-MM-YYYY',
    status: 'Active',
  });

  const loadOrganizations = async () => {
    try {
      setRefreshing(true);
      const res = await organizationsApi.getOrganizations({
        search: searchQuery,
        status: statusFilter,
      });
      if (res.success && res.data) {
        setOrganizations(res.data);
      } else {
        const errMsg = typeof res.error === 'string' ? res.error : res.error?.message || 'Failed to load organizations from database.';
        setAlertNotice({ type: 'error', message: errMsg });
      }
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Error connecting to organization API.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, [statusFilter]);

  const showFeedback = (type: 'success' | 'error', message: any) => {
    const text = typeof message === 'string' ? message : message?.message || 'Operation error occurred.';
    setAlertNotice({ type, message: text });
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      legalName: '',
      registrationNumber: `REG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: '',
      phone: '+91 9876543210',
      address: '',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      pincode: '110001',
      website: '',
      logoUrl: '',
      taxId: `GSTIN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      dateFormat: 'DD-MM-YYYY',
      status: 'Active',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (org: OrganizationRecord) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      legalName: org.legalName || org.name,
      registrationNumber: org.registrationNumber || '',
      email: org.email,
      phone: org.phone,
      address: org.address || '',
      city: org.city || '',
      state: org.state || '',
      country: org.country || 'India',
      pincode: org.pincode || '',
      logoUrl: org.logoUrl || '',
      website: org.website || '',
      taxId: org.taxId || '',
      timezone: org.timezone || 'Asia/Kolkata',
      currency: org.currency || 'INR',
      dateFormat: org.dateFormat || 'DD-MM-YYYY',
      status: org.status || 'Active',
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) {
      showFeedback('error', 'Organization name and primary contact email are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingOrg) {
        const res = await organizationsApi.updateOrganization(editingOrg.id, formData);
        if (res.success) {
          showFeedback('success', `Organization "${res.data.name}" updated successfully.`);
          setIsCreateModalOpen(false);
          loadOrganizations();
        } else {
          showFeedback('error', res.error || 'Failed to update organization.');
        }
      } else {
        const res = await organizationsApi.createOrganization(formData);
        if (res.success) {
          showFeedback('success', `New organization "${res.data.name}" registered successfully.`);
          setIsCreateModalOpen(false);
          loadOrganizations();
        } else {
          showFeedback('error', res.error || 'Failed to create organization.');
        }
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (org: OrganizationRecord) => {
    const nextStatus = org.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await organizationsApi.setStatus(org.id, nextStatus);
      if (res.success) {
        showFeedback('success', `Organization "${org.name}" status changed to ${nextStatus}.`);
        loadOrganizations();
      } else {
        showFeedback('error', res.error || 'Status update failed.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Status update error.');
    }
  };

  const handleDelete = async (org: OrganizationRecord) => {
    if (!window.confirm(`Are you sure you want to remove "${org.name}"? This action requires Super Admin privileges.`)) {
      return;
    }

    try {
      const res = await organizationsApi.deleteOrganization(org.id);
      if (res.success) {
        showFeedback('success', `Organization "${org.name}" removed.`);
        loadOrganizations();
      } else {
        showFeedback('error', res.error || 'Delete failed.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete organization.');
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const q = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(q) ||
      org.email.toLowerCase().includes(q) ||
      (org.city && org.city.toLowerCase().includes(q)) ||
      (org.registrationNumber && org.registrationNumber.toLowerCase().includes(q))
    );
  });

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CLINIC_ADMIN']}>
      <div className="space-y-5">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Super Admin</span>
              <span>/</span>
              <span className="text-teal-600 dark:text-teal-400 font-medium">Organization Management</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              Healthcare Organizations
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage clinical entities, legal registrations, currencies, and multi-branch hospital networks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadOrganizations}
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
              <span>+ Add Organization</span>
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

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Organizations</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{organizations.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Entities</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {organizations.filter((o) => o.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Branches</p>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {organizations.reduce((acc, o) => acc + (o.branchesCount || 0), 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Users Enrolled</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {organizations.reduce((acc, o) => acc + (o.usersCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, reg #, city..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
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

        {/* Organizations Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading organizations directly from database...</span>
            </div>
          ) : filteredOrgs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No organizations found</p>
              <p className="text-[11px] text-slate-400">Click "+ Add Organization" above to register your first healthcare business.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Legal & Reg Info</th>
                    <th className="py-2.5 px-3">Contact Details</th>
                    <th className="py-2.5 px-3">Location & Timezone</th>
                    <th className="py-2.5 px-3">Hierarchy Rollup</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrgs.map((org) => (
                    <tr key={org.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0 font-bold text-xs">
                            {org.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => setViewingOrg(org)}
                              className="font-semibold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 text-left cursor-pointer"
                            >
                              {org.name}
                            </button>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {org.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-700 dark:text-slate-300">{org.legalName || '—'}</p>
                        <p className="text-[10px] text-slate-400">Reg: {org.registrationNumber || 'Pending'}</p>
                        {org.taxId && <p className="text-[10px] text-slate-400 font-mono">Tax: {org.taxId}</p>}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{org.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{org.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{org.city || '—'}, {org.state || org.country}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          {org.timezone} ({org.currency})
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigate && onNavigate('admin-branches')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 text-[11px] font-medium cursor-pointer"
                            title="View Branches"
                          >
                            <Layers className="w-3 h-3 text-teal-600" />
                            <span>{org.branchesCount || 0} Branches</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate && onNavigate('admin-employees')}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 text-[11px] font-medium cursor-pointer"
                            title="View Users"
                          >
                            <Users className="w-3 h-3 text-blue-600" />
                            <span>{org.usersCount || 0} Users</span>
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(org)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                            org.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {org.status}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingOrg(org)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                            title="View Profile"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(org)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
                            title="Edit Organization"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(org)}
                            className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Modal: Create or Edit Organization */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingOrg ? `Edit Organization: ${editingOrg.name}` : 'Register New Healthcare Organization'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. MediEra Healthcare Group"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Legal Entity Name
                    </label>
                    <input
                      type="text"
                      value={formData.legalName || ''}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      placeholder="e.g. MediEra Integrated Health Systems Ltd."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber || ''}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="e.g. MED-REG-2024-9981"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tax Identification / GSTIN
                    </label>
                    <input
                      type="text"
                      value={formData.taxId || ''}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      placeholder="e.g. 07AAAAA0000A1Z5"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. contact@mediera.health"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Telephone *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 (11) 4000-0199"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Headquarters Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 450 Health Plaza, Connaught Place"
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
                      placeholder="e.g. New Delhi"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. Delhi"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country || 'India'}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pincode / Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.pincode || ''}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="e.g. 110001"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Canonical Timezone
                    </label>
                    <select
                      value={formData.timezone || 'Asia/Kolkata'}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                      <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Operating Currency
                    </label>
                    <select
                      value={formData.currency || 'INR'}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date Presentation Format
                    </label>
                    <select
                      value={formData.dateFormat || 'DD-MM-YYYY'}
                      onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 26-09-2026)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-26)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/26/2026)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Operational Status
                    </label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
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
                    <span>{editingOrg ? 'Save Changes' : 'Create Organization'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Organization Dossier */}
        {viewingOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
                    {viewingOrg.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{viewingOrg.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {viewingOrg.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingOrg(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Legal Name</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{viewingOrg.legalName || viewingOrg.name}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Registration Number</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{viewingOrg.registrationNumber || 'Not Registered'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Tax ID</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{viewingOrg.taxId || '—'}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Status</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                    {viewingOrg.status}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Currency & Timezone</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{viewingOrg.currency} • {viewingOrg.timezone}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400">Date Format</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{viewingOrg.dateFormat}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <p className="text-[10px] text-slate-400">Official Contact & Address</p>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{viewingOrg.address || 'Address on file'}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{viewingOrg.city}, {viewingOrg.state} {viewingOrg.pincode} • {viewingOrg.country}</p>
                <p className="text-slate-500 text-[11px] mt-1">{viewingOrg.email} • {viewingOrg.phone}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setViewingOrg(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const o = viewingOrg;
                    setViewingOrg(null);
                    handleOpenEdit(o);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs cursor-pointer"
                >
                  Edit Organization
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};
