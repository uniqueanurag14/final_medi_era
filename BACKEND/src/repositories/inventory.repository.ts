/**
 * Inventory Repository
 * 
 * Production-ready real database operations for MediEra Medical Inventory & Pharmacy module.
 * No dummy/mock data: strictly queries PostgreSQL / MySQL via dbAdapter.
 */

import { dbAdapter } from '../db/adapter';

export interface DbInventoryItem {
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
  status: string; // 'In Stock', 'Low Stock', 'Critical', 'Out of Stock', 'Expiring Soon'
  createdAt: string;
  updatedAt: string;
}

export interface DbInventoryCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  itemsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbSupplier {
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
  createdAt: string;
  updatedAt: string;
}

export interface DbStockMovement {
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

export interface DbStockAdjustment {
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

export class InventoryRepository {
  /**
   * Helper to ensure tables exist in case migration has not been triggered yet
   */
  private async ensureTables(): Promise<void> {
    try {
      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS inventory_items (
          id VARCHAR(64) PRIMARY KEY,
          organization_id VARCHAR(64),
          branch_id VARCHAR(64),
          name TEXT NOT NULL,
          generic_name TEXT NOT NULL,
          category VARCHAR(64) NOT NULL,
          dosage_form VARCHAR(64) NOT NULL,
          sku VARCHAR(128),
          batch_number VARCHAR(128) NOT NULL,
          expiry_date VARCHAR(32) NOT NULL,
          current_stock INTEGER NOT NULL,
          min_reorder_level INTEGER DEFAULT 10 NOT NULL,
          unit VARCHAR(64) DEFAULT 'Tablets' NOT NULL,
          cost_price NUMERIC(10, 2) NOT NULL,
          selling_price NUMERIC(10, 2) NOT NULL,
          supplier TEXT NOT NULL,
          location VARCHAR(128),
          status VARCHAR(64) DEFAULT 'In Stock' NOT NULL,
          barcode VARCHAR(128),
          category_id VARCHAR(64),
          supplier_id VARCHAR(64),
          max_stock INTEGER DEFAULT 100,
          reorder_level INTEGER DEFAULT 10,
          tax_rate NUMERIC(5, 2) DEFAULT 0.00,
          storage_location VARCHAR(128),
          brand VARCHAR(128),
          description TEXT,
          is_demo BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS inventory_categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          code VARCHAR(64) NOT NULL UNIQUE,
          description TEXT,
          status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS inventory_suppliers (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          contact_person VARCHAR(128),
          phone VARCHAR(64) NOT NULL,
          email VARCHAR(255),
          address TEXT,
          tax_id VARCHAR(64),
          payment_terms VARCHAR(64),
          status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS inventory_stock_movements (
          id VARCHAR(64) PRIMARY KEY,
          reference_number VARCHAR(128) NOT NULL UNIQUE,
          type VARCHAR(32) NOT NULL,
          item_id VARCHAR(64) NOT NULL,
          item_name TEXT NOT NULL,
          sku VARCHAR(128),
          quantity INTEGER NOT NULL,
          previous_stock INTEGER NOT NULL,
          new_stock INTEGER NOT NULL,
          unit_cost NUMERIC(10, 2) NOT NULL,
          total_value NUMERIC(12, 2) NOT NULL,
          batch_number VARCHAR(128),
          expiry_date VARCHAR(32),
          storage_location VARCHAR(128),
          supplier_id VARCHAR(64),
          supplier_name VARCHAR(255),
          reason VARCHAR(64) NOT NULL,
          patient_id VARCHAR(64),
          prescription_id VARCHAR(64),
          notes TEXT,
          user_id VARCHAR(64),
          user_name VARCHAR(128),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      await dbAdapter.query(`
        CREATE TABLE IF NOT EXISTS inventory_adjustments (
          id VARCHAR(64) PRIMARY KEY,
          adjustment_number VARCHAR(128) NOT NULL UNIQUE,
          item_id VARCHAR(64) NOT NULL,
          item_name TEXT NOT NULL,
          sku VARCHAR(128),
          existing_quantity INTEGER NOT NULL,
          adjustment_quantity INTEGER NOT NULL,
          new_quantity INTEGER NOT NULL,
          adjustment_type VARCHAR(64) NOT NULL,
          reason TEXT NOT NULL,
          notes TEXT,
          user_id VARCHAR(64),
          user_name VARCHAR(128),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);
    } catch (err: any) {
      // Quiet fail if already exists
    }
  }

  // --- Inventory Items ---
  public async getItems(params: {
    search?: string;
    category?: string;
    status?: string;
    stockStatus?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: DbInventoryItem[]; total: number }> {
    await this.ensureTables();

    let whereClauses: string[] = [];
    let queryParams: any[] = [];
    let paramIdx = 1;

    if (params.search && params.search.trim()) {
      const q = `%${params.search.trim().toLowerCase()}%`;
      whereClauses.push(
        `(LOWER(name) LIKE $${paramIdx} OR LOWER(generic_name) LIKE $${paramIdx} OR LOWER(COALESCE(sku, '')) LIKE $${paramIdx} OR LOWER(batch_number) LIKE $${paramIdx})`
      );
      queryParams.push(q);
      paramIdx++;
    }

    if (params.category && params.category !== 'all') {
      whereClauses.push(`category = $${paramIdx}`);
      queryParams.push(params.category);
      paramIdx++;
    }

    if (params.status && params.status !== 'all') {
      whereClauses.push(`status = $${paramIdx}`);
      queryParams.push(params.status);
      paramIdx++;
    }

    if (params.stockStatus) {
      if (params.stockStatus === 'OUT_OF_STOCK') {
        whereClauses.push(`current_stock = 0`);
      } else if (params.stockStatus === 'LOW_STOCK') {
        whereClauses.push(`current_stock > 0 AND current_stock <= min_reorder_level`);
      } else if (params.stockStatus === 'IN_STOCK') {
        whereClauses.push(`current_stock > min_reorder_level`);
      }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count query
    const countSql = `SELECT COUNT(*) AS total FROM inventory_items ${whereSql};`;
    const countRes = await dbAdapter.query<{ total: string | number }>(countSql, queryParams);
    const total = Number(countRes.rows[0]?.total || 0);

    // Select query
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const selectSql = `
      SELECT 
        id,
        organization_id AS "organizationId",
        branch_id AS "branchId",
        name,
        generic_name AS "genericName",
        category,
        dosage_form AS "dosageForm",
        sku,
        barcode,
        batch_number AS "batchNumber",
        expiry_date AS "expiryDate",
        current_stock AS "currentStock",
        min_reorder_level AS "minReorderLevel",
        COALESCE(max_stock, 100) AS "maxStock",
        unit,
        cost_price AS "costPrice",
        selling_price AS "sellingPrice",
        COALESCE(tax_rate, 0.00) AS "taxRate",
        supplier,
        supplier_id AS "supplierId",
        COALESCE(storage_location, location, '') AS "storageLocation",
        brand,
        description,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM inventory_items
      ${whereSql}
      ORDER BY name ASC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1};
    `;

    const itemsRes = await dbAdapter.query<DbInventoryItem>(selectSql, [...queryParams, limit, offset]);

    return {
      items: itemsRes.rows.map((r) => ({
        ...r,
        currentStock: Number(r.currentStock || 0),
        minReorderLevel: Number(r.minReorderLevel || 10),
        maxStock: Number(r.maxStock || 100),
        costPrice: Number(r.costPrice || 0),
        sellingPrice: Number(r.sellingPrice || 0),
        taxRate: Number(r.taxRate || 0),
      })),
      total,
    };
  }

  public async getItemById(id: string): Promise<DbInventoryItem | null> {
    await this.ensureTables();
    const sql = `
      SELECT 
        id,
        organization_id AS "organizationId",
        branch_id AS "branchId",
        name,
        generic_name AS "genericName",
        category,
        dosage_form AS "dosageForm",
        sku,
        barcode,
        batch_number AS "batchNumber",
        expiry_date AS "expiryDate",
        current_stock AS "currentStock",
        min_reorder_level AS "minReorderLevel",
        COALESCE(max_stock, 100) AS "maxStock",
        unit,
        cost_price AS "costPrice",
        selling_price AS "sellingPrice",
        COALESCE(tax_rate, 0.00) AS "taxRate",
        supplier,
        supplier_id AS "supplierId",
        COALESCE(storage_location, location, '') AS "storageLocation",
        brand,
        description,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM inventory_items
      WHERE id = $1
      LIMIT 1;
    `;
    const res = await dbAdapter.query<DbInventoryItem>(sql, [id]);
    if (!res.rows[0]) return null;
    const r = res.rows[0];
    return {
      ...r,
      currentStock: Number(r.currentStock || 0),
      minReorderLevel: Number(r.minReorderLevel || 10),
      maxStock: Number(r.maxStock || 100),
      costPrice: Number(r.costPrice || 0),
      sellingPrice: Number(r.sellingPrice || 0),
      taxRate: Number(r.taxRate || 0),
    };
  }

  public async createItem(data: {
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
    maxStock?: number;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    taxRate?: number;
    supplier: string;
    supplierId?: string;
    storageLocation?: string;
    brand?: string;
    description?: string;
    status?: string;
  }): Promise<DbInventoryItem> {
    await this.ensureTables();

    // Determine status
    let status = data.status || 'In Stock';
    if (data.currentStock === 0) {
      status = 'Out of Stock';
    } else if (data.currentStock <= data.minReorderLevel) {
      status = 'Low Stock';
    }

    const sql = `
      INSERT INTO inventory_items (
        id, organization_id, branch_id, name, generic_name, category, dosage_form,
        sku, barcode, batch_number, expiry_date, current_stock, min_reorder_level,
        max_stock, unit, cost_price, selling_price, tax_rate, supplier, supplier_id,
        storage_location, location, brand, description, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20,
        $21, $21, $22, $23, $24, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    let orgId = data.organizationId;
    let branchId = data.branchId;
    if (!orgId) {
      const orgRes = await dbAdapter.query<{ id: string }>('SELECT id FROM organizations LIMIT 1;');
      orgId = orgRes.rows[0]?.id || 'org-mediera-01';
    }
    if (!branchId) {
      const brRes = await dbAdapter.query<{ id: string }>('SELECT id FROM branches WHERE organization_id = $1 LIMIT 1;', [orgId]);
      branchId = brRes.rows[0]?.id || 'br-main-01';
    }

    const params = [
      data.id,
      orgId,
      branchId,
      data.name.trim(),
      (data.genericName || data.name).trim(),
      data.category,
      data.dosageForm || 'Tablets',
      data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      data.barcode || '',
      data.batchNumber.trim(),
      data.expiryDate,
      data.currentStock,
      data.minReorderLevel || 10,
      data.maxStock || 100,
      data.unit || 'Tablets',
      data.costPrice,
      data.sellingPrice,
      data.taxRate || 0.0,
      data.supplier.trim(),
      data.supplierId || null,
      data.storageLocation || 'Main Pharmacy Rack A1',
      data.brand || '',
      data.description || '',
      status,
    ];

    await dbAdapter.query(sql, params);
    const created = await this.getItemById(data.id);
    return created!;
  }

  public async updateItem(id: string, updates: Partial<DbInventoryItem>): Promise<DbInventoryItem | null> {
    await this.ensureTables();
    const existing = await this.getItemById(id);
    if (!existing) return null;

    const currentStock = updates.currentStock !== undefined ? Number(updates.currentStock) : existing.currentStock;
    const minReorderLevel = updates.minReorderLevel !== undefined ? Number(updates.minReorderLevel) : existing.minReorderLevel;

    let status = updates.status || existing.status;
    if (currentStock === 0) {
      status = 'Out of Stock';
    } else if (currentStock <= minReorderLevel) {
      status = 'Low Stock';
    } else if (status === 'Out of Stock' || status === 'Low Stock') {
      status = 'In Stock';
    }

    const sql = `
      UPDATE inventory_items
      SET
        name = COALESCE($2, name),
        generic_name = COALESCE($3, generic_name),
        category = COALESCE($4, category),
        dosage_form = COALESCE($5, dosage_form),
        sku = COALESCE($6, sku),
        barcode = COALESCE($7, barcode),
        batch_number = COALESCE($8, batch_number),
        expiry_date = COALESCE($9, expiry_date),
        current_stock = $10,
        min_reorder_level = $11,
        max_stock = COALESCE($12, max_stock),
        unit = COALESCE($13, unit),
        cost_price = COALESCE($14, cost_price),
        selling_price = COALESCE($15, selling_price),
        tax_rate = COALESCE($16, tax_rate),
        supplier = COALESCE($17, supplier),
        storage_location = COALESCE($18, storage_location),
        brand = COALESCE($19, brand),
        description = COALESCE($20, description),
        status = $21,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;

    const params = [
      id,
      updates.name,
      updates.genericName,
      updates.category,
      updates.dosageForm,
      updates.sku,
      updates.barcode,
      updates.batchNumber,
      updates.expiryDate,
      currentStock,
      minReorderLevel,
      updates.maxStock,
      updates.unit,
      updates.costPrice,
      updates.sellingPrice,
      updates.taxRate,
      updates.supplier,
      updates.storageLocation,
      updates.brand,
      updates.description,
      status,
    ];

    await dbAdapter.query(sql, params);
    return this.getItemById(id);
  }

  public async deleteItem(id: string): Promise<boolean> {
    await this.ensureTables();
    const res = await dbAdapter.query(`DELETE FROM inventory_items WHERE id = $1;`, [id]);
    return (res.rowCount || 0) > 0;
  }

  // --- Stock Movements & Ledger ---
  public async createMovement(data: {
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
  }): Promise<DbStockMovement> {
    await this.ensureTables();

    const sql = `
      INSERT INTO inventory_stock_movements (
        id, reference_number, type, item_id, item_name, sku, quantity,
        previous_stock, new_stock, unit_cost, total_value, batch_number,
        expiry_date, storage_location, supplier_id, supplier_name, reason,
        patient_id, prescription_id, notes, user_id, user_name, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    const params = [
      data.id,
      data.referenceNumber,
      data.type,
      data.itemId,
      data.itemName,
      data.sku || null,
      data.quantity,
      data.previousStock,
      data.newStock,
      data.unitCost,
      data.totalValue,
      data.batchNumber || null,
      data.expiryDate || null,
      data.storageLocation || null,
      data.supplierId || null,
      data.supplierName || null,
      data.reason,
      data.patientId || null,
      data.prescriptionId || null,
      data.notes || null,
      data.userId || null,
      data.userName || 'Clinic Staff',
    ];

    await dbAdapter.query(sql, params);

    return {
      ...data,
      createdAt: new Date().toISOString(),
    };
  }

  public async getMovements(params?: {
    itemId?: string;
    type?: string;
    limit?: number;
  }): Promise<DbStockMovement[]> {
    await this.ensureTables();

    let where: string[] = [];
    let queryParams: any[] = [];
    let idx = 1;

    if (params?.itemId) {
      where.push(`item_id = $${idx}`);
      queryParams.push(params.itemId);
      idx++;
    }

    if (params?.type && params.type !== 'all') {
      where.push(`type = $${idx}`);
      queryParams.push(params.type);
      idx++;
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const limit = params?.limit || 100;

    const sql = `
      SELECT 
        id,
        reference_number AS "referenceNumber",
        type,
        item_id AS "itemId",
        item_name AS "itemName",
        sku,
        quantity,
        previous_stock AS "previousStock",
        new_stock AS "newStock",
        unit_cost AS "unitCost",
        total_value AS "totalValue",
        batch_number AS "batchNumber",
        expiry_date AS "expiryDate",
        storage_location AS "storageLocation",
        supplier_id AS "supplierId",
        supplier_name AS "supplierName",
        reason,
        patient_id AS "patientId",
        prescription_id AS "prescriptionId",
        notes,
        user_id AS "userId",
        user_name AS "userName",
        created_at AS "createdAt"
      FROM inventory_stock_movements
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${idx};
    `;

    const res = await dbAdapter.query<DbStockMovement>(sql, [...queryParams, limit]);
    return res.rows.map((r) => ({
      ...r,
      quantity: Number(r.quantity),
      previousStock: Number(r.previousStock),
      newStock: Number(r.newStock),
      unitCost: Number(r.unitCost),
      totalValue: Number(r.totalValue),
    }));
  }

  // --- Stock Adjustments ---
  public async createAdjustment(data: {
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
  }): Promise<DbStockAdjustment> {
    await this.ensureTables();

    const sql = `
      INSERT INTO inventory_adjustments (
        id, adjustment_number, item_id, item_name, sku,
        existing_quantity, adjustment_quantity, new_quantity,
        adjustment_type, reason, notes, user_id, user_name, created_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11, $12, $13, CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    const params = [
      data.id,
      data.adjustmentNumber,
      data.itemId,
      data.itemName,
      data.sku || null,
      data.existingQuantity,
      data.adjustmentQuantity,
      data.newQuantity,
      data.adjustmentType,
      data.reason,
      data.notes || null,
      data.userId || null,
      data.userName || 'Inventory Controller',
    ];

    await dbAdapter.query(sql, params);

    return {
      ...data,
      createdAt: new Date().toISOString(),
    };
  }

  public async getAdjustments(limit: number = 50): Promise<DbStockAdjustment[]> {
    await this.ensureTables();

    const sql = `
      SELECT
        id,
        adjustment_number AS "adjustmentNumber",
        item_id AS "itemId",
        item_name AS "itemName",
        sku,
        existing_quantity AS "existingQuantity",
        adjustment_quantity AS "adjustmentQuantity",
        new_quantity AS "newQuantity",
        adjustment_type AS "adjustmentType",
        reason,
        notes,
        user_id AS "userId",
        user_name AS "userName",
        created_at AS "createdAt"
      FROM inventory_adjustments
      ORDER BY created_at DESC
      LIMIT $1;
    `;

    const res = await dbAdapter.query<DbStockAdjustment>(sql, [limit]);
    return res.rows.map((r) => ({
      ...r,
      existingQuantity: Number(r.existingQuantity),
      adjustmentQuantity: Number(r.adjustmentQuantity),
      newQuantity: Number(r.newQuantity),
    }));
  }

  // --- Categories ---
  public async getCategories(): Promise<DbInventoryCategory[]> {
    await this.ensureTables();

    const sql = `
      SELECT 
        c.id,
        c.name,
        c.code,
        c.description,
        c.status,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        COALESCE(COUNT(i.id), 0) AS "itemsCount"
      FROM inventory_categories c
      LEFT JOIN inventory_items i ON (i.category_id = c.id OR i.category = c.name)
      GROUP BY c.id, c.name, c.code, c.description, c.status, c.created_at, c.updated_at
      ORDER BY c.name ASC;
    `;

    const res = await dbAdapter.query<DbInventoryCategory>(sql);
    return res.rows.map((r) => ({
      ...r,
      itemsCount: Number(r.itemsCount || 0),
    }));
  }

  public async createCategory(data: {
    id: string;
    name: string;
    code: string;
    description?: string;
    status?: string;
  }): Promise<DbInventoryCategory> {
    await this.ensureTables();

    const sql = `
      INSERT INTO inventory_categories (id, name, code, description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    await dbAdapter.query(sql, [
      data.id,
      data.name.trim(),
      data.code.trim().toUpperCase(),
      data.description || '',
      data.status || 'ACTIVE',
    ]);

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      description: data.description,
      status: data.status || 'ACTIVE',
      itemsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // --- Suppliers ---
  public async getSuppliers(): Promise<DbSupplier[]> {
    await this.ensureTables();

    const sql = `
      SELECT 
        s.id,
        s.name,
        s.contact_person AS "contactPerson",
        s.phone,
        s.email,
        s.address,
        s.tax_id AS "taxId",
        s.payment_terms AS "paymentTerms",
        s.status,
        s.notes,
        s.created_at AS "createdAt",
        s.updated_at AS "updatedAt",
        COALESCE(COUNT(i.id), 0) AS "itemsCount"
      FROM inventory_suppliers s
      LEFT JOIN inventory_items i ON (i.supplier_id = s.id OR i.supplier = s.name)
      GROUP BY s.id, s.name, s.contact_person, s.phone, s.email, s.address, s.tax_id, s.payment_terms, s.status, s.notes, s.created_at, s.updated_at
      ORDER BY s.name ASC;
    `;

    const res = await dbAdapter.query<DbSupplier>(sql);
    return res.rows.map((r) => ({
      ...r,
      itemsCount: Number(r.itemsCount || 0),
    }));
  }

  public async createSupplier(data: {
    id: string;
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
    taxId?: string;
    paymentTerms?: string;
    notes?: string;
    status?: string;
  }): Promise<DbSupplier> {
    await this.ensureTables();

    const sql = `
      INSERT INTO inventory_suppliers (
        id, name, contact_person, phone, email, address,
        tax_id, payment_terms, notes, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *;
    `;

    await dbAdapter.query(sql, [
      data.id,
      data.name.trim(),
      data.contactPerson || '',
      data.phone.trim(),
      data.email || '',
      data.address || '',
      data.taxId || '',
      data.paymentTerms || 'Net 30',
      data.notes || '',
      data.status || 'ACTIVE',
    ]);

    return {
      id: data.id,
      name: data.name,
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      address: data.address,
      taxId: data.taxId,
      paymentTerms: data.paymentTerms || 'Net 30',
      status: data.status || 'ACTIVE',
      notes: data.notes,
      itemsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // --- Real Inventory Dashboard Metrics ---
  public async getDashboardMetrics(): Promise<{
    totalItems: number;
    totalStockQty: number;
    totalInventoryValue: number;
    totalRetailValue: number;
    unrealizedGrossProfit: number;
    lowStockItems: number;
    outOfStockItems: number;
    stockInToday: number;
    stockOutToday: number;
    recentMovements: DbStockMovement[];
    lowStockList: DbInventoryItem[];
    categoryValuation: Array<{
      category: string;
      itemsCount: number;
      stockQty: number;
      totalValue: number;
    }>;
  }> {
    await this.ensureTables();

    // 1. Overall Aggregates from DB
    const aggSql = `
      SELECT 
        COUNT(*) AS total_items,
        COALESCE(SUM(current_stock), 0) AS total_stock_qty,
        COALESCE(SUM(current_stock * cost_price), 0) AS total_inventory_value,
        COALESCE(SUM(current_stock * selling_price), 0) AS total_retail_value,
        COUNT(CASE WHEN current_stock = 0 THEN 1 END) AS out_of_stock_count,
        COUNT(CASE WHEN current_stock > 0 AND current_stock <= min_reorder_level THEN 1 END) AS low_stock_count
      FROM inventory_items;
    `;

    const aggRes = await dbAdapter.query<any>(aggSql);
    const agg = aggRes.rows[0] || {};

    const totalItems = Number(agg.total_items || 0);
    const totalStockQty = Number(agg.total_stock_qty || 0);
    const totalInventoryValue = Number(agg.total_inventory_value || 0);
    const totalRetailValue = Number(agg.total_retail_value || 0);
    const unrealizedGrossProfit = Math.max(0, totalRetailValue - totalInventoryValue);
    const lowStockItems = Number(agg.low_stock_count || 0);
    const outOfStockItems = Number(agg.out_of_stock_count || 0);

    // 2. Today's Movements
    let stockInToday = 0;
    let stockOutToday = 0;
    try {
      const todayMoves = await dbAdapter.query<any>(`
        SELECT 
          type,
          COALESCE(SUM(quantity), 0) AS total_qty
        FROM inventory_stock_movements
        WHERE created_at >= CURRENT_DATE
        GROUP BY type;
      `);
      todayMoves.rows.forEach((r) => {
        if (r.type === 'STOCK_IN') stockInToday = Number(r.total_qty || 0);
        if (r.type === 'STOCK_OUT') stockOutToday = Number(r.total_qty || 0);
      });
    } catch {}

    // 3. Category Breakdown
    const catSql = `
      SELECT 
        category,
        COUNT(*) AS items_count,
        COALESCE(SUM(current_stock), 0) AS stock_qty,
        COALESCE(SUM(current_stock * cost_price), 0) AS total_value
      FROM inventory_items
      GROUP BY category
      ORDER BY total_value DESC;
    `;
    const catRes = await dbAdapter.query<any>(catSql);
    const categoryValuation = catRes.rows.map((c) => ({
      category: c.category,
      itemsCount: Number(c.items_count || 0),
      stockQty: Number(c.stock_qty || 0),
      totalValue: Number(c.total_value || 0),
    }));

    // 4. Low stock list
    const lowStockSql = `
      SELECT 
        id, name, generic_name AS "genericName", category, sku,
        batch_number AS "batchNumber", expiry_date AS "expiryDate",
        current_stock AS "currentStock", min_reorder_level AS "minReorderLevel",
        unit, cost_price AS "costPrice", selling_price AS "sellingPrice",
        supplier, status
      FROM inventory_items
      WHERE current_stock <= min_reorder_level
      ORDER BY current_stock ASC
      LIMIT 10;
    `;
    const lowRes = await dbAdapter.query<any>(lowStockSql);
    const lowStockList = lowRes.rows.map((r) => ({
      ...r,
      currentStock: Number(r.currentStock),
      minReorderLevel: Number(r.minReorderLevel),
      costPrice: Number(r.costPrice),
      sellingPrice: Number(r.sellingPrice),
    }));

    // 5. Recent Movements
    const recentMovements = await this.getMovements({ limit: 10 });

    return {
      totalItems,
      totalStockQty,
      totalInventoryValue,
      totalRetailValue,
      unrealizedGrossProfit,
      lowStockItems,
      outOfStockItems,
      stockInToday,
      stockOutToday,
      recentMovements,
      lowStockList,
      categoryValuation,
    };
  }
}

export const inventoryRepository = new InventoryRepository();
