import { apiRequest } from './client';

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  headOfDepartment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const departmentsApi = {
  async getDepartments() {
    return apiRequest<DepartmentRecord[]>('/api/departments');
  },

  async getDepartmentById(id: string) {
    return apiRequest<DepartmentRecord>(`/api/departments/${id}`);
  },

  async createDepartment(data: Partial<DepartmentRecord>) {
    return apiRequest<DepartmentRecord>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateDepartment(id: string, data: Partial<DepartmentRecord>) {
    return apiRequest<DepartmentRecord>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteDepartment(id: string) {
    return apiRequest<{ success: boolean; message?: string }>(`/api/departments/${id}`, {
      method: 'DELETE',
    });
  },
};
