/**
 * Settings Controller
 * 
 * Controllers MUST NOT contain direct database queries.
 * Delegates strictly to SettingsService.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { settingsService } from '../services/settings.service';

export class SettingsController {
  /**
   * GET /api/settings
   * Returns real system settings and database engine status
   */
  public async getAllSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const settings = await settingsService.getAllSettings();
      return res.json({
        success: true,
        data: settings,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: `Failed to fetch system settings: ${err.message}`,
      });
    }
  }

  /**
   * GET /api/settings/data-config
   * Returns environment capabilities and runtime settings
   */
  public async getDataConfiguration(req: AuthenticatedRequest, res: Response) {
    try {
      const config = await settingsService.getDataConfiguration();
      return res.json({
        success: true,
        data: config,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }

  /**
   * POST /api/settings/data-config
   * Updates runtime demo / dummy setting (only if allowed by .env)
   */
  public async updateDataConfiguration(req: AuthenticatedRequest, res: Response) {
    try {
      const { runtimeDemoData, runtimeDummyData } = req.body;
      const config = await settingsService.updateDataConfiguration({
        runtimeDemoData: typeof runtimeDemoData === 'boolean' ? runtimeDemoData : undefined,
        runtimeDummyData: typeof runtimeDummyData === 'boolean' ? runtimeDummyData : undefined,
      });
      return res.json({
        success: true,
        message: 'Data configuration updated successfully.',
        data: config,
      });
    } catch (err: any) {
      return res.status(403).json({
        success: false,
        error: err.message,
      });
    }
  }
}

export const settingsController = new SettingsController();
