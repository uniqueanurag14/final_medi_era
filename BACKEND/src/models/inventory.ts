export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK' | 'EXPIRING_SOON';

export interface MedicalInventoryItem {
  id: string;
  organizationId?: string;
  branchId?: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  sku?: string;
  barcode?: string;
  batchNumber: string;
  expiryDate: string;
  currentStock: number;
  minReorderLevel: number;
  maxStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  supplier: string;
  supplierId?: string;
  storageLocation?: string;
  brand?: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  itemsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  status: string;
  notes?: string;
  itemsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  referenceNumber: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
  itemId: string;
  itemName: string;
  sku?: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalValue: number;
  batchNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  supplierId?: string;
  supplierName?: string;
  reason: string;
  patientId?: string;
  prescriptionId?: string;
  notes?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  itemId: string;
  itemName: string;
  sku?: string;
  existingQuantity: number;
  adjustmentQuantity: number;
  newQuantity: number;
  adjustmentType: string;
  reason: string;
  notes?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface InventoryDashboardMetrics {
  totalItems: number;
  totalStockQty: number;
  totalInventoryValue: number;
  totalRetailValue: number;
  unrealizedGrossProfit: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockInToday: number;
  stockOutToday: number;
  recentMovements: StockMovement[];
  lowStockList: MedicalInventoryItem[];
  categoryValuation: Array<{
    category: string;
    itemsCount: number;
    stockQty: number;
    totalValue: number;
  }>;
}
