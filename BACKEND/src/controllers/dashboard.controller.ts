/**
 * Dashboard Controller
 * 
 * Delivers real database statistics for executive, doctor, and front-office dashboards.
 */

import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.getStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      console.error('[DashboardController] Error aggregating dashboard stats:', err);
      res.status(500).json({
        success: false,
        error: err?.message || 'Failed to aggregate dashboard metrics from database',
      });
    }
  }
}

export const dashboardController = new DashboardController();
