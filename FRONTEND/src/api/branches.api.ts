import { apiRequest } from './client';

export interface BranchRecord {
  id: string;
  organizationId: string;
  organizationName?: string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  timezone: string;
  workingHours?: any;
  settings?: any;
  isMainBranch: boolean;
  status: 'Active' | 'Inactive';
  usersCount?: number;
  createdAt: string;
}

export const branchesApi = {
  async getBranches(params?: { organizationId?: string; search?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params?.organizationId && params.organizationId !== 'all') q.set('organizationId', params.organizationId);
    if (params?.search) q.set('search', params.search);
    if (params?.status && params.status !== 'All') q.set('status', params.status);
    const qs = q.toString();
    return apiRequest<BranchRecord[]>(`/api/branches${qs ? `?${qs}` : ''}`);
  },

  async getBranchById(id: string) {
    return apiRequest<BranchRecord>(`/api/branches/${id}`);
  },

  async createBranch(data: Partial<BranchRecord>) {
    return apiRequest<BranchRecord>('/api/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBranch(id: string, data: Partial<BranchRecord>) {
    return apiRequest<BranchRecord>(`/api/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateSettings(id: string, settings: any) {
    return apiRequest<BranchRecord>(`/api/branches/${id}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async setStatus(id: string, status: 'Active' | 'Inactive') {
    return apiRequest<{ success: boolean; status: string }>(`/api/branches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteBranch(id: string) {
    return apiRequest<{ success: boolean }>(`/api/branches/${id}`, {
      method: 'DELETE',
    });
  },
};
