import React, { useState, useEffect, useMemo } from 'react';
import { inventoryApi } from '../../api/inventory.api';
import {
  MedicalInventoryItem,
  InventoryCategory,
  InventorySupplier,
  StockMovement,
  StockAdjustment,
  InventoryDashboardMetrics,
} from '../../types/inventory';
import {
  Boxes,
  Package,
  Layers,
  Search,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Trash2,
  Edit2,
  Eye,
  X,
  Filter,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  Pill,
  Sparkles,
} from 'lucide-react';

interface AdminInventoryPageProps {
  onNavigate?: (view: string) => void;
  initialTab?: 'dashboard' | 'items' | 'movements' | 'adjustments' | 'suppliers';
}

type TabType = 'dashboard' | 'items' | 'movements' | 'adjustments' | 'suppliers';

export const AdminInventoryPage: React.FC<AdminInventoryPageProps> = ({
  onNavigate,
  initialTab = 'dashboard',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  // Data states
  const [metrics, setMetrics] = useState<InventoryDashboardMetrics | null>(null);
  const [items, setItems] = useState<MedicalInventoryItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

  // Loading & refresh states
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters for items
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [isViewItemModalOpen, setIsViewItemModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // Active item in action
  const [selectedItem, setSelectedItem] = useState<MedicalInventoryItem | null>(null);

  // Form states: New/Edit Item
  const [itemFormData, setItemFormData] = useState({
    name: '',
    genericName: '',
    category: 'Pharmaceuticals',
    dosageForm: 'Tablets',
    sku: '',
    barcode: '',
    batchNumber: '',
    expiryDate: '',
    currentStock: 0,
    minReorderLevel: 10,
    maxStock: 100,
    unit: 'Tablets',
    costPrice: 0,
    sellingPrice: 0,
    taxRate: 0,
    supplier: '',
    storageLocation: 'Pharmacy Rack A1',
    brand: '',
    description: '',
  });

  // Form states: Stock In
  const [stockInForm, setStockInForm] = useState({
    quantity: 10,
    unitCost: 0,
    batchNumber: '',
    expiryDate: '',
    storageLocation: 'Pharmacy Rack A1',
    supplierName: '',
    invoiceNumber: '',
    reason: 'GOODS_RECEIPT',
    notes: '',
  });

  // Form states: Stock Out
  const [stockOutForm, setStockOutForm] = useState({
    quantity: 1,
    reason: 'PATIENT_DISPENSED',
    patientId: '',
    prescriptionId: '',
    notes: '',
  });

  // Form states: Adjustment
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustmentType: 'PHYSICAL_CORRECTION',
    adjustmentQuantity: 0,
    reason: 'Physical Stock Count Reconciliation',
    notes: '',
  });

  // Form states: New Supplier
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    taxId: '',
    paymentTerms: 'Net 30',
    notes: '',
  });

  // Form states: New Category
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Auto-clear success toast after 4s
  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  // Load all primary data from backend API
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setErrorMessage(null);

    try {
      const [dashRes, itemsRes, catRes, supRes, moveRes, adjRes] = await Promise.allSettled([
        inventoryApi.getDashboardMetrics(),
        inventoryApi.getItems({ search: searchQuery, category: selectedCategory !== 'all' ? selectedCategory : undefined }),
        inventoryApi.getCategories(),
        inventoryApi.getSuppliers(),
        inventoryApi.getMovements({ limit: 50 }),
        inventoryApi.getAdjustments(50),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.success && dashRes.value.data) {
        setMetrics(dashRes.value.data);
      }
      if (itemsRes.status === 'fulfilled' && itemsRes.value.success && itemsRes.value.data) {
        setItems(itemsRes.value.data);
        setTotalItems((itemsRes.value as any).meta?.total || itemsRes.value.data.length);
      }
      if (catRes.status === 'fulfilled' && catRes.value.success && catRes.value.data) {
        setCategories(catRes.value.data);
      }
      if (supRes.status === 'fulfilled' && supRes.value.success && supRes.value.data) {
        setSuppliers(supRes.value.data);
      }
      if (moveRes.status === 'fulfilled' && moveRes.value.success && moveRes.value.data) {
        setMovements(moveRes.value.data);
      }
      if (adjRes.status === 'fulfilled' && adjRes.value.success && adjRes.value.data) {
        setAdjustments(adjRes.value.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with MediEra inventory database API.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  // Filter items in client if stock status filter selected
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedStockStatus === 'LOW_STOCK') {
        return item.currentStock > 0 && item.currentStock <= item.minReorderLevel;
      }
      if (selectedStockStatus === 'OUT_OF_STOCK') {
        return item.currentStock === 0;
      }
      if (selectedStockStatus === 'IN_STOCK') {
        return item.currentStock > item.minReorderLevel;
      }
      return true;
    });
  }, [items, selectedStockStatus]);

  // Handlers for Add Item Modal
  const openCreateModal = () => {
    setItemFormData({
      name: '',
      genericName: '',
      category: categories[0]?.name || 'Pharmaceuticals',
      dosageForm: 'Tablets',
      sku: `MED-${Date.now().toString().slice(-6)}`,
      barcode: '',
      batchNumber: `BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currentStock: 50,
      minReorderLevel: 15,
      maxStock: 200,
      unit: 'Tablets',
      costPrice: 5.0,
      sellingPrice: 10.0,
      taxRate: 5.0,
      supplier: suppliers[0]?.name || 'PharmaCorp Global Supply',
      storageLocation: 'Pharmacy Rack A1',
      brand: '',
      description: '',
    });
    setIsAddItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name.trim()) {
      alert('Please enter medicine / item name.');
      return;
    }
    if (!itemFormData.batchNumber.trim()) {
      alert('Batch number is required for medical inventory.');
      return;
    }
    if (!itemFormData.expiryDate) {
      alert('Expiry date is mandatory.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryApi.createItem(itemFormData);
      if (res.success) {
        setSuccessToast(`Medicine "${itemFormData.name}" added to formulary successfully.`);
        setIsAddItemModalOpen(false);
        loadData(true);
      } else {
        alert(res.error?.message || 'Failed to save item.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error saving item.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Edit Item Modal
  const openEditModal = (item: MedicalInventoryItem) => {
    setSelectedItem(item);
    setItemFormData({
      name: item.name,
      genericName: item.genericName,
      category: item.category,
      dosageForm: item.dosageForm || 'Tablets',
      sku: item.sku || '',
      barcode: item.barcode || '',
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      currentStock: item.currentStock,
      minReorderLevel: item.minReorderLevel,
      maxStock: item.maxStock,
      unit: item.unit,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      taxRate: item.taxRate,
      supplier: item.supplier,
      storageLocation: item.storageLocation || 'Pharmacy Rack A1',
      brand: item.brand || '',
      description: item.description || '',
    });
    setIsEditItemModalOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      const res = await inventoryApi.updateItem(selectedItem.id, itemFormData);
      if (res.success) {
        setSuccessToast(`Medicine "${itemFormData.name}" updated successfully.`);
        setIsEditItemModalOpen(false);
        setSelectedItem(null);
        loadData(true);
      } else {
        alert(res.error?.message || 'Failed to update item.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error updating item.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Delete Item
  const handleDeleteItem = async (item: MedicalInventoryItem) => {
    if (!window.confirm(`Are you sure you want to remove "${item.name}" from inventory?`)) {
      return;
    }

    try {
      const res = await inventoryApi.deleteItem(item.id);
      if (res.success) {
        setSuccessToast(`Item "${item.name}" removed successfully.`);
        loadData(true);
      } else {
        alert(res.error?.message || 'Failed to delete item.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting item.');
    }
  };

  // Handlers for Quick Stock In Modal
  const openStockInModal = (item: MedicalInventoryItem) => {
    setSelectedItem(item);
    setStockInForm({
      quantity: 20,
      unitCost: item.costPrice,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      storageLocation: item.storageLocation || 'Pharmacy Rack A1',
      supplierName: item.supplier,
      invoiceNumber: `GRN-${Date.now().toString().slice(-6)}`,
      reason: 'GOODS_RECEIPT',
      notes: '',
    });
    setIsStockInModalOpen(true);
  };

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (stockInForm.quantity <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryApi.stockIn({
        itemId: selectedItem.id,
        quantity: Number(stockInForm.quantity),
        unitCost: Number(stockInForm.unitCost),
        batchNumber: stockInForm.batchNumber,
        expiryDate: stockInForm.expiryDate,
        storageLocation: stockInForm.storageLocation,
        supplierName: stockInForm.supplierName,
        invoiceNumber: stockInForm.invoiceNumber,
        reason: stockInForm.reason,
        notes: stockInForm.notes,
      });

      if (res.success) {
        setSuccessToast(`Stock-in recorded. Added ${stockInForm.quantity} ${selectedItem.unit} to "${selectedItem.name}".`);
        setIsStockInModalOpen(false);
        setSelectedItem(null);
        loadData(true);
      } else {
        alert(res.error?.message || 'Failed to record stock in.');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting stock in.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Quick Stock Out Modal
  const openStockOutModal = (item: MedicalInventoryItem) => {
    setSelectedItem(item);
    setStockOutForm({
      quantity: 1,
      reason: 'PATIENT_DISPENSED',
      patientId: '',
      prescriptionId: '',
      notes: '',
    });
    setIsStockOutModalOpen(true);
  };

  const handleStockOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (stockOutForm.quantity <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }
    if (stockOutForm.quantity > selectedItem.currentStock) {
      alert(`Cannot dispense ${stockOutForm.quantity}. Available stock is only ${selectedItem.currentStock}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryApi.stockOut({
        itemId: selectedItem.id,
        quantity: Number(stockOutForm.quantity),
        reason: stockOutForm.reason,
        patientId: stockOutForm.patientId || undefined,
        prescriptionId: stockOutForm.prescriptionId || undefined,
        notes: stockOutForm.notes || undefined,
      });

      if (res.success) {
        setSuccessToast(`Dispensed ${stockOutForm.quantity} ${selectedItem.unit} of "${selectedItem.name}".`);
        setIsStockOutModalOpen(false);
        setSelectedItem(null);
        loadData(true);
      } else {
        alert(res.error?.message || 'Failed to record stock out.');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting stock out.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Stock Adjustment Modal
  const openAdjustmentModal = (item: MedicalInventoryItem) => {
    setSelectedItem(item);
    setAdjustmentForm({
      adjustmentType: 'PHYSICAL_CORRECTION',
      adjustmentQuantity: item.currentStock,
      reason: 'Physical stock count audit',
      notes: '',
    });
    setIsAdjustmentModalOpen(true);
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      const res = await inventoryApi.createAdjustment({
        itemId: selectedItem.id,
        adjustmentType: adjustmentForm.adjustmentType,
        adjustmentQuantity: Number(adjustmentForm.adjustmentQuantity),
        reason: adjustmentForm.reason,
        notes: adjustmentForm.notes,
      });

      if (res.success) {
        setSuccessToast(`Stock adjustment logged for "${selectedItem.name}".`);
        setIsAdjustmentModalOpen(false);
        setSelectedItem(null);
        loadData(true);
      } else {
        alert(res.error?.message || 'Failed to record adjustment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Add Supplier Modal
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.name.trim() || !supplierFormData.phone.trim()) {
      alert('Supplier name and phone are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryApi.createSupplier(supplierFormData);
      if (res.success) {
        setSuccessToast(`Supplier "${supplierFormData.name}" added successfully.`);
        setIsAddSupplierModalOpen(false);
        setSupplierFormData({
          name: '',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          taxId: '',
          paymentTerms: 'Net 30',
          notes: '',
        });
        loadData(true);
      } else {
        alert(res.error?.message || 'Failed to create supplier.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving supplier.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Add Category Modal
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim() || !categoryFormData.code.trim()) {
      alert('Category name and code are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await inventoryApi.createCategory(categoryFormData);
      if (res.success) {
        setSuccessToast(`Category "${categoryFormData.name}" added successfully.`);
        setIsAddCategoryModalOpen(false);
        setCategoryFormData({ name: '', code: '', description: '' });
        loadData(true);
      } else {
        alert(res.error?.message || 'Failed to create category.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="ml-2 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Medical Inventory & Pharmacy Stock
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized formulary management, batch expiry tracking, and live audit ledger
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Medicine / Item</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Dashboard & KPIs</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`px-3.5 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'items'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Formulary & Items ({totalItems})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-3.5 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Stock Ledger & Movements ({movements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('adjustments')}
          className={`px-3.5 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'adjustments'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Stock Adjustments ({adjustments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3.5 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Suppliers & Vendors ({suppliers.length})</span>
        </button>
      </div>

      {/* Loading state indicator */}
      {loading && !refreshing && (
        <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading MediEra Medical Inventory data...</p>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 1: DASHBOARD & KPIS
      ======================================================== */}
      {!loading && activeTab === 'dashboard' && (
        <div className="space-y-5">
          {/* Low Stock Banner Alert */}
          {metrics && metrics.lowStockItems > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong className="font-semibold">{metrics.lowStockItems} item(s)</strong> have reached or fallen below safety reorder threshold.
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedStockStatus('LOW_STOCK');
                  setActiveTab('items');
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                Review Low Stock Items
              </button>
            </div>
          )}

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Catalog SKUs</span>
                <Boxes className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {metrics?.totalItems ?? items.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Total registered formulations</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Units in Stock</span>
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {metrics?.totalStockQty?.toLocaleString() ?? 0}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Available across pharmacy racks</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Inventory Valuation</span>
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                ${metrics?.totalInventoryValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                Retail: ${metrics?.totalRetailValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Stock Alerts</span>
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{metrics?.lowStockItems ?? 0}</span>
                {metrics && metrics.outOfStockItems > 0 && (
                  <span className="text-xs text-rose-600 font-semibold">({metrics.outOfStockItems} out)</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Below minimum threshold</p>
            </div>
          </div>

          {/* Category Breakdown & Recent Movements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Valuation Breakdown */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-teal-600" />
                  Category Breakdown & Valuation
                </h3>
                <button
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
                >
                  + Add Category
                </button>
              </div>

              {metrics?.categoryValuation && metrics.categoryValuation.length > 0 ? (
                <div className="space-y-2.5">
                  {metrics.categoryValuation.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.category}</span>
                        <div className="text-[10px] text-slate-400">{cat.itemsCount} medicines • {cat.stockQty} units</div>
                      </div>
                      <div className="text-right font-bold text-slate-900 dark:text-white">
                        ${cat.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No inventory category valuation records available.
                </div>
              )}
            </div>

            {/* Recent Movement Activity Stream */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Live Stock Ledger Activity
                </h3>
                <button
                  onClick={() => setActiveTab('movements')}
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {movements.length > 0 ? (
                <div className="space-y-2">
                  {movements.slice(0, 5).map((m) => {
                    const isStockIn = m.type === 'STOCK_IN';
                    const isStockOut = m.type === 'STOCK_OUT';
                    return (
                      <div key={m.id} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                              isStockIn
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : isStockOut
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            }`}
                          >
                            {isStockIn ? '+IN' : isStockOut ? '-OUT' : 'ADJ'}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{m.itemName}</div>
                            <div className="text-[10px] text-slate-400">
                              Ref: {m.referenceNumber} • {m.reason.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-bold ${isStockIn ? 'text-emerald-600' : isStockOut ? 'text-slate-800 dark:text-slate-200' : 'text-purple-600'}`}>
                            {isStockIn ? `+${m.quantity}` : isStockOut ? `-${m.quantity}` : `${m.quantity}`} units
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(m.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No stock movements recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: FORMULARY & ITEMS LIST
      ======================================================== */}
      {!loading && activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search medicine name, generic name, batch, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-teal-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStockStatus}
                onChange={(e) => setSelectedStockStatus(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="all">All Stock Levels</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock (Reorder Alert)</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>

              <button
                onClick={openCreateModal}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Items Table */}
          {filteredItems.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Medicine & Formulation</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Batch & Expiry</th>
                      <th className="px-3 py-3 text-right">Current Stock</th>
                      <th className="px-3 py-3 text-right">Pricing (Cost / Sell)</th>
                      <th className="px-3 py-3">Location</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {filteredItems.map((item) => {
                      const isLowStock = item.currentStock > 0 && item.currentStock <= item.minReorderLevel;
                      const isOutOfStock = item.currentStock === 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {item.genericName} • {item.dosageForm} • SKU: {item.sku || 'N/A'}
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                              {item.category}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="font-mono text-[11px]">{item.batchNumber}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Exp: {item.expiryDate}</span>
                            </div>
                          </td>

                          <td className="px-3 py-3 text-right">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {item.currentStock} {item.unit}
                            </div>
                            <div className="text-[10px] text-slate-400">Min: {item.minReorderLevel}</div>
                          </td>

                          <td className="px-3 py-3 text-right">
                            <div className="font-semibold text-slate-900 dark:text-white">${item.sellingPrice.toFixed(2)}</div>
                            <div className="text-[10px] text-slate-400">Cost: ${item.costPrice.toFixed(2)}</div>
                          </td>

                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {item.storageLocation || 'Pharmacy Rack A1'}
                          </td>

                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                                isOutOfStock
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : isLowStock
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                              {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openStockInModal(item)}
                                title="Stock In (Goods Receipt Note)"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md transition-colors cursor-pointer"
                              >
                                <ArrowDownToLine className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openStockOutModal(item)}
                                title="Stock Out (Dispense / Issue)"
                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors cursor-pointer"
                              >
                                <ArrowUpFromLine className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openAdjustmentModal(item)}
                                title="Adjust Stock"
                                className="p-1 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-md transition-colors cursor-pointer"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                title="Edit Item"
                                className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item)}
                                title="Delete Item"
                                className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs">
              <Boxes className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Inventory Items Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {searchQuery
                  ? `No items match the query "${searchQuery}". Clear your search filters to view all entries.`
                  : 'No medicine or clinical consumable records exist in the database yet. Click below to add your first item.'}
              </p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add First Medicine / Item</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: STOCK MOVEMENTS / AUDIT LEDGER
      ======================================================== */}
      {!loading && activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Stock Movements Ledger</h3>
              <p className="text-xs text-slate-500">Every inward receipt, patient dispensing, and audit adjustment is tamper-recorded.</p>
            </div>
          </div>

          {movements.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Timestamp & Reference</th>
                      <th className="px-3 py-3">Movement Type</th>
                      <th className="px-3 py-3">Item & Batch</th>
                      <th className="px-3 py-3 text-right">Quantity</th>
                      <th className="px-3 py-3 text-right">Stock (Prev → New)</th>
                      <th className="px-3 py-3">Reason / Details</th>
                      <th className="px-4 py-3">Handled By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {movements.map((m) => {
                      const isStockIn = m.type === 'STOCK_IN';
                      const isStockOut = m.type === 'STOCK_OUT';
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{m.referenceNumber}</div>
                            <div className="text-[11px] text-slate-400">{new Date(m.createdAt).toLocaleString()}</div>
                          </td>

                          <td className="px-3 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                                isStockIn
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isStockOut
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              }`}
                            >
                              {isStockIn ? '+ STOCK IN' : isStockOut ? '- STOCK OUT' : 'ADJUSTMENT'}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{m.itemName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Batch: {m.batchNumber || 'N/A'} {m.sku ? `• SKU: ${m.sku}` : ''}
                            </div>
                          </td>

                          <td className="px-3 py-3 text-right font-bold">
                            <span className={isStockIn ? 'text-emerald-600' : isStockOut ? 'text-slate-800 dark:text-slate-200' : 'text-purple-600'}>
                              {isStockIn ? `+${m.quantity}` : isStockOut ? `-${m.quantity}` : `${m.quantity}`}
                            </span>
                          </td>

                          <td className="px-3 py-3 text-right text-[11px] font-mono text-slate-500">
                            {m.previousStock} → <strong className="text-slate-900 dark:text-white">{m.newStock}</strong>
                          </td>

                          <td className="px-3 py-3">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{m.reason.replace(/_/g, ' ')}</div>
                            {m.notes && <div className="text-[11px] text-slate-400">{m.notes}</div>}
                          </td>

                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {m.userName || 'System'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs">
              <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Stock Movements Logged</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Stock movements will appear automatically as medicines are received from suppliers, dispensed to patients, or adjusted.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 4: STOCK ADJUSTMENTS
      ======================================================== */}
      {!loading && activeTab === 'adjustments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Physical Count & Stock Adjustments</h3>
              <p className="text-xs text-slate-500">Audit logs for shrinkage, damaged ampoules, expired medicine write-offs, and count updates.</p>
            </div>
          </div>

          {adjustments.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Adjustment Ref</th>
                      <th className="px-3 py-3">Medicine</th>
                      <th className="px-3 py-3">Adjustment Type</th>
                      <th className="px-3 py-3 text-right">Adjustment Delta</th>
                      <th className="px-3 py-3 text-right">New Quantity</th>
                      <th className="px-3 py-3">Reason / Audit Notes</th>
                      <th className="px-4 py-3">Auditor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {adjustments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          <div>{a.adjustmentNumber}</div>
                          <div className="text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleString()}</div>
                        </td>

                        <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                          {a.itemName}
                        </td>

                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {a.adjustmentType.replace(/_/g, ' ')}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-right font-mono font-bold text-purple-600">
                          {a.adjustmentQuantity}
                        </td>

                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {a.newQuantity}
                        </td>

                        <td className="px-3 py-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{a.reason}</div>
                          {a.notes && <div className="text-[11px] text-slate-400">{a.notes}</div>}
                        </td>

                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {a.userName || 'Auditor'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs">
              <SlidersHorizontal className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Adjustments Recorded</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You can adjust any item's physical count using the slider action on the Formulary & Items tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 5: SUPPLIERS & VENDORS
      ======================================================== */}
      {!loading && activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Medical Suppliers & Distributors</h3>
              <p className="text-xs text-slate-500">Authorized pharmaceutical wholesalers, diagnostic reagent vendors, and consumable distributors.</p>
            </div>

            <button
              onClick={() => setIsAddSupplierModalOpen(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Supplier</span>
            </button>
          </div>

          {suppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {suppliers.map((s) => (
                <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{s.name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {s.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div>Contact: <span className="text-slate-800 dark:text-slate-200 font-medium">{s.contactPerson || 'Sales Team'}</span></div>
                    <div>Phone: <span className="text-slate-800 dark:text-slate-200 font-medium">{s.phone}</span></div>
                    {s.email && <div>Email: <span className="text-slate-800 dark:text-slate-200 font-medium">{s.email}</span></div>}
                    {s.paymentTerms && <div>Terms: <span className="text-slate-800 dark:text-slate-200 font-medium">{s.paymentTerms}</span></div>}
                    {s.taxId && <div>Tax ID / GST: <span className="font-mono text-slate-800 dark:text-slate-200">{s.taxId}</span></div>}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Supplying: <strong className="text-teal-600">{s.itemsCount || 0} formulary items</strong></span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-xs">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Suppliers Registered</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Register authorized pharmaceutical distributors to connect stock orders and inward shipments.
              </p>
              <button
                onClick={() => setIsAddSupplierModalOpen(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add First Supplier</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW ITEM / MEDICINE
      ======================================================== */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-xl overflow-hidden my-8">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Medicine / Inventory Item</h3>
                <p className="text-xs text-slate-500">Register new clinical formulation, batch information, and stock thresholds</p>
              </div>
              <button onClick={() => setIsAddItemModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand / Trade Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxicillin 500mg, Paracetamol"
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Generic / Scientific Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin Trihydrate"
                    value={itemFormData.genericName}
                    onChange={(e) => setItemFormData({ ...itemFormData, genericName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Formulary Category</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Pharmaceuticals">Pharmaceuticals (Oral/Topical)</option>
                    <option value="Injections & Vaccines">Injections & Vaccines</option>
                    <option value="Surgical Consumables">Surgical Consumables</option>
                    <option value="Diagnostic Reagents">Diagnostic Reagents</option>
                    <option value="IV Fluids & Infusions">IV Fluids & Infusions</option>
                    <option value="PPE & Hygiene">PPE & Hygiene</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dosage Form & Unit</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={itemFormData.dosageForm}
                      onChange={(e) => setItemFormData({ ...itemFormData, dosageForm: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Tablets">Tablets</option>
                      <option value="Capsules">Capsules</option>
                      <option value="Syrup / Liquid">Syrup / Liquid</option>
                      <option value="Injection Vial">Injection Vial</option>
                      <option value="Ampoule">Ampoule</option>
                      <option value="Ointment / Gel">Ointment / Gel</option>
                      <option value="Kit">Kit</option>
                      <option value="Piece">Piece</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Unit (e.g. Tablets)"
                      value={itemFormData.unit}
                      onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BAT-2026-904"
                    value={itemFormData.batchNumber}
                    onChange={(e) => setItemFormData({ ...itemFormData, batchNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={itemFormData.expiryDate}
                    onChange={(e) => setItemFormData({ ...itemFormData, expiryDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={itemFormData.currentStock}
                    onChange={(e) => setItemFormData({ ...itemFormData, currentStock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Min. Reorder Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={itemFormData.minReorderLevel}
                    onChange={(e) => setItemFormData({ ...itemFormData, minReorderLevel: parseInt(e.target.value, 10) || 10 })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unit Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemFormData.costPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dispensing Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemFormData.sellingPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Primary Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. MedPharma Distribution Ltd"
                    value={itemFormData.supplier}
                    onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Cold Chain Fridge B2, Shelf 3"
                    value={itemFormData.storageLocation}
                    onChange={(e) => setItemFormData({ ...itemFormData, storageLocation: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Add Medicine to Formulary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT ITEM
      ======================================================== */}
      {isEditItemModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-xl overflow-hidden my-8">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Medicine: {selectedItem.name}</h3>
                <p className="text-xs text-slate-500">Update clinical details, pricing, and stock levels</p>
              </div>
              <button onClick={() => setIsEditItemModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Brand / Trade Name *</label>
                  <input
                    type="text"
                    required
                    value={itemFormData.name}
                    onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Generic Name</label>
                  <input
                    type="text"
                    value={itemFormData.genericName}
                    onChange={(e) => setItemFormData({ ...itemFormData, genericName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={itemFormData.batchNumber}
                    onChange={(e) => setItemFormData({ ...itemFormData, batchNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={itemFormData.expiryDate}
                    onChange={(e) => setItemFormData({ ...itemFormData, expiryDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Current Stock ({itemFormData.unit})</label>
                  <input
                    type="number"
                    min="0"
                    value={itemFormData.currentStock}
                    onChange={(e) => setItemFormData({ ...itemFormData, currentStock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reorder Level Alert</label>
                  <input
                    type="number"
                    min="1"
                    value={itemFormData.minReorderLevel}
                    onChange={(e) => setItemFormData({ ...itemFormData, minReorderLevel: parseInt(e.target.value, 10) || 10 })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemFormData.costPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemFormData.sellingPrice}
                    onChange={(e) => setItemFormData({ ...itemFormData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditItemModalOpen(false)}
                  className="px-4 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: QUICK STOCK IN (GRN / GOODS RECEIPT)
      ======================================================== */}
      {isStockInModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Stock In (Goods Receipt Note)</h3>
                <p className="text-xs text-slate-500">{selectedItem.name} • Current: {selectedItem.currentStock} {selectedItem.unit}</p>
              </div>
              <button onClick={() => setIsStockInModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Inward Quantity ({selectedItem.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={stockInForm.quantity}
                  onChange={(e) => setStockInForm({ ...stockInForm, quantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={stockInForm.batchNumber}
                    onChange={(e) => setStockInForm({ ...stockInForm, batchNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={stockInForm.expiryDate}
                    onChange={(e) => setStockInForm({ ...stockInForm, expiryDate: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={stockInForm.unitCost}
                    onChange={(e) => setStockInForm({ ...stockInForm, unitCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">GRN / Invoice Ref</label>
                  <input
                    type="text"
                    value={stockInForm.invoiceNumber}
                    onChange={(e) => setStockInForm({ ...stockInForm, invoiceNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Storage Location</label>
                <input
                  type="text"
                  value={stockInForm.storageLocation}
                  onChange={(e) => setStockInForm({ ...stockInForm, storageLocation: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Recording...' : 'Confirm Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: QUICK STOCK OUT (DISPENSE / ISSUE)
      ======================================================== */}
      {isStockOutModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dispense / Stock Out</h3>
                <p className="text-xs text-slate-500">{selectedItem.name} • Available: {selectedItem.currentStock} {selectedItem.unit}</p>
              </div>
              <button onClick={() => setIsStockOutModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockOutSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quantity to Dispense ({selectedItem.unit}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedItem.currentStock}
                  value={stockOutForm.quantity}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Dispensing Reason *</label>
                <select
                  value={stockOutForm.reason}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PATIENT_DISPENSED">Patient Prescription Dispensing</option>
                  <option value="PROCEDURE_USE">OT / In-Clinic Procedure Use</option>
                  <option value="DEPARTMENT_TRANSFER">Ward / Department Requisition</option>
                  <option value="EXPIRED_DISCARD">Expired Stock Safe Disposal</option>
                  <option value="DAMAGED">Damaged / Broken Vial Write-off</option>
                  <option value="OTHER">Other Clinical Issue</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notes / Prescription Ref</label>
                <textarea
                  rows={2}
                  placeholder="Optional reference notes..."
                  value={stockOutForm.notes}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, notes: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockOutModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Dispensing...' : 'Confirm Stock Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STOCK ADJUSTMENT
      ======================================================== */}
      {isAdjustmentModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adjust Stock Count</h3>
                <p className="text-xs text-slate-500">{selectedItem.name} • Current: {selectedItem.currentStock} {selectedItem.unit}</p>
              </div>
              <button onClick={() => setIsAdjustmentModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Adjustment Action</label>
                <select
                  value={adjustmentForm.adjustmentType}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjustmentType: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PHYSICAL_CORRECTION">Set Actual Physical Count (Reconciliation)</option>
                  <option value="INCREASE">Increase Stock (Found Surplus)</option>
                  <option value="DECREASE">Decrease Stock (Shrinkage / Variance)</option>
                  <option value="DAMAGED">Damaged Ampoules / Broken Packaging</option>
                  <option value="EXPIRED">Expired Batch Write-off</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {adjustmentForm.adjustmentType === 'PHYSICAL_CORRECTION' ? 'Verified Physical Count *' : 'Adjustment Delta Quantity *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjustmentForm.adjustmentQuantity}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjustmentQuantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Audit Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Applying...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD SUPPLIER
      ======================================================== */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register Medical Supplier</h3>
                <p className="text-xs text-slate-500">Authorized wholesaler or medical equipment distributor</p>
              </div>
              <button onClick={() => setIsAddSupplierModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Novartis Distribution Ltd"
                  value={supplierFormData.name}
                  onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Account Manager"
                    value={supplierFormData.contactPerson}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, contactPerson: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 800 555 0199"
                    value={supplierFormData.phone}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@supplier.com"
                    value={supplierFormData.email}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Payment Terms</label>
                  <select
                    value={supplierFormData.paymentTerms}
                    onChange={(e) => setSupplierFormData({ ...supplierFormData, paymentTerms: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Immediate">Immediate / Advance</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD CATEGORY
      ======================================================== */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Formulary Category</h3>
                <p className="text-xs text-slate-500">Group medicines and diagnostic consumables</p>
              </div>
              <button onClick={() => setIsAddCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiovascular & Antihypertensives"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Code / Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CARDIO"
                  value={categoryFormData.code}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Optional description..."
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
