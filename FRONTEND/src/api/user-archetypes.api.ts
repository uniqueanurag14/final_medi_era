import { apiRequest } from './client';

export interface UserArchetypeRecord {
  id: string;
  name: string;
  code: string;
  category: 'Clinical' | 'Administrative' | 'Technical' | 'Support';
  description?: string;
  isSystem: boolean;
  active: boolean;
  usersCount?: number;
}

export const userArchetypesApi = {
  async getArchetypes() {
    return apiRequest<UserArchetypeRecord[]>('/api/user-archetypes');
  },

  async getArchetypeById(id: string) {
    return apiRequest<UserArchetypeRecord>(`/api/user-archetypes/${id}`);
  },

  async createArchetype(data: Partial<UserArchetypeRecord>) {
    return apiRequest<UserArchetypeRecord>('/api/user-archetypes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateArchetype(id: string, data: Partial<UserArchetypeRecord>) {
    return apiRequest<UserArchetypeRecord>(`/api/user-archetypes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteArchetype(id: string) {
    return apiRequest<{ success: boolean; message?: string }>(`/api/user-archetypes/${id}`, {
      method: 'DELETE',
    });
  },
};
