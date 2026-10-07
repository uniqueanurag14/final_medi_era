import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.ts';
import { Role, Permission } from '../../types/index.ts';
import { Shield, Lock, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const RoleManagementView: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPermIds, setSelectedPermIds] = useState<number[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [rolesRes, permsRes] = await Promise.all([
      apiRequest<Role[]>('/api/v1/roles'),
      apiRequest<Permission[]>('/api/v1/permissions'),
    ]);
    setLoading(false);

    if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data);
    if (permsRes.success && permsRes.data) setPermissions(permsRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setRoleName('');
    setRoleDesc('');
    setSelectedPermIds([]);
    setModalMode('create');
    setSelectedRole(null);
  };

  const openEditModal = async (role: Role) => {
    const res = await apiRequest<Role>(`/api/v1/roles/${role.id}`);
    if (res.success && res.data) {
      setSelectedRole(res.data);
      setRoleName(res.data.name);
      setRoleDesc(res.data.description || '');
      setSelectedPermIds(res.data.permissions ? res.data.permissions.map((p) => p.id) : []);
      setModalMode('edit');
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setActionMsg(null);

    let res;
    if (modalMode === 'create') {
      res = await apiRequest('/api/v1/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: roleName,
          description: roleDesc,
          permissionIds: selectedPermIds,
        }),
      });
    } else if (modalMode === 'edit' && selectedRole) {
      res = await apiRequest(`/api/v1/roles/${selectedRole.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          description: roleDesc,
          permissionIds: selectedPermIds,
        }),
      });
    }

    setFormLoading(false);
    if (res?.success) {
      setActionMsg({
        text: modalMode === 'create' ? 'Role created successfully.' : 'Role updated successfully.',
        type: 'success',
      });
      setModalMode(null);
      fetchData();
    } else {
      setActionMsg({ text: res?.error?.message || 'Operation failed.', type: 'error' });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    const res = await apiRequest(`/api/v1/roles/${role.id}`, { method: 'DELETE' });
    if (res.success) {
      setActionMsg({ text: `Role ${role.name} deleted successfully.`, type: 'success' });
      fetchData();
    } else {
      setActionMsg({ text: res.error?.message || 'Failed to delete role.', type: 'error' });
    }
  };

  const togglePermission = (permId: number) => {
    setSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  // Group permissions by resource
  const groupedPermissions: Record<string, Permission[]> = {};
  permissions.forEach((p) => {
    if (!groupedPermissions[p.resource]) groupedPermissions[p.resource] = [];
    groupedPermissions[p.resource].push(p);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Roles &amp; Permissions</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Role-based access governance with system roles and custom granular permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5">
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'roles' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Roles ({roles.length})
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'permissions' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Permissions Catalog ({permissions.length})
            </button>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Role
          </button>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'roles' ? (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Role Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4">Assigned Users</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading && roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-400">
                    Loading roles...
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-zinc-900">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-zinc-700" />
                        <span>{role.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-600">{role.description || '—'}</td>
                    <td className="py-3 px-4">
                      {role.isSystemRole ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                          <Lock className="w-3 h-3 text-zinc-500" />
                          System
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-zinc-700">
                      {role.permissionsCount === 'ALL' ? (
                        <span className="text-emerald-700 font-semibold">All Permissions (Full)</span>
                      ) : (
                        `${role.permissionsCount} permissions`
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-800">
                      {role.usersCount} users
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
                          title="Edit role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {!role.isSystemRole && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                            title="Delete role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Permissions Catalog Tab */
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div key={resource} className="bg-white rounded-xl border border-zinc-200 shadow-xs p-5">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-100">
                <Key className="w-4 h-4 text-zinc-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800">
                  Resource: {resource}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {perms.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
                    <span className="font-mono font-semibold text-zinc-900 block mb-0.5">{p.name}</span>
                    <span className="text-zinc-500 block leading-relaxed">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Role Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              {modalMode === 'create' ? 'Create Custom Role' : `Edit Role: ${selectedRole?.name}`}
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Configure role metadata and select permissions to assign.
            </p>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Role Name (slug)
                </label>
                <input
                  type="text"
                  required
                  disabled={modalMode === 'edit'}
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="e.g. auditor, manager"
                  className="block w-full px-3 py-2 text-sm font-mono border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 disabled:bg-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Brief description of responsibilities"
                  className="block w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>

              {selectedRole?.name === 'superadmin' ? (
                <div className="p-4 rounded-lg bg-zinc-100 border border-zinc-200 text-xs text-zinc-700">
                  Super Admin role automatically retains all permissions. Permissions cannot be removed.
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700">
                      Assigned Permissions ({selectedPermIds.length} selected)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPermIds(permissions.map((p) => p.id))}
                        className="text-xs text-zinc-600 hover:text-zinc-900 underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPermIds([])}
                        className="text-xs text-zinc-600 hover:text-zinc-900 underline"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="border border-zinc-200 rounded-lg p-3 max-h-64 overflow-y-auto divide-y divide-zinc-100 space-y-2">
                    {Object.entries(groupedPermissions).map(([res, perms]) => (
                      <div key={res} className="pt-2 first:pt-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                          {res}
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map((p) => (
                            <label
                              key={p.id}
                              className="flex items-start gap-2 p-1.5 rounded hover:bg-zinc-50 cursor-pointer text-xs"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermIds.includes(p.id)}
                                onChange={() => togglePermission(p.id)}
                                className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                              />
                              <div>
                                <span className="font-mono font-medium text-zinc-900 block">{p.name}</span>
                                <span className="text-zinc-400 text-[11px] block">{p.description}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
