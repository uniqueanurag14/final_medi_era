import { apiRequest } from './client';

export interface UserBranchItem {
  branchId: string;
  branchName?: string;
  roleId?: string;
  roleName?: string;
  isPrimary: boolean;
}

export interface UserRecord {
  id: string;
  organizationId: string;
  organizationName?: string;
  branchId?: string;
  branchName?: string;
  roleId: string;
  roleName: string;
  roleDisplayName?: string;
  email: string;
  name: string;
  phone?: string;
  employeeId?: string;
  designation?: string;
  department?: string;
  userType: string;
  avatarUrl?: string;
  status: 'Active' | 'Inactive' | 'Invited' | 'Suspended';
  active: boolean;
  branches: UserBranchItem[];
  roles: string[];
  permissions: string[];
  setupToken?: string;
  createdAt: string;
}

export const usersApi = {
  async getUsers(params?: {
    organizationId?: string;
    branchId?: string;
    role?: string;
    status?: string;
    search?: string;
  }) {
    const q = new URLSearchParams();
    if (params?.organizationId && params.organizationId !== 'all') q.set('organizationId', params.organizationId);
    if (params?.branchId && params.branchId !== 'all') q.set('branchId', params.branchId);
    if (params?.role && params.role !== 'all') q.set('role', params.role);
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiRequest<UserRecord[]>(`/api/users${qs ? `?${qs}` : ''}`);
  },

  async getUserById(id: string) {
    return apiRequest<UserRecord>(`/api/users/${id}`);
  },

  async createUser(data: {
    email: string;
    name: string;
    phone?: string;
    organizationId: string;
    roleId: string;
    branchIds?: string[];
    branchRoles?: Record<string, string>;
    designation?: string;
    department?: string;
    userType?: string;
    status?: 'Active' | 'Inactive' | 'Invited';
    avatarUrl?: string;
  }) {
    return apiRequest<UserRecord>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: string, data: Partial<UserRecord> & { branchIds?: string[]; branchRoles?: Record<string, string> }) {
    return apiRequest<UserRecord>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async setStatus(id: string, status: 'Active' | 'Inactive') {
    return apiRequest<{ success: boolean; status: string }>(`/api/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async resendInvite(id: string) {
    return apiRequest<{ success: boolean; setupToken: string; setupUrl: string; message: string }>(
      `/api/users/${id}/resend-invite`,
      { method: 'POST' }
    );
  },

  async deleteUser(id: string) {
    return apiRequest<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  async completePasswordSetup(token: string, password: string) {
    return apiRequest<{ success: boolean; email: string }>('/api/auth/setup-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};
