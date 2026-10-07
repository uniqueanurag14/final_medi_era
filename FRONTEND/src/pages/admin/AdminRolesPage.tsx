import React, { useState, useEffect } from 'react';
import { rolesApi, RoleRecord, PermissionItem } from '../../api/roles.api';
import { organizationsApi, OrganizationRecord } from '../../api/organizations.api';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/common/Guards';
import {
  Shield,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Lock,
  Users,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Building,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface AdminRolesPageProps {
  onNavigate?: (view: string) => void;
}

export const AdminRolesPage: React.FC<AdminRolesPageProps> = ({ onNavigate }) => {
  const { currentRole } = useAuth();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Roles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [viewingRole, setViewingRole] = useState<RoleRecord | null>(null);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    displayName: string;
    description: string;
    organizationId?: string;
    permissions: string[];
  }>({
    name: '',
    displayName: '',
    description: '',
    organizationId: '',
    permissions: [],
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [roleRes, permRes, orgRes] = await Promise.all([
        rolesApi.getRoles({ organizationId: selectedOrgId === 'all' ? undefined : selectedOrgId }),
        rolesApi.getPermissions(),
        organizationsApi.getOrganizations(),
      ]);

      if (roleRes.success && roleRes.data) {
        setRoles(roleRes.data);
      }
      if (permRes.success && permRes.data) {
        setPermissions(permRes.data);
      }
      if (orgRes.success && orgRes.data) {
        setOrganizations(orgRes.data);
      }
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Error connecting to RBAC APIs.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedOrgId]);

  const showFeedback = (type: 'success' | 'error', message: any) => {
    const text = typeof message === 'string' ? message : message?.message || 'Operation error occurred.';
    setAlertNotice({ type, message: text });
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      displayName: '',
      description: '',
      organizationId: selectedOrgId !== 'all' ? selectedOrgId : organizations[0]?.id || '',
      permissions: ['patient.view', 'appointment.view'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: RoleRecord) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName || role.name,
      description: role.description || '',
      organizationId: role.organizationId || '',
      permissions: [...role.permissions],
    });
    setIsModalOpen(true);
  };

  const togglePermission = (code: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(code);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== code)
          : [...prev.permissions, code],
      };
    });
  };

  const toggleAllForModule = (modulePermissions: PermissionItem[]) => {
    const codes = modulePermissions.map((p) => p.code);
    const allSelected = codes.every((c) => formData.permissions.includes(c));

    setFormData((prev) => {
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => !codes.includes(p)),
        };
      } else {
        const merged = new Set([...prev.permissions, ...codes]);
        return {
          ...prev,
          permissions: Array.from(merged),
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName?.trim()) {
      showFeedback('error', 'Role display name is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingRole) {
        const res = await rolesApi.updateRole(editingRole.id, {
          displayName: formData.displayName,
          description: formData.description,
          permissions: formData.permissions,
        });
        if (res.success) {
          showFeedback('success', `Role "${res.data.displayName}" updated successfully.`);
          setIsModalOpen(false);
          loadData();
        } else {
          showFeedback('error', res.error || 'Failed to update role.');
        }
      } else {
        const roleName = formData.displayName.toUpperCase().replace(/\s+/g, '_');
        const res = await rolesApi.createRole({
          name: roleName,
          displayName: formData.displayName,
          description: formData.description,
          organizationId: formData.organizationId || undefined,
          permissions: formData.permissions,
        });
        if (res.success) {
          showFeedback('success', `New role "${res.data.displayName}" created.`);
          setIsModalOpen(false);
          loadData();
        } else {
          showFeedback('error', res.error || 'Failed to create role.');
        }
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (role: RoleRecord) => {
    const nextStatus = role.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await rolesApi.setStatus(role.id, nextStatus);
      if (res.success) {
        showFeedback('success', `Role "${role.displayName}" is now ${nextStatus}.`);
        loadData();
      } else {
        showFeedback('error', res.error || 'Status update failed.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Status update error.');
    }
  };

  const handleDelete = async (role: RoleRecord) => {
    if (role.isSystem) {
      showFeedback('error', 'System-level core roles cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete role "${role.displayName}"?`)) {
      return;
    }

    try {
      const res = await rolesApi.deleteRole(role.id);
      if (res.success) {
        showFeedback('success', `Role "${role.displayName}" deleted.`);
        loadData();
      } else {
        showFeedback('error', res.error || 'Delete failed.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete role.');
    }
  };

  // Group permissions by module
  const modulesMap = new Map<string, PermissionItem[]>();
  for (const p of permissions) {
    const arr = modulesMap.get(p.module) || [];
    arr.push(p);
    modulesMap.set(p.module, arr);
  }
  const modulesList = Array.from(modulesMap.entries());

  const filteredRoles = roles.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.displayName && r.displayName.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'CLINIC_ADMIN']}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Super Admin</span>
              <span>/</span>
              <span>Organization</span>
              <span>/</span>
              <span className="text-teal-600 dark:text-teal-400 font-medium">Role & Permission Management</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Roles & Granular RBAC Permissions
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage system and clinical roles, assign granular permissions, and govern multi-tenant security policies.
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
              <span>+ Create Role</span>
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
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total System Roles</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{roles.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Custom Roles</p>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {roles.filter((r) => !r.isSystem).length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">System Permissions</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{permissions.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Assigned Users</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {roles.reduce((acc, r) => acc + (r.usersCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Search & Organization Filter */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles by title, key, description..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="w-full sm:w-64 flex items-center gap-1.5 text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
            >
              <option value="all">Global & All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {loading ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading roles & permissions from database...</span>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Shield className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No roles matched your search</p>
            </div>
          ) : (
            filteredRoles.map((role) => (
              <div
                key={role.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        role.name.includes('ADMIN')
                          ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                          : role.name.includes('DOCTOR')
                          ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                          : 'bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400'
                      }`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs">{role.displayName}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">{role.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {role.isSystem ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" title="Core System Role">
                          <Lock className="w-2.5 h-2.5" />
                          SYSTEM
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                          CUSTOM
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
                    {role.description || 'No description specified for this organizational role.'}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <KeyRound className="w-3 h-3 text-teal-600" />
                      {role.permissionsCount || role.permissions.length} Permissions
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('admin-employees')}
                      className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <Users className="w-3 h-3" />
                      {role.usersCount || 0} Users
                    </button>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(role)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer ${
                      role.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${role.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {role.status}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(role)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-700 dark:text-slate-300 hover:text-teal-700 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="Edit Permissions"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Configure</span>
                    </button>
                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDelete(role)}
                        className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Create or Configure Role & Permission Matrix */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {editingRole ? `Configure Role: ${editingRole.displayName}` : 'Create Organization Role'}
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      Assign granular permissions from the system catalog to define access boundaries.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs flex-1">
                {/* Role Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role Title / Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="e.g. Clinical Pharmacist"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Organization Scope
                    </label>
                    <select
                      value={formData.organizationId || ''}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">Global (All Organizations)</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role Description & Responsibilities
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Dispensing medications, managing pharmacy pos, and inventory stock movements"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Granular Permission Matrix */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">Granular Permission Matrix</h4>
                      <p className="text-[10px] text-slate-400">
                        {formData.permissions.length} of {permissions.length} total permissions granted
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {modulesList.map(([moduleName, modulePerms]) => {
                      const allSelected = modulePerms.every((p) => formData.permissions.includes(p.code));
                      const someSelected = modulePerms.some((p) => formData.permissions.includes(p.code));

                      return (
                        <div
                          key={moduleName}
                          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                          <div className="bg-slate-50 dark:bg-slate-950/80 px-3.5 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs capitalize">
                              {moduleName} Module
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleAllForModule(modulePerms)}
                              className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 cursor-pointer"
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>

                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {modulePerms.map((perm) => {
                              const checked = formData.permissions.includes(perm.code);
                              return (
                                <label
                                  key={perm.code}
                                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                    checked
                                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                                      : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => togglePermission(perm.code)}
                                    className="mt-0.5 w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                                  />
                                  <div>
                                    <p className="font-semibold text-xs font-mono">{perm.code}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                      {perm.description || perm.action}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
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
                    <span>{editingRole ? 'Update Role & Permissions' : 'Create Role'}</span>
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
