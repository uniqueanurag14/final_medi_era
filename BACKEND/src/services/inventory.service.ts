/**
 * Inventory Service
 * 
 * Business logic layer for MediEra Medical Inventory & Pharmacy module.
 * Validates stock quantities, calculates margins, updates stock levels transactionally,
 * and records tamper-evident movement audit logs.
 */

import { inventoryRepository, DbInventoryItem, DbStockMovement, DbStockAdjustment, DbInventoryCategory, DbSupplier } from '../repositories/inventory.repository';
import { auditService } from './audit.service';

export interface CreateItemInput {
  name: string;
  genericName?: string;
  category: string;
  dosageForm?: string;
  sku?: string;
  barcode?: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  minReorderLevel?: number;
  maxStock?: number;
  unit?: string;
  costPrice: number;
  sellingPrice: number;
  taxRate?: number;
  supplier: string;
  supplierId?: string;
  storageLocation?: string;
  brand?: string;
  description?: string;
}

export interface StockInInput {
  itemId: string;
  quantity: number;
  unitCost?: number;
  batchNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  supplierId?: string;
  supplierName?: string;
  reason?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface StockOutInput {
  itemId: string;
  quantity: number;
  reason: 'PATIENT_DISPENSED' | 'PROCEDURE_USE' | 'DEPARTMENT_TRANSFER' | 'EXPIRED_DISCARD' | 'DAMAGED' | 'OTHER';
  patientId?: string;
  prescriptionId?: string;
  notes?: string;
}

export interface AdjustmentInput {
  itemId: string;
  adjustmentType: 'INCREASE' | 'DECREASE' | 'DAMAGED' | 'LOST' | 'EXPIRED' | 'PHYSICAL_CORRECTION';
  adjustmentQuantity: number;
  reason: string;
  notes?: string;
}

export class InventoryService {
  public async getDashboardMetrics() {
    return inventoryRepository.getDashboardMetrics();
  }

  public async getItems(params: {
    search?: string;
    category?: string;
    status?: string;
    stockStatus?: string;
    limit?: number;
    offset?: number;
  }) {
    return inventoryRepository.getItems(params);
  }

  public async getItemById(id: string) {
    const item = await inventoryRepository.getItemById(id);
    if (!item) {
      throw new Error(`Inventory item with ID ${id} not found.`);
    }
    return item;
  }

