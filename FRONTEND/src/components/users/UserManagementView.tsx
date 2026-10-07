import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client.ts';
import { User, Role, PaginatedResult } from '../../types/index.ts';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Shield,
  Trash2,
  Edit,
  Eye,
  Lock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
  UserX,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { PasswordInput } from '../ui/PasswordInput.tsx';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [roleIdFilter, setRoleIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals & Drawers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Form states
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formRoleId, setFormRoleId] = useState<number | string | ''>('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string>('ACTIVE');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchRoles = async () => {
    const res = await apiRequest<Role[]>('/api/v1/roles');
    if (res.success && res.data) {
      setRoles(res.data);
    }
  };

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', targetPage.toString());
    params.set('limit', '10');
    if (search) params.set('search', search);
    if (roleIdFilter) params.set('roleId', roleIdFilter);
    if (statusFilter) params.set('status', statusFilter);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);

    const res = await apiRequest<PaginatedResult<User>>(`/api/v1/users?${params.toString()}`);
    setLoading(false);

    if (res.success && res.data) {
      setUsers(res.data.items);
      setPage(res.data.meta.page);
      setTotalPages(res.data.meta.totalPages);
      setTotalUsers(res.data.meta.total);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [search, roleIdFilter, statusFilter, sortBy, sortOrder]);

  const handleOpenCreate = () => {
    setFormEmail('');
    setFormPassword('');
    setFormFirstName('');
    setFormLastName('');
    setFormDisplayName('');
    setFormRoleId(roles[0]?.id || '');
    setFormStatus('ACTIVE');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormFirstName(user.firstName || '');
    setFormLastName(user.lastName || '');
    setFormDisplayName(user.displayName || '');
    setFormRoleId(user.roleId ?? '');
    setFormStatus(user.status || 'ACTIVE');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleId) return;

    setFormSubmitting(true);
    setActionMsg(null);

    const res = await apiRequest('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        email: formEmail,
        password: formPassword,
        firstName: formFirstName,
        lastName: formLastName,
        displayName: formDisplayName || `${formFirstName} ${formLastName}`.trim(),
        roleId: Number(formRoleId),
        status: formStatus,
      }),
    });

    setFormSubmitting(false);
    if (res.success) {
      setActionMsg({ text: 'User created successfully.', type: 'success' });
      setShowCreateModal(false);
      fetchUsers(1);
    } else {
      setActionMsg({ text: res.error?.message || 'Failed to create user.', type: 'error' });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !formRoleId) return;

    setFormSubmitting(true);
    setActionMsg(null);

    const res = await apiRequest(`/api/v1/users/${editingUser.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        firstName: formFirstName,
        lastName: formLastName,
        displayName: formDisplayName,
        roleId: Number(formRoleId),
        status: formStatus,
      }),
    });

    setFormSubmitting(false);
    if (res.success) {
      setActionMsg({ text: 'User updated successfully.', type: 'success' });
      setEditingUser(null);
      fetchUsers(page);
    } else {
      setActionMsg({ text: res.error?.message || 'Failed to update user.', type: 'error' });
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await apiRequest(`/api/v1/users/${user.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.success) {
      setActionMsg({ text: `User status changed to ${nextStatus}.`, type: 'success' });
      fetchUsers(page);
    } else {
      setActionMsg({ text: res.error?.message || 'Failed to change status.', type: 'error' });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to permanently delete user "${user.email}"?`)) return;

    const res = await apiRequest(`/api/v1/users/${user.id}`, { method: 'DELETE' });
    if (res.success) {
      setActionMsg({ text: `User ${user.email} deleted successfully.`, type: 'success' });
      fetchUsers(page);
    } else {
      setActionMsg({ text: res.error?.message || 'Failed to delete user.', type: 'error' });
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">User Management</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage administrative user accounts, roles, access statuses, and permissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers(page)}
            disabled={loading}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create User
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

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
          />
        </div>

        <select
          value={roleIdFilter}
          onChange={(e) => setRoleIdFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-800 focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-800 focus:ring-2 focus:ring-zinc-900"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>

        {(search || roleIdFilter || statusFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setRoleIdFilter('');
              setStatusFilter('');
            }}
            className="text-xs text-zinc-500 hover:text-zinc-900 underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase tracking-wider font-semibold">
            <tr>
              <th
                onClick={() => handleSort('displayName')}
                className="py-3 px-4 cursor-pointer hover:text-zinc-900"
              >
                <div className="flex items-center gap-1">
                  <span>User</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('roleId')}
                className="py-3 px-4 cursor-pointer hover:text-zinc-900"
              >
                <div className="flex items-center gap-1">
                  <span>Role</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-4 cursor-pointer hover:text-zinc-900"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('lastLoginAt')}
                className="py-3 px-4 cursor-pointer hover:text-zinc-900"
              >
                <div className="flex items-center gap-1">
                  <span>Last Login</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('createdAt')}
                className="py-3 px-4 cursor-pointer hover:text-zinc-900"
              >
                <div className="flex items-center gap-1">
                  <span>Created</span>
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-400">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSuperAdmin = u.roleName === 'superadmin';
                return (
                  <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {u.firstName?.[0] || u.email[0]}
                          {u.lastName?.[0] || ''}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-900 block">{u.displayName}</span>
                          <span className="text-zinc-500 text-[11px] block">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
                        <Shield className="w-3 h-3 text-zinc-500" />
                        {u.roleName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : u.status === 'SUSPENDED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                      {formatDateTime(u.lastLoginAt)}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                      {formatDateTime(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingUser(u)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
                          title="View user details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
                          title="Edit user"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {!isSuperAdmin && (
                          <>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
                              title={u.status === 'ACTIVE' ? 'Deactivate user' : 'Activate user'}
                            >
                              {u.status === 'ACTIVE' ? (
                                <UserX className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <span>
            Showing <strong className="text-zinc-800">{users.length}</strong> of{' '}
            <strong className="text-zinc-800">{totalUsers}</strong> users
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchUsers(page - 1)}
              disabled={page <= 1}
              className="p-1.5 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchUsers(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-zinc-200 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-zinc-900 mb-1">Create User Account</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Add a new authenticated user to the system.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                  Initial Password
                </label>
                <PasswordInput
                  id="user-mgmt-initial-password"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                    Assigned Role
                  </label>
                  <select
                    required
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 bg-white"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-zinc-300 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {formSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-zinc-200 relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Edit User: {editingUser.email}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Update user profile and status.</p>

            <form onSubmit={handleUpdateUser} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                    Role
                  </label>
                  <select
                    disabled={editingUser.roleName === 'superadmin'}
                    required
                    value={formRoleId}
                    onChange={(e) => setFormRoleId(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 bg-white disabled:bg-zinc-100"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-700 mb-1">
                    Status
                  </label>
                  <select
                    disabled={editingUser.roleName === 'superadmin'}
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 bg-white disabled:bg-zinc-100"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 border border-zinc-300 text-zinc-700 rounded-lg text-xs font-medium hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Drawer */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white h-full w-full max-w-md p-6 border-l border-zinc-200 shadow-xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <h3 className="text-base font-bold text-zinc-900">User Details</h3>
                <button
                  onClick={() => setViewingUser(null)}
                  className="text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 flex items-center gap-4 border-b border-zinc-100">
                <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-lg uppercase">
                  {viewingUser.firstName?.[0] || viewingUser.email[0]}
                  {viewingUser.lastName?.[0] || ''}
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900">{viewingUser.displayName}</h4>
                  <span className="text-xs text-zinc-500 block">{viewingUser.email}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
                      {viewingUser.roleName}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        viewingUser.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {viewingUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="py-5 space-y-4 text-xs">
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">User ID</span>
                  <span className="font-mono text-zinc-900">#{viewingUser.id}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Email Verified</span>
                  <span className="text-zinc-900">{viewingUser.emailVerified ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Active Sessions</span>
                  <span className="font-mono text-zinc-900">{viewingUser.activeSessionsCount ?? 0} active sessions</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Last Login</span>
                  <span className="text-zinc-900">{formatDateTime(viewingUser.lastLoginAt)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Account Created</span>
                  <span className="text-zinc-900">{formatDateTime(viewingUser.createdAt)}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase text-[10px]">Last Updated</span>
                  <span className="text-zinc-900">{formatDateTime(viewingUser.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <button
                onClick={() => setViewingUser(null)}
                className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-medium"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
