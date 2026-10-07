import { apiRequest } from './client';

export interface PermissionItem {
  id: string;
  code: string;
  module: string;
  action: string;
  description?: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  organizationId?: string;
  isSystem: boolean;
  status: 'Active' | 'Inactive';
  usersCount?: number;
  permissionsCount?: number;
  permissions: string[];
  createdAt: string;
}

export const rolesApi = {
  async getRoles(params?: { organizationId?: string }) {
    const q = new URLSearchParams();
    if (params?.organizationId && params.organizationId !== 'all') q.set('organizationId', params.organizationId);
    const qs = q.toString();
    return apiRequest<RoleRecord[]>(`/api/roles${qs ? `?${qs}` : ''}`);
  },

  async getRoleById(id: string) {
    return apiRequest<RoleRecord>(`/api/roles/${id}`);
  },

  async createRole(data: {
    name: string;
    displayName?: string;
    description?: string;
    organizationId?: string;
    permissions?: string[];
  }) {
    return apiRequest<RoleRecord>('/api/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateRole(id: string, data: {
    name?: string;
    displayName?: string;
    description?: string;
    status?: 'Active' | 'Inactive';
    permissions?: string[];
  }) {
    return apiRequest<RoleRecord>(`/api/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async setStatus(id: string, status: 'Active' | 'Inactive') {
    return apiRequest<{ success: boolean; status: string }>(`/api/roles/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteRole(id: string) {
    return apiRequest<{ success: boolean }>(`/api/roles/${id}`, {
      method: 'DELETE',
    });
  },

  async getPermissions() {
    return apiRequest<PermissionItem[]>('/api/permissions');
  },
};
