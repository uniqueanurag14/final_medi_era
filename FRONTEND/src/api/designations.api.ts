import { apiRequest } from './client';

export interface DesignationRecord {
  id: string;
  name: string;
  code: string;
  description?: string;
  department?: string;
  active: boolean;
  usersCount?: number;
}

export const designationsApi = {
  async getDesignations() {
    return apiRequest<DesignationRecord[]>('/api/designations');
  },

  async getDesignationById(id: string) {
    return apiRequest<DesignationRecord>(`/api/designations/${id}`);
  },

  async createDesignation(data: Partial<DesignationRecord>) {
    return apiRequest<DesignationRecord>('/api/designations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateDesignation(id: string, data: Partial<DesignationRecord>) {
    return apiRequest<DesignationRecord>(`/api/designations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteDesignation(id: string) {
    return apiRequest<{ success: boolean; message?: string }>(`/api/designations/${id}`, {
      method: 'DELETE',
    });
  },
};
