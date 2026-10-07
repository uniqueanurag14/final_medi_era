/**
 * User Controller
 * 
 * REST API handlers for MediEra Users, Staff, Doctors, and Onboarding.
 */

import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { userService } from '../services/user.service';
import { validateCreateCrmUserDto } from '../dtos/auth.dto';

export class UserController {
  public async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const { organizationId, branchId, role, status, search } = req.query;
      const data = await userService.getUsers({
        organizationId: organizationId as string,
        branchId: branchId as string,
        role: role as string,
        status: status as string,
        search: search as string,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch users.' });
    }
  }

  public async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await userService.getUserById(req.params.id);
      return res.json({ success: true, data });
    } catch (err: any) {
      const is404 = err.message?.includes('not found');
      return res.status(is404 ? 404 : 500).json({ success: false, error: err.message });
    }
  }

  public async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = validateCreateCrmUserDto(req.body);
      if (!validation.valid || !validation.dto) {
        return res.status(400).json({ success: false, error: validation.errors.join(', ') });
      }

      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await userService.createUser(validation.dto, actor);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to onboard user.' });
    }
  }

  public async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const data = await userService.updateUser(req.params.id, req.body, actor);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update user.' });
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
      const result = await userService.setUserStatus(req.params.id, status, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update user status.' });
    }
  }

  public async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const result = await userService.deleteUser(req.params.id, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to delete user.' });
    }
  }

  public async resendInvite(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Admin' : 'Admin',
        email: req.user?.email,
      };
      const result = await userService.resendInvite(req.params.id, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to resend invitation.' });
    }
  }

  public async completePasswordSetup(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, error: 'Setup token is required.' });
      }
      if (!password || password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
      }
      const result = await userService.completePasswordSetup(token, password);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Password setup failed.' });
    }
  }
}

export const userController = new UserController();
