/**
 * Organization Controller
 * 
 * REST API handlers for MediEra Organizations.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { organizationService } from '../services/organization.service';

export class OrganizationController {
  public async getOrganizations(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, status } = req.query;
      const data = await organizationService.getOrganizations({
        search: search as string,
        status: status as string,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch organizations.' });
    }
  }

  public async getOrganizationById(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await organizationService.getOrganizationById(req.params.id);
      return res.json({ success: true, data });
    } catch (err: any) {
      const is404 = err.message?.includes('not found');
      return res.status(is404 ? 404 : 500).json({ success: false, error: err.message });
    }
  }

  public async createOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await organizationService.createOrganization(req.body, actor);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to create organization.' });
    }
  }

  public async updateOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await organizationService.updateOrganization(req.params.id, req.body, actor);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update organization.' });
    }
  }

  public async setStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { status } = req.body;
      if (!status || (status !== 'Active' && status !== 'Inactive')) {
        return res.status(400).json({ success: false, error: 'Status must be "Active" or "Inactive".' });
      }
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const result = await organizationService.setOrganizationStatus(req.params.id, status, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update organization status.' });
    }
  }

  public async deleteOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const result = await organizationService.deleteOrganization(req.params.id, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to delete organization.' });
    }
  }
}

export const organizationController = new OrganizationController();
