import { apiRequest } from './client';
import {
  MedicalInventoryItem,
  InventoryCategory,
  InventorySupplier,
  StockMovement,
  StockAdjustment,
  InventoryDashboardMetrics,
} from '../types/inventory';

export const inventoryApi = {
  // Dashboard
  async getDashboardMetrics() {
    return apiRequest<InventoryDashboardMetrics>('/api/inventory/dashboard');
  },

  // Items
  async getItems(params?: {
    search?: string;
    category?: string;
    status?: string;
    stockStatus?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.stockStatus) query.set('stockStatus', params.stockStatus);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = `/api/inventory/items${qs ? `?${qs}` : ''}`;
    return apiRequest<MedicalInventoryItem[]>(endpoint);
  },

  async getItemById(id: string) {
    return apiRequest<MedicalInventoryItem>(`/api/inventory/items/${id}`);
  },

  async createItem(data: Partial<MedicalInventoryItem>) {
    return apiRequest<MedicalInventoryItem>('/api/inventory/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateItem(id: string, data: Partial<MedicalInventoryItem>) {
    return apiRequest<MedicalInventoryItem>(`/api/inventory/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteItem(id: string) {
    return apiRequest<{ success: boolean; message: string }>(`/api/inventory/items/${id}`, {
      method: 'DELETE',
    });
  },

  // Stock In
  async stockIn(data: {
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
  }) {
    return apiRequest<{ item: MedicalInventoryItem; movement: StockMovement }>('/api/inventory/stock-in', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Stock Out
  async stockOut(data: {
    itemId: string;
    quantity: number;
    reason: string;
    patientId?: string;
    prescriptionId?: string;
    notes?: string;
  }) {
    return apiRequest<{ item: MedicalInventoryItem; movement: StockMovement }>('/api/inventory/stock-out', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Adjustments
  async createAdjustment(data: {
    itemId: string;
    adjustmentType: string;
    adjustmentQuantity: number;
    reason: string;
    notes?: string;
  }) {
    return apiRequest<{ item: MedicalInventoryItem; adjustment: StockAdjustment }>('/api/inventory/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAdjustments(limit: number = 50) {
    return apiRequest<StockAdjustment[]>(`/api/inventory/adjustments?limit=${limit}`);
  },

  // Movements / Ledger
  async getMovements(params?: { itemId?: string; type?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.itemId) query.set('itemId', params.itemId);
    if (params?.type) query.set('type', params.type);
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return apiRequest<StockMovement[]>(`/api/inventory/movements${qs ? `?${qs}` : ''}`);
  },

  // Categories
  async getCategories() {
    return apiRequest<InventoryCategory[]>('/api/inventory/categories');
  },

  async createCategory(data: { name: string; code: string; description?: string }) {
    return apiRequest<InventoryCategory>('/api/inventory/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Suppliers
  async getSuppliers() {
    return apiRequest<InventorySupplier[]>('/api/inventory/suppliers');
  },

  async createSupplier(data: {
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    notes?: string;
  }) {
    return apiRequest<InventorySupplier>('/api/inventory/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
