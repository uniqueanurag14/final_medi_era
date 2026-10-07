import React, { useState, useEffect } from 'react';
import { usersApi, UserRecord } from '../../api/users.api';
import { organizationsApi, OrganizationRecord } from '../../api/organizations.api';
import { branchesApi, BranchRecord } from '../../api/branches.api';
import { rolesApi, RoleRecord } from '../../api/roles.api';
import { useAuth } from '../../context/AuthContext';
import { RoleGuard } from '../../components/common/Guards';
import {
  Users,
  Plus,
  Search,
  Building,
  GitBranch,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  RefreshCw,
  X,
  Mail,
  Phone,
  Briefcase,
  Copy,
  Send,
  Lock,
  KeyRound,
  ExternalLink,
  Layers,
  UserCheck
} from 'lucide-react';

interface AdminEmployeesPageProps {
  onNavigate?: (view: string) => void;
}

export const AdminEmployeesPage: React.FC<AdminEmployeesPageProps> = ({ onNavigate }) => {
  const { currentRole, user: loggedInUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);

  // Filters State
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & Feedback
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const [inviteModalData, setInviteModalData] = useState<{ name: string; email: string; setupUrl: string } | null>(null);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State: User Onboarding
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    organizationId: string;
    branchIds: string[];
    branchRoles: Record<string, string>; // branchId -> roleId
    roleId: string;
    designation: string;
    department: string;
    userType: string;
    status: 'Active' | 'Inactive' | 'Invited';
  }>({
    name: '',
    email: '',
    phone: '',
    organizationId: '',
    branchIds: [],
    branchRoles: {},
    roleId: '',
    designation: 'Clinical Specialist',
    department: 'General Practice',
    userType: 'Doctor',
    status: 'Active',
  });

  const loadAll = async () => {
    try {
      setRefreshing(true);
      const [usersRes, orgsRes, branchRes, rolesRes] = await Promise.all([
        usersApi.getUsers({
          organizationId: selectedOrgId === 'all' ? undefined : selectedOrgId,
          branchId: selectedBranchId === 'all' ? undefined : selectedBranchId,
          role: selectedRoleId === 'all' ? undefined : selectedRoleId,
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          search: searchQuery,
        }),
        organizationsApi.getOrganizations(),
        branchesApi.getBranches({ organizationId: selectedOrgId === 'all' ? undefined : selectedOrgId }),
        rolesApi.getRoles({ organizationId: selectedOrgId === 'all' ? undefined : selectedOrgId }),
      ]);

      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      if (orgsRes.success && orgsRes.data) setOrganizations(orgsRes.data);
      if (branchRes.success && branchRes.data) setBranches(branchRes.data);
      if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data);
    } catch (err: any) {
      setAlertNotice({ type: 'error', message: err.message || 'Failed to load user management data.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [selectedOrgId, selectedBranchId, selectedRoleId, selectedStatus]);

  const showFeedback = (type: 'success' | 'error', message: any) => {
    const text = typeof message === 'string' ? message : message?.message || 'Operation error occurred.';
    setAlertNotice({ type, message: text });
    setTimeout(() => setAlertNotice(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    const defaultOrg = selectedOrgId !== 'all' ? selectedOrgId : organizations[0]?.id || 'org-mediera-01';
    const defaultBranch = branches[0]?.id || 'br-main-01';
    const defaultRole = roles.find((r) => r.name === 'DOCTOR')?.id || roles[0]?.id || 'role-doctor';

    setFormData({
      name: '',
      email: '',
      phone: '+91 9876543210',
      organizationId: defaultOrg,
      branchIds: [defaultBranch],
      branchRoles: { [defaultBranch]: defaultRole },
      roleId: defaultRole,
      designation: 'Attending Physician',
      department: 'Clinical Care',
      userType: 'Doctor',
      status: 'Active',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: UserRecord) => {
    setEditingUser(user);
    const branchIds = user.branches && user.branches.length > 0 ? user.branches.map((b) => b.branchId) : (user.branchId ? [user.branchId] : []);
    const branchRoles: Record<string, string> = {};
    (user.branches || []).forEach((b) => {
      if (b.roleId) branchRoles[b.branchId] = b.roleId;
    });

    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      organizationId: user.organizationId,
      branchIds,
      branchRoles,
      roleId: user.roleId,
      designation: user.designation || 'Medical Associate',
      department: user.department || 'Clinical Care',
      userType: user.userType || 'Staff',
      status: user.status as any,
    });
    setIsCreateModalOpen(true);
  };

  const toggleBranchSelection = (branchId: string) => {
    setFormData((prev) => {
      const exists = prev.branchIds.includes(branchId);
      const nextIds = exists ? prev.branchIds.filter((id) => id !== branchId) : [...prev.branchIds, branchId];
      const nextRoles = { ...prev.branchRoles };
      if (!exists && !nextRoles[branchId]) {
        nextRoles[branchId] = prev.roleId;
      }
      return {
        ...prev,
        branchIds: nextIds.length > 0 ? nextIds : [branchId], // At least one branch required
        branchRoles: nextRoles,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) {
      showFeedback('error', 'Full name and email address are required.');
      return;
    }
    if (!formData.organizationId) {
      showFeedback('error', 'Please select an Organization for this user.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        const res = await usersApi.updateUser(editingUser.id, formData);
        if (res.success) {
          showFeedback('success', `User "${res.data.name}" profile updated.`);
          setIsCreateModalOpen(false);
          loadAll();
        } else {
          showFeedback('error', res.error || 'Failed to update user.');
        }
      } else {
        const res = await usersApi.createUser(formData);
        if (res.success) {
          showFeedback('success', `User "${res.data.name}" successfully onboarded.`);
          setIsCreateModalOpen(false);
          loadAll();

          // Show setup link dialog
          if (res.data.setupToken) {
            const setupUrl = `${window.location.origin}/login?setupToken=${res.data.setupToken}`;
            setInviteModalData({
              name: res.data.name,
              email: res.data.email,
              setupUrl,
            });
          }
        } else {
          showFeedback('error', res.error || 'Failed to onboard user.');
        }
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvite = async (user: UserRecord) => {
    try {
      const res = await usersApi.resendInvite(user.id);
      if (res.success) {
        showFeedback('success', `Invitation resent to ${user.email}.`);
        setInviteModalData({
          name: user.name,
          email: user.email,
          setupUrl: res.data.setupUrl,
        });
      } else {
        showFeedback('error', res.error || 'Failed to resend invite.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to resend invite.');
    }
  };

  const handleToggleStatus = async (user: UserRecord) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await usersApi.setStatus(user.id, nextStatus);
      if (res.success) {
        showFeedback('success', `User account ${user.name} is now ${nextStatus}.`);
        loadAll();
      } else {
        showFeedback('error', res.error || 'Failed to update user status.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (user: UserRecord) => {
    if (user.roleName === 'SUPER_ADMIN') {
      showFeedback('error', 'Super Administrator account is protected and cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to deactivate and remove account for "${user.name}"?`)) {
      return;
    }

    try {
      const res = await usersApi.deleteUser(user.id);
      if (res.success) {
        showFeedback('success', `User account "${user.name}" removed.`);
        loadAll();
      } else {
        showFeedback('error', res.error || 'Failed to delete user.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete user.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q))
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
              <span className="text-teal-600 dark:text-teal-400 font-medium">User & Staff Management</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Users, Clinicians & Multi-Branch Staff
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One account per user within the organization. Assign to multiple branches with branch-specific roles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAll}
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
              <span>+ Onboard User</span>
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
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Personnel</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{users.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Accounts</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {users.filter((u) => u.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Doctors & Consultants</p>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
              {users.filter((u) => u.userType === 'Doctor' || u.roleName === 'DOCTOR').length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Multi-Branch Clinicians</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {users.filter((u) => u.branches && u.branches.length > 1).length}
            </p>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
            {/* Organization */}
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
            >
              <option value="all">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>

            {/* Branch */}
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            {/* Role */}
            <select
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs"
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{r.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading users directly from database...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <Users className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No users found</p>
              <p className="text-[11px] text-slate-400">Click "+ Onboard User" above to add doctors, nurses, or managers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <th className="py-2.5 px-3">User & Credentials</th>
                    <th className="py-2.5 px-3">Organization</th>
                    <th className="py-2.5 px-3">Role & User Type</th>
                    <th className="py-2.5 px-3">Assigned Branches (Section 6 & 12)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-xs shrink-0">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" />
                              {user.email}
                            </p>
                            {user.employeeId && (
                              <p className="text-[9px] text-slate-400 font-mono">Emp: {user.employeeId}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Building className="w-3 h-3 text-teal-600" />
                          {user.organizationName || 'MediEra Health'}
                        </span>
                        <p className="text-[10px] text-slate-400">{user.department}</p>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          <ShieldCheck className="w-3 h-3" />
                          {user.roleDisplayName || user.roleName}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">{user.designation}</p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {user.branches && user.branches.length > 0 ? (
                            user.branches.map((b) => (
                              <span
                                key={b.branchId}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                title={`Branch Role: ${b.roleName || user.roleName}`}
                              >
                                <GitBranch className="w-2.5 h-2.5 text-teal-600" />
                                {b.branchName || b.branchId}
                                {b.roleName && b.roleName !== user.roleName && (
                                  <span className="text-[9px] text-teal-600 font-mono">({b.roleName})</span>
                                )}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">All Branches</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                            user.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200'
                              : user.status === 'Invited'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active' ? 'bg-emerald-500' : user.status === 'Invited' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          {user.status}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {user.status === 'Invited' && (
                            <button
                              type="button"
                              onClick={() => handleResendInvite(user)}
                              className="p-1.5 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/60 text-amber-600 cursor-pointer"
                              title="Resend Password Setup Link"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
                            title="Edit User & Branches"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {user.roleName !== 'SUPER_ADMIN' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Delete User"
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

        {/* Modal: Onboard / Edit User */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {editingUser ? `Edit User: ${editingUser.name}` : 'Onboard New Personnel (Section 8)'}
                    </h2>
                    <p className="text-[10px] text-slate-400">Assign organization, branches, and roles</p>
                  </div>
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
                {/* 1. Organization Assignment */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Step 1: Select Organization *
                  </label>
                  <select
                    required
                    value={formData.organizationId}
                    onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Select organization...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.city || org.country})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Personal & Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Raj Kumar"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. raj.kumar@mediera.health"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Telephone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      User Type (Section 7)
                    </label>
                    <select
                      value={formData.userType}
                      onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Receptionist">Receptionist</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Manager">Manager</option>
                      <option value="Staff">Staff</option>
                      <option value="Inventory Manager">Inventory Manager</option>
                      <option value="Medical Store Manager">Medical Store Manager</option>
                      <option value="Pharmacist">Pharmacist</option>
                      <option value="Lab Staff">Lab Staff</option>
                      <option value="Other Employees">Other Employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Designation / Title
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Senior Consultant Cardiologist"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Primary System Role (Section 9 & 10) *
                    </label>
                    <select
                      required
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">Select primary role...</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.displayName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Multi-Branch & Branch-Specific Role Assignments (Section 6 & 12) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-teal-600" />
                        Branch Assignments & Branch-Specific Roles (Section 12)
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Assign this user to one or more branches. Optionally designate a branch-specific role override.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {branches.map((b) => {
                      const isAssigned = formData.branchIds.includes(b.id);
                      return (
                        <div
                          key={b.id}
                          className={`p-2 rounded-lg border flex items-center justify-between gap-3 ${
                            isAssigned
                              ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={() => toggleBranchSelection(b.id)}
                              className="w-3.5 h-3.5 text-teal-600 rounded"
                            />
                            <div>
                              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{b.name}</p>
                              <p className="text-[10px] text-slate-400">{b.city} • Code: {b.code}</p>
                            </div>
                          </label>

                          {isAssigned && (
                            <div className="w-48">
                              <select
                                value={formData.branchRoles[b.id] || formData.roleId}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    branchRoles: { ...formData.branchRoles, [b.id]: e.target.value },
                                  })
                                }
                                className="w-full px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300"
                              >
                                {roles.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    Role: {r.displayName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                    <span>{editingUser ? 'Save User' : 'Onboard User & Generate Setup Link'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Setup Invite Link (Section 8: User opens secure setup link) */}
        {inviteModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Account Onboarding Link Generated</h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                User <strong>{inviteModalData.name}</strong> ({inviteModalData.email}) has been registered. An invitation email was dispatched. You may also directly share this one-time secure password creation link:
              </p>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] break-all select-all text-slate-800 dark:text-slate-200">
                {inviteModalData.setupUrl}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalData(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs cursor-pointer"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inviteModalData.setupUrl)}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Setup Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};
