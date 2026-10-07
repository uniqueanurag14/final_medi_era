-- Migration: 006_inventory_module.sql
-- Description: Centralized Medical Inventory, Pharmacy Stock Ledger, Batches, Suppliers and Adjustments

-- 1. Inventory Categories (Medical Specialties, Formulary Classes, Surgical Supplies)
CREATE TABLE IF NOT EXISTS inventory_categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(32) DEFAULT 'ACTIVE' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Medical & Pharmaceutical Suppliers
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

-- 3. Ensure Core Inventory Items Table Exists and has Extended Columns
CREATE TABLE IF NOT EXISTS inventory_items (
  id VARCHAR(64) PRIMARY KEY,
  organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
  branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE CASCADE,
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
  is_demo BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Safe Column Extensions on inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS barcode VARCHAR(128);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS category_id VARCHAR(64);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS supplier_id VARCHAR(64);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS max_stock INTEGER DEFAULT 100;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 0.00;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS storage_location VARCHAR(128);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS brand VARCHAR(128);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. Stock Movements (Audit Ledger for Receipts, Dispensing, Transfers, Discards)
CREATE TABLE IF NOT EXISTS inventory_stock_movements (
  id VARCHAR(64) PRIMARY KEY,
  reference_number VARCHAR(128) NOT NULL UNIQUE,
  type VARCHAR(32) NOT NULL, -- 'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'
  item_id VARCHAR(64) NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
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
  reason VARCHAR(64) NOT NULL, -- 'GOODS_RECEIPT', 'PATIENT_DISPENSED', 'PROCEDURE_USE', 'DEPARTMENT_TRANSFER', 'EXPIRED_DISCARD', 'DAMAGED', 'STOCK_CORRECTION', 'OTHER'
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE SET NULL,
  prescription_id VARCHAR(64) REFERENCES prescriptions(id) ON DELETE SET NULL,
  notes TEXT,
  user_id VARCHAR(64),
  user_name VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Stock Adjustments (Audit Trail for Physical Counts, Losses, Expiries)
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id VARCHAR(64) PRIMARY KEY,
  adjustment_number VARCHAR(128) NOT NULL UNIQUE,
  item_id VARCHAR(64) NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  sku VARCHAR(128),
  existing_quantity INTEGER NOT NULL,
  adjustment_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  adjustment_type VARCHAR(64) NOT NULL, -- 'INCREASE', 'DECREASE', 'DAMAGED', 'LOST', 'EXPIRED', 'PHYSICAL_CORRECTION'
  reason TEXT NOT NULL,
  notes TEXT,
  user_id VARCHAR(64),
  user_name VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Purchase Orders
CREATE TABLE IF NOT EXISTS inventory_purchase_orders (
  id VARCHAR(64) PRIMARY KEY,
  po_number VARCHAR(128) NOT NULL UNIQUE,
  supplier_id VARCHAR(64) REFERENCES inventory_suppliers(id) ON DELETE SET NULL,
  supplier_name VARCHAR(255) NOT NULL,
  order_date VARCHAR(32) NOT NULL,
  expected_delivery_date VARCHAR(32),
  subtotal NUMERIC(12, 2) NOT NULL,
  tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  discount_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(32) DEFAULT 'DRAFT' NOT NULL,
  notes TEXT,
  created_by VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_purchase_order_items (
  id VARCHAR(64) PRIMARY KEY,
  po_id VARCHAR(64) NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  item_id VARCHAR(64) REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  sku VARCHAR(128),
  quantity INTEGER NOT NULL,
  received_quantity INTEGER DEFAULT 0 NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL,
  total_cost NUMERIC(12, 2) NOT NULL
);

-- 7. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_name ON inventory_items(name);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_batch ON inventory_items(batch_number);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry ON inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_item ON inventory_stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_stock_movements(type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_adjustments_item ON inventory_adjustments(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_po_supplier ON inventory_purchase_orders(supplier_id);
