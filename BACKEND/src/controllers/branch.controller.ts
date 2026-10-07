/**
 * Branch Controller
 * 
 * REST API handlers for MediEra Clinic Branches & Branch Settings.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { branchService } from '../services/branch.service';

export class BranchController {
  public async getBranches(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, search, status } = req.query;
      const data = await branchService.getBranches({
        organizationId: organizationId as string,
        search: search as string,
        status: status as string,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch branches.' });
    }
  }

  public async getBranchById(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await branchService.getBranchById(req.params.id);
      return res.json({ success: true, data });
    } catch (err: any) {
      const is404 = err.message?.includes('not found');
      return res.status(is404 ? 404 : 500).json({ success: false, error: err.message });
    }
  }

  public async createBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await branchService.createBranch(req.body, actor);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to create branch.' });
    }
  }

  public async updateBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await branchService.updateBranch(req.params.id, req.body, actor);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update branch.' });
    }
  }

  public async updateSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await branchService.updateBranchSettings(req.params.id, req.body, actor);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update branch settings.' });
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
      const result = await branchService.setBranchStatus(req.params.id, status, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update branch status.' });
    }
  }

  public async deleteBranch(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const result = await branchService.deleteBranch(req.params.id, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to delete branch.' });
    }
  }
}

export const branchController = new BranchController();
