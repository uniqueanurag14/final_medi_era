/**
 * Role Service
 * 
 * Business logic layer for MediEra Roles and Permissions Management.
 */

import { roleRepository } from '../repositories/role.repository';
import { auditService } from './audit.service';

export class RoleService {
  public async getRoles(params?: { organizationId?: string }) {
    return roleRepository.findAll(params);
  }

  public async getRoleById(id: string) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw new Error(`Role with ID "${id}" not found.`);
    }
    return role;
  }

  public async createRole(data: {
    name: string;
    displayName?: string;
    description?: string;
    organizationId?: string;
    permissions?: string[];
  }, actor?: { id?: string; name?: string; email?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Role name is required.');
    }

    const role = await roleRepository.create(data);

    await auditService.log({
      action: 'ROLE_CREATE',
      resource: 'role',
      resourceId: role.id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { name: role.name, permissionsCount: role.permissionsCount },
    });

    return role;
  }

  public async updateRole(id: string, data: {
    name?: string;
    displayName?: string;
    description?: string;
    status?: 'Active' | 'Inactive';
    permissions?: string[];
  }, actor?: { id?: string; name?: string; email?: string }) {
    const existing = await roleRepository.findById(id);
    if (!existing) {
      throw new Error(`Role with ID "${id}" not found.`);
    }

    const updated = await roleRepository.update(id, data);

    await auditService.log({
      action: 'ROLE_UPDATE',
      resource: 'role',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { changes: Object.keys(data) },
    });

    return updated;
  }

  public async setRoleStatus(id: string, status: 'Active' | 'Inactive', actor?: { id?: string; name?: string; email?: string }) {
    const success = await roleRepository.setStatus(id, status);
    if (!success) {
      throw new Error(`Failed to update status for role ID "${id}".`);
    }

    await auditService.log({
      action: 'ROLE_STATUS_CHANGE',
      resource: 'role',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { status },
    });

    return { success: true, status };
  }

  public async deleteRole(id: string, actor?: { id?: string; name?: string; email?: string }) {
    const success = await roleRepository.delete(id);
    if (!success) {
      throw new Error(`Failed to delete role ID "${id}".`);
    }

    await auditService.log({
      action: 'ROLE_DELETE',
      resource: 'role',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { roleId: id },
    });

    return { success: true };
  }

  public async getAllPermissions() {
    return roleRepository.getAllPermissions();
  }
}

export const roleService = new RoleService();
