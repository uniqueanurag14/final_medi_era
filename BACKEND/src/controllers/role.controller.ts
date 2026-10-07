/**
 * Role Controller
 * 
 * REST API handlers for MediEra Roles and Permissions.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { roleService } from '../services/role.service';

export class RoleController {
  public async getRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId } = req.query;
      const data = await roleService.getRoles({
        organizationId: organizationId as string,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch roles.' });
    }
  }

  public async getRoleById(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await roleService.getRoleById(req.params.id);
      return res.json({ success: true, data });
    } catch (err: any) {
      const is404 = err.message?.includes('not found');
      return res.status(is404 ? 404 : 500).json({ success: false, error: err.message });
    }
  }

  public async createRole(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await roleService.createRole(req.body, actor);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to create role.' });
    }
  }

  public async updateRole(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await roleService.updateRole(req.params.id, req.body, actor);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update role.' });
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
      const result = await roleService.setRoleStatus(req.params.id, status, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update role status.' });
    }
  }

  public async deleteRole(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const result = await roleService.deleteRole(req.params.id, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to delete role.' });
    }
  }

  public async getPermissions(_req: AuthenticatedRequest, res: Response) {
    try {
      const data = await roleService.getAllPermissions();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch permissions.' });
    }
  }
}

export const roleController = new RoleController();
