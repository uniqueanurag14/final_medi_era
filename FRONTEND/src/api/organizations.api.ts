import { apiRequest } from './client';

export interface OrganizationRecord {
  id: string;
  name: string;
  legalName?: string;
  registrationNumber?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  logoUrl?: string;
  website?: string;
  taxId?: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  status: 'Active' | 'Inactive';
  settings?: any;
  branchesCount?: number;
  usersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const organizationsApi = {
  async getOrganizations(params?: { search?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status && params.status !== 'All') q.set('status', params.status);
    const qs = q.toString();
    return apiRequest<OrganizationRecord[]>(`/api/organizations${qs ? `?${qs}` : ''}`);
  },

  async getOrganizationById(id: string) {
    return apiRequest<OrganizationRecord>(`/api/organizations/${id}`);
  },

  async createOrganization(data: Partial<OrganizationRecord>) {
    return apiRequest<OrganizationRecord>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrganization(id: string, data: Partial<OrganizationRecord>) {
    return apiRequest<OrganizationRecord>(`/api/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async setStatus(id: string, status: 'Active' | 'Inactive') {
    return apiRequest<{ success: boolean; status: string }>(`/api/organizations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteOrganization(id: string) {
    return apiRequest<{ success: boolean }>(`/api/organizations/${id}`, {
      method: 'DELETE',
    });
  },
};