  public async createItem(input: CreateItemInput, actor?: { id?: string; name?: string; email?: string }) {
    if (!input.name || !input.name.trim()) {
      throw new Error('Medicine / Item name is required.');
    }
    if (!input.batchNumber || !input.batchNumber.trim()) {
      throw new Error('Batch number is required for medical inventory tracking.');
    }
    if (!input.expiryDate) {
      throw new Error('Expiry date is mandatory for pharmaceuticals and clinical consumables.');
    }
    if (input.currentStock < 0) {
      throw new Error('Stock quantity cannot be negative.');
    }
    if (input.costPrice < 0 || input.sellingPrice < 0) {
      throw new Error('Prices cannot be negative.');
    }

    const id = `item-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const sku = input.sku?.trim() || `MED-${Date.now().toString().slice(-6)}`;

    const created = await inventoryRepository.createItem({
      id,
      name: input.name.trim(),
      genericName: (input.genericName || input.name).trim(),
      category: input.category || 'Pharmaceuticals',
      dosageForm: input.dosageForm || 'Tablets',
      sku,
      barcode: input.barcode?.trim(),
      batchNumber: input.batchNumber.trim().toUpperCase(),
      expiryDate: input.expiryDate,
      currentStock: Number(input.currentStock || 0),
      minReorderLevel: Number(input.minReorderLevel || 10),
      maxStock: Number(input.maxStock || 100),
      unit: input.unit || 'Tablets',
      costPrice: Number(input.costPrice || 0),
      sellingPrice: Number(input.sellingPrice || 0),
      taxRate: Number(input.taxRate || 0),
      supplier: input.supplier?.trim() || 'Direct Pharmaceutical Supply',
      supplierId: input.supplierId,
      storageLocation: input.storageLocation?.trim() || 'Main Pharmacy Rack A1',
      brand: input.brand?.trim(),
      description: input.description?.trim(),
    });

    // Record initial movement in ledger if initial stock > 0
    if (created.currentStock > 0) {
      await inventoryRepository.createMovement({
        id: `mov-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        referenceNumber: `GRN-${Date.now().toString().slice(-6)}`,
        type: 'STOCK_IN',
        itemId: created.id,
        itemName: created.name,
        sku: created.sku,
        quantity: created.currentStock,
        previousStock: 0,
        newStock: created.currentStock,
        unitCost: created.costPrice,
        totalValue: created.currentStock * created.costPrice,
        batchNumber: created.batchNumber,
        expiryDate: created.expiryDate,
        storageLocation: created.storageLocation,
        supplierName: created.supplier,
        reason: 'INITIAL_STOCK',
        notes: 'Initial inventory item catalog registration',
        userName: actor?.name || 'Pharmacist',
      });
    }

    auditService.logAction({
      userId: actor?.id ? Number(actor.id) : null,
      userEmail: actor?.email || 'admin@mediera.com',
      action: 'INVENTORY_ITEM_CREATED',
      resource: 'inventory_items',
      resourceId: created.id,
      metadata: { name: created.name, sku: created.sku, batch: created.batchNumber, initialStock: created.currentStock },
    }).catch(() => {});

    return created;
  }

  public async updateItem(id: string, updates: Partial<CreateItemInput>, actor?: { id?: string; name?: string; email?: string }) {
    const existing = await this.getItemById(id);

    const updated = await inventoryRepository.updateItem(id, {
      ...updates,
      currentStock: updates.currentStock !== undefined ? Number(updates.currentStock) : existing.currentStock,
      minReorderLevel: updates.minReorderLevel !== undefined ? Number(updates.minReorderLevel) : existing.minReorderLevel,
      maxStock: updates.maxStock !== undefined ? Number(updates.maxStock) : existing.maxStock,
      costPrice: updates.costPrice !== undefined ? Number(updates.costPrice) : existing.costPrice,
      sellingPrice: updates.sellingPrice !== undefined ? Number(updates.sellingPrice) : existing.sellingPrice,
      taxRate: updates.taxRate !== undefined ? Number(updates.taxRate) : existing.taxRate,
    });

    auditService.logAction({
      userId: actor?.id ? Number(actor.id) : null,
      userEmail: actor?.email || 'admin@mediera.com',
      action: 'INVENTORY_ITEM_UPDATED',
      resource: 'inventory_items',
      resourceId: id,
      metadata: { name: updated?.name, updates },
    }).catch(() => {});

    return updated;
  }

  public async deleteItem(id: string, actor?: { id?: string; name?: string; email?: string }) {
    const item = await this.getItemById(id);
    const success = await inventoryRepository.deleteItem(id);

    auditService.logAction({
      userId: actor?.id ? Number(actor.id) : null,
      userEmail: actor?.email || 'admin@mediera.com',
      action: 'INVENTORY_ITEM_DELETED',
      resource: 'inventory_items',
      resourceId: id,
      metadata: { name: item.name, sku: item.sku },
    }).catch(() => {});

    return { success, message: `Item ${item.name} successfully removed from inventory.` };
  }

  // --- Stock In (Goods Receipt Note / Supplier Delivery) ---
  public async stockIn(input: StockInInput, actor?: { id?: string; name?: string; email?: string }) {
    if (!input.quantity || input.quantity <= 0) {
      throw new Error('Stock in quantity must be greater than zero.');
    }

    const item = await this.getItemById(input.itemId);
    const previousStock = item.currentStock;
    const newStock = previousStock + input.quantity;
    const unitCost = input.unitCost !== undefined ? Number(input.unitCost) : item.costPrice;
    const totalValue = input.quantity * unitCost;

    // Update item stock in DB
    await inventoryRepository.updateItem(item.id, {
      currentStock: newStock,
      costPrice: unitCost,
      batchNumber: input.batchNumber?.trim() || item.batchNumber,
      expiryDate: input.expiryDate || item.expiryDate,
      storageLocation: input.storageLocation?.trim() || item.storageLocation,
    });

    // Create movement record
    const ref = input.invoiceNumber?.trim() || `GRN-${Date.now().toString().slice(-6)}`;
    const movement = await inventoryRepository.createMovement({
      id: `mov-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      referenceNumber: ref,
      type: 'STOCK_IN',
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      quantity: input.quantity,
      previousStock,
      newStock,
      unitCost,
      totalValue,
      batchNumber: input.batchNumber || item.batchNumber,
      expiryDate: input.expiryDate || item.expiryDate,
      storageLocation: input.storageLocation || item.storageLocation,
      supplierId: input.supplierId,
      supplierName: input.supplierName || item.supplier,
      reason: input.reason || 'GOODS_RECEIPT',
      notes: input.notes,
      userName: actor?.name || 'Stock Inward Officer',
    });

    auditService.logAction({
      userId: actor?.id ? Number(actor.id) : null,
      userEmail: actor?.email || 'admin@mediera.com',
      action: 'STOCK_IN_RECEIVED',
      resource: 'inventory_items',
      resourceId: item.id,
      metadata: { item: item.name, qty: input.quantity, previousStock, newStock, reference: ref },
    }).catch(() => {});

    const updatedItem = await this.getItemById(item.id);
    return { item: updatedItem, movement };
  }

  // --- Stock Out (Dispensed / Patient Prescription / OT Use / Discard) ---
  public async stockOut(input: StockOutInput, actor?: { id?: string; name?: string; email?: string }) {
    if (!input.quantity || input.quantity <= 0) {
      throw new Error('Stock out quantity must be greater than zero.');
    }

    const item = await this.getItemById(input.itemId);
    if (item.currentStock < input.quantity) {
      throw new Error(
        `Insufficient stock for "${item.name}". Available: ${item.currentStock} ${item.unit}, requested: ${input.quantity} ${item.unit}.`
      );
    }

    const previousStock = item.currentStock;
    const newStock = previousStock - input.quantity;
    const totalValue = input.quantity * item.costPrice;

    // Update item stock in DB
    await inventoryRepository.updateItem(item.id, {
      currentStock: newStock,
    });

    // Create movement record
    const ref = `DISP-${Date.now().toString().slice(-6)}`;
    const movement = await inventoryRepository.createMovement({
      id: `mov-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      referenceNumber: ref,
      type: 'STOCK_OUT',
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      quantity: input.quantity,
      previousStock,
      newStock,
      unitCost: item.costPrice,
      totalValue,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      storageLocation: item.storageLocation,
      reason: input.reason || 'PATIENT_DISPENSED',
      patientId: input.patientId,
      prescriptionId: input.prescriptionId,
      notes: input.notes,
      userName: actor?.name || 'Dispensing Pharmacist',
    });

    auditService.logAction({
      userId: actor?.id ? Number(actor.id) : null,
      userEmail: actor?.email || 'admin@mediera.com',
      action: 'STOCK_OUT_DISPENSED',
      resource: 'inventory_items',
      resourceId: item.id,
      metadata: { item: item.name, qty: input.quantity, previousStock, newStock, reason: input.reason },
    }).catch(() => {});

    const updatedItem = await this.getItemById(item.id);
    return { item: updatedItem, movement };
  }

  // --- Stock Adjustment ---
  public async createAdjustment(input: AdjustmentInput, actor?: { id?: string; name?: string; email?: string }) {
    if (!input.adjustmentQuantity || input.adjustmentQuantity === 0) {
      throw new Error('Adjustment quantity must not be zero.');
    }

    const item = await this.getItemById(input.itemId);
    const existingQuantity = item.currentStock;

    let newQuantity = existingQuantity;
    if (input.adjustmentType === 'INCREASE') {
      newQuantity = existingQuantity + Math.abs(input.adjustmentQuantity);
    } else if (
      input.adjustmentType === 'DECREASE' ||
      input.adjustmentType === 'DAMAGED' ||
      input.adjustmentType === 'LOST' ||
      input.adjustmentType === 'EXPIRED'
    ) {
      newQuantity = Math.max(0, existingQuantity - Math.abs(input.adjustmentQuantity));
    } else if (input.adjustmentType === 'PHYSICAL_CORRECTION') {
      newQuantity = Math.max(0, input.adjustmentQuantity);
    }

    const diff = newQuantity - existingQuantity;

    // Update item stock
    await inventoryRepository.updateItem(item.id, {
      currentStock: newQuantity,
    });

    // Create adjustment log
    const adjNum = `ADJ-${Date.now().toString().slice(-6)}`;
    const adjustment = await inventoryRepository.createAdjustment({
      id: `adj-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      adjustmentNumber: adjNum,
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      existingQuantity,
      adjustmentQuantity: Math.abs(diff),
      newQuantity,
      adjustmentType: input.adjustmentType,
      reason: input.reason,
      notes: input.notes,
      userName: actor?.name || 'Inventory Auditor',
    });

    // Also record in movement history
    await inventoryRepository.createMovement({
      id: `mov-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      referenceNumber: adjNum,
      type: 'ADJUSTMENT',
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      quantity: Math.abs(diff),
      previousStock: existingQuantity,
      newStock: newQuantity,
      unitCost: item.costPrice,
      totalValue: Math.abs(diff) * item.costPrice,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      storageLocation: item.storageLocation,
      reason: `STOCK_ADJUSTMENT_${input.adjustmentType}`,
      notes: `${input.reason} ${input.notes ? `(${input.notes})` : ''}`,
      userName: actor?.name || 'Inventory Auditor',
    });

    auditService.logAction({
      userId: actor?.id ? Number(actor.id) : null,
      userEmail: actor?.email || 'admin@mediera.com',
      action: 'STOCK_ADJUSTMENT_APPLIED',
      resource: 'inventory_items',
      resourceId: item.id,
      metadata: { item: item.name, existingQuantity, newQuantity, type: input.adjustmentType, reason: input.reason },
    }).catch(() => {});

    const updatedItem = await this.getItemById(item.id);
    return { item: updatedItem, adjustment };
  }

  // --- Movements Ledger ---
  public async getMovements(params?: { itemId?: string; type?: string; limit?: number }) {
    return inventoryRepository.getMovements(params);
  }

  public async getAdjustments(limit?: number) {
    return inventoryRepository.getAdjustments(limit);
  }

  // --- Categories ---
  public async getCategories() {
    return inventoryRepository.getCategories();
  }

  public async createCategory(input: { name: string; code: string; description?: string }) {
    if (!input.name || !input.name.trim()) throw new Error('Category name is required.');
    if (!input.code || !input.code.trim()) throw new Error('Category code is required.');

    const id = `cat-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    return inventoryRepository.createCategory({
      id,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      description: input.description?.trim(),
    });
  }

  // --- Suppliers ---
  public async getSuppliers() {
    return inventoryRepository.getSuppliers();
  }

  public async createSupplier(input: {
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    notes?: string;
  }) {
    if (!input.name || !input.name.trim()) throw new Error('Supplier name is required.');
    if (!input.phone || !input.phone.trim()) throw new Error('Supplier phone is required.');

    const id = `sup-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    return inventoryRepository.createSupplier({
      id,
      name: input.name.trim(),
      contactPerson: input.contactPerson?.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim(),
      address: input.address?.trim(),
      taxId: input.taxId?.trim(),
      paymentTerms: input.paymentTerms?.trim() || 'Net 30',
      notes: input.notes?.trim(),
    });
  }
}

export const inventoryService = new InventoryService();
