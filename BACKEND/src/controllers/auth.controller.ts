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
}

export const authController = new AuthController();
