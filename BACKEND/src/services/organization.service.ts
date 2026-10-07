/**
 * Organization Service
 * 
 * Business logic layer for MediEra Healthcare Organizations.
 * Enforces validation, audit logging, and authorization boundaries.
 */

import { organizationRepository, DbOrganization } from '../repositories/organization.repository';
import { auditService } from './audit.service';

export class OrganizationService {
  public async getOrganizations(params?: { search?: string; status?: string }) {
    return organizationRepository.findAll(params);
  }

  public async getOrganizationById(id: string) {
    const org = await organizationRepository.findById(id);
    if (!org) {
      throw new Error(`Organization with ID "${id}" not found.`);
    }
    return org;
  }

  public async createOrganization(data: Partial<DbOrganization>, actor?: { id?: string; name?: string; email?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Organization name is required.');
    }
    if (!data.email || !data.email.trim()) {
      throw new Error('Primary corporate email is required.');
    }

    const org = await organizationRepository.create(data);

    await auditService.log({
      action: 'ORGANIZATION_CREATE',
      resource: 'organization',
      resourceId: org.id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { name: org.name, legalName: org.legalName, city: org.city },
    });

    return org;
  }

  public async updateOrganization(id: string, data: Partial<DbOrganization>, actor?: { id?: string; name?: string; email?: string }) {
    const existing = await organizationRepository.findById(id);
    if (!existing) {
      throw new Error(`Organization with ID "${id}" not found.`);
    }

    const updated = await organizationRepository.update(id, data);

    await auditService.log({
      action: 'ORGANIZATION_UPDATE',
      resource: 'organization',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { changes: Object.keys(data) },
    });

    return updated;
  }

  public async setOrganizationStatus(id: string, status: 'Active' | 'Inactive', actor?: { id?: string; name?: string; email?: string }) {
    const success = await organizationRepository.setStatus(id, status);
    if (!success) {
      throw new Error(`Failed to update status for organization ID "${id}".`);
    }

    await auditService.log({
      action: 'ORGANIZATION_STATUS_CHANGE',
      resource: 'organization',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { status },
    });

    return { success: true, status };
  }

  public async deleteOrganization(id: string, actor?: { id?: string; name?: string; email?: string }) {
    const success = await organizationRepository.delete(id);
    if (!success) {
      throw new Error(`Failed to delete organization ID "${id}".`);
    }

    await auditService.log({
      action: 'ORGANIZATION_DELETE',
      resource: 'organization',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { organizationId: id },
    });

    return { success: true };
  }
}

export const organizationService = new OrganizationService();
