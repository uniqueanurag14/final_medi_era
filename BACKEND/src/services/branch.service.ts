/**
 * Branch Service
 * 
 * Business logic layer for MediEra Clinic Branches & Branch Settings.
 * Manages branch configurations, overrides, and working hours.
 */

import { branchRepository, DbBranch } from '../repositories/branch.repository';
import { auditService } from './audit.service';

export class BranchService {
  public async getBranches(params?: { organizationId?: string; search?: string; status?: string }) {
    return branchRepository.findAll(params);
  }

  public async getBranchById(id: string) {
    const branch = await branchRepository.findById(id);
    if (!branch) {
      throw new Error(`Branch with ID "${id}" not found.`);
    }
    return branch;
  }

  public async createBranch(data: Partial<DbBranch>, actor?: { id?: string; name?: string; email?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Branch name is required.');
    }
    if (!data.organizationId) {
      throw new Error('Branch must belong to an organization.');
    }

    const branch = await branchRepository.create(data);

    await auditService.log({
      action: 'BRANCH_CREATE',
      resource: 'branch',
      resourceId: branch.id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { name: branch.name, code: branch.code, organizationId: branch.organizationId },
    });

    return branch;
  }

  public async updateBranch(id: string, data: Partial<DbBranch>, actor?: { id?: string; name?: string; email?: string }) {
    const existing = await branchRepository.findById(id);
    if (!existing) {
      throw new Error(`Branch with ID "${id}" not found.`);
    }

    const updated = await branchRepository.update(id, data);

    await auditService.log({
      action: 'BRANCH_UPDATE',
      resource: 'branch',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { changes: Object.keys(data) },
    });

    return updated;
  }

  public async updateBranchSettings(id: string, settings: any, actor?: { id?: string; name?: string; email?: string }) {
    const existing = await branchRepository.findById(id);
    if (!existing) {
      throw new Error(`Branch with ID "${id}" not found.`);
    }

    const updated = await branchRepository.updateSettings(id, settings);

    await auditService.log({
      action: 'BRANCH_SETTINGS_UPDATE',
      resource: 'branch',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { settingsKeys: Object.keys(settings || {}) },
    });

    return updated;
  }

  public async setBranchStatus(id: string, status: 'Active' | 'Inactive', actor?: { id?: string; name?: string; email?: string }) {
    const success = await branchRepository.setStatus(id, status);
    if (!success) {
      throw new Error(`Failed to update status for branch ID "${id}".`);
    }

    await auditService.log({
      action: 'BRANCH_STATUS_CHANGE',
      resource: 'branch',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { status },
    });

    return { success: true, status };
  }

  public async deleteBranch(id: string, actor?: { id?: string; name?: string; email?: string }) {
    const success = await branchRepository.delete(id);
    if (!success) {
      throw new Error(`Failed to delete branch ID "${id}".`);
    }

    await auditService.log({
      action: 'BRANCH_DELETE',
      resource: 'branch',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { branchId: id },
    });

    return { success: true };
  }
}

export const branchService = new BranchService();
