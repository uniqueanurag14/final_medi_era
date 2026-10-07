/**
 * Authentication Controller
 * 
 * Delegates to AuthService.
 * No direct database queries.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import { LoginDto, RegisterPatientDto } from '../dtos/auth.dto';

export class AuthController {
  public async login(req: AuthenticatedRequest, res: Response) {
    try {
      const dto = req.body as LoginDto;
      const result = await authService.login(dto);

      if (!result.success) {
        return res.status(result.statusCode || 401).json({
          success: false,
          error: result.error || 'Authentication failed',
        });
      }

      return res.json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: `Login processing failed: ${err.message}`,
      });
    }
  }

  public async registerPatient(req: AuthenticatedRequest, res: Response) {
    try {
      const dto = req.body as RegisterPatientDto;
      const result = await authService.registerPatient(dto);

      return res.status(201).json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: `Registration failed: ${err.message}`,
      });
    }
  }

  public async getMe(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    return res.json({
      success: true,
      data: req.user,
    });
  }

  public async logout(req: AuthenticatedRequest, res: Response) {
    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  public async forgotPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { email, role } = req.body;
      if (!email || !String(email).trim()) {
        return res.status(400).json({ success: false, error: 'Email address is required.' });
      }
      const result = await authService.forgotPassword(String(email).trim(), role);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Forgot password request failed.' });
    }
  }

  public async verifyResetCode(req: AuthenticatedRequest, res: Response) {
    try {
      const { token, code, email } = req.body;
      const tokenOrCode = token || code;
      if (!tokenOrCode) {
        return res.status(400).json({ success: false, error: 'Verification token or 6-digit code is required.' });
      }
      const result = await authService.verifyResetCode(tokenOrCode, email);
      if (!result.valid) {
        return res.status(400).json({ success: false, error: result.message || 'Invalid or expired code.' });
      }
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Verification failed.' });
    }
  }

  public async resetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { token, code, newPassword, email } = req.body;
      const tokenOrCode = token || code;
      if (!tokenOrCode || !newPassword) {
        return res.status(400).json({ success: false, error: 'Token/code and new password are required.' });
      }
      const result = await authService.resetPassword(tokenOrCode, newPassword, email);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.message });
      }
      return res.json({ success: true, message: result.message });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Reset password failed.' });
    }
  }

  public async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
      }
      const result = await authService.changePassword(String(req.user.id), currentPassword, newPassword);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.message });
      }
      return res.json({ success: true, message: result.message });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Change password failed.' });
    }
  }

  public async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }
      const { name, firstName, lastName, phone, avatarUrl, avatar } = req.body;
      let finalName = name;
      if (!finalName && (firstName || lastName)) {
        finalName = `${firstName || ''} ${lastName || ''}`.trim();
      }
      const result = await authService.updateProfile(String(req.user.id), {
        name: finalName,
        phone,
        avatarUrl: avatarUrl || avatar,
      });
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      return res.json({ success: true, data: result.user });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Profile update failed.' });
    }
  }
}

export const authController = new AuthController();
