/**
 * Inventory Controller
 * 
 * Production REST API handlers for MediEra Medical Inventory & Pharmacy module.
 * Delegates strictly to InventoryService.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { inventoryService } from '../services/inventory.service';

export class InventoryController {
  public async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await inventoryService.getDashboardMetrics();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch inventory dashboard metrics.' });
    }
  }

  public async getItems(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, category, status, stockStatus, page, limit } = req.query;
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      const result = await inventoryService.getItems({
        search: search as string,
        category: category as string,
        status: status as string,
        stockStatus: stockStatus as string,
        limit: limitNum,
        offset,
      });

      return res.json({
        success: true,
        data: result.items,
        meta: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.total / limitNum) || 1,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch inventory items.' });
    }
  }

  public async getItemById(req: AuthenticatedRequest, res: Response) {
    try {
      const item = await inventoryService.getItemById(req.params.id);
      return res.json({ success: true, data: item });
    } catch (err: any) {
      const is404 = err.message?.includes('not found');
      return res.status(is404 ? 404 : 500).json({ success: false, error: err.message });
    }
  }

  public async createItem(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Pharmacist' : 'Pharmacist',
        email: req.user?.email,
      };

      const item = await inventoryService.createItem(req.body, actor);
      return res.status(201).json({ success: true, data: item });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to create inventory item.' });
    }
  }

  public async updateItem(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Pharmacist' : 'Pharmacist',
        email: req.user?.email,
      };

      const item = await inventoryService.updateItem(req.params.id, req.body, actor);
      return res.json({ success: true, data: item });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to update inventory item.' });
    }
  }

  public async deleteItem(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Pharmacist' : 'Pharmacist',
        email: req.user?.email,
      };

      const result = await inventoryService.deleteItem(req.params.id, actor);
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to delete inventory item.' });
    }
  }

  public async stockIn(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Stock Officer' : 'Stock Officer',
        email: req.user?.email,
      };

      const result = await inventoryService.stockIn(req.body, actor);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Stock in failed.' });
    }
  }

  public async stockOut(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Dispenser' : 'Dispenser',
        email: req.user?.email,
      };

      const result = await inventoryService.stockOut(req.body, actor);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Stock out failed.' });
    }
  }

  public async createAdjustment(req: AuthenticatedRequest, res: Response) {
    try {
      const actor = {
        id: req.user?.id ? String(req.user.id) : undefined,
        name: req.user ? `${(req.user as any).firstName || ''} ${(req.user as any).lastName || ''}`.trim() || 'Auditor' : 'Auditor',
        email: req.user?.email,
      };

      const result = await inventoryService.createAdjustment(req.body, actor);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Stock adjustment failed.' });
    }
  }

  public async getMovements(req: AuthenticatedRequest, res: Response) {
    try {
      const { itemId, type, limit } = req.query;
      const data = await inventoryService.getMovements({
        itemId: itemId as string,
        type: type as string,
        limit: limit ? parseInt(limit as string, 10) : 100,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch stock movements.' });
    }
  }

  public async getAdjustments(req: AuthenticatedRequest, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const data = await inventoryService.getAdjustments(limit);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch adjustments.' });
    }
  }

  public async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await inventoryService.getCategories();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch categories.' });
    }
  }

  public async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await inventoryService.createCategory(req.body);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to create category.' });
    }
  }

  public async getSuppliers(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await inventoryService.getSuppliers();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Failed to fetch suppliers.' });
    }
  }

  public async createSupplier(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await inventoryService.createSupplier(req.body);
      return res.status(201).json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to create supplier.' });
    }
  }
}

export const inventoryController = new InventoryController();
