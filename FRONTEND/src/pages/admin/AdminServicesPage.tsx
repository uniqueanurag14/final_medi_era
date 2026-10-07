import React, { useState, useMemo } from 'react';
import { dbService } from '../../services/mockDatabase';
import { ServiceItem, HealthPackage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse,
  Search,
  Plus,
  Filter,
  Layers,
  Sparkles,
  Clock,
  DollarSign,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Calendar,
  Download,
  Printer,
  Shield,
  Tag,
  Stethoscope,
  FlaskConical,
  Activity,
  AlertCircle,
  FileText,
  ChevronRight,
  Eye,
  Check,
  Percent
} from 'lucide-react';

interface AdminServicesPageProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal?: (preselectedService?: string) => void;
}

export const AdminServicesPage: React.FC<AdminServicesPageProps> = ({
  onNavigate,
  onOpenBookingModal,
}) => {
  const { hasPermission } = useAuth();
  const canView = hasPermission('service.view');
  const canCreate = hasPermission('service.create');
  const canUpdate = hasPermission('service.update');
  const canDelete = hasPermission('service.delete');

  // State
  const [activeTab, setActiveTab] = useState<'services' | 'packages'>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal states
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<HealthPackage | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form states for Service
  const [serviceFormData, setServiceFormData] = useState<Partial<ServiceItem>>({
    code: '',
    name: '',
    category: 'Consultation',
    departmentName: 'General & Internal Medicine',
    price: 90,
    durationMinutes: 20,
    taxRate: 0,
    description: '',
    preparationInstructions: '',
    assignedDoctorIds: [],
    branchIds: ['branch-01', 'branch-02', 'branch-03'],
    active: true,
  });

  // Form states for Health Package
  const [packageFormData, setPackageFormData] = useState<Partial<HealthPackage>>({
    code: '',
    name: '',
    tagline: '',
    description: '',
    badge: 'Best Value',
    departmentName: 'General & Internal Medicine',
    servicesIncluded: [],
    originalPrice: 300,
    discountedPrice: 199,
    validityDays: 365,
    recommendedFor: '',
    preparationInstructions: '',
    branchIds: ['branch-01', 'branch-02'],
    active: true,
  });

  // Data references
  const services = dbService.services;
  const packages = dbService.packages;
  const specialties = dbService.specialties;
  const doctors = dbService.doctors;
  const branches = dbService.branches;

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      if (selectedCategory !== 'all' && srv.category !== selectedCategory) return false;
      if (selectedDepartment !== 'all' && srv.departmentName !== selectedDepartment) return false;
      if (selectedBranch !== 'all' && srv.branchIds && !srv.branchIds.includes(selectedBranch)) return false;
      if (selectedStatus === 'active' && !srv.active) return false;
      if (selectedStatus === 'inactive' && srv.active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = srv.name.toLowerCase().includes(q);
        const matchesCode = srv.code?.toLowerCase().includes(q);
        const matchesDesc = srv.description.toLowerCase().includes(q);
        const matchesDept = srv.departmentName?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc && !matchesDept) return false;
      }
      return true;
    });
  }, [services, selectedCategory, selectedDepartment, selectedBranch, selectedStatus, searchQuery]);

  // Filtered Packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (selectedDepartment !== 'all' && pkg.departmentName !== selectedDepartment) return false;
      if (selectedBranch !== 'all' && pkg.branchIds && !pkg.branchIds.includes(selectedBranch)) return false;
      if (selectedStatus === 'active' && !pkg.active) return false;
      if (selectedStatus === 'inactive' && pkg.active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = pkg.name.toLowerCase().includes(q);
        const matchesCode = pkg.code?.toLowerCase().includes(q);
        const matchesDesc = pkg.description.toLowerCase().includes(q);
        const matchesTagline = pkg.tagline.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc && !matchesTagline) return false;
      }
      return true;
    });
  }, [packages, selectedDepartment, selectedBranch, selectedStatus, searchQuery]);

  // Quick statistics
  const activeServicesCount = services.filter((s) => s.active).length;
  const avgServiceFee = services.length > 0 ? Math.round(services.reduce((acc, s) => acc + s.price, 0) / services.length) : 0;
  const consultationsCount = services.filter((s) => s.category === 'Consultation').length;
  const diagnosticsCount = services.filter((s) => s.category === 'Diagnostics' || s.category === 'Lab').length;
  const avgPackageDiscount = packages.length > 0
    ? Math.round(packages.reduce((acc, p) => acc + ((p.originalPrice - p.discountedPrice) / p.originalPrice) * 100, 0) / packages.length)
    : 0;

  // Handlers for Services
  const handleOpenAddService = () => {
    const nextCodeNum = services.length + 1;
    const autoCode = `SRV-${nextCodeNum < 10 ? '0' : ''}${nextCodeNum}`;
    setEditingService(null);
    setServiceFormData({
      code: autoCode,
      name: '',
      category: 'Consultation',
      departmentName: 'General & Internal Medicine',
      price: 100,
      durationMinutes: 20,
      taxRate: 0,
      description: '',
      preparationInstructions: '',
      assignedDoctorIds: [],
      branchIds: ['branch-01', 'branch-02', 'branch-03'],
      active: true,
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceItem) => {
    setEditingService(srv);
    setServiceFormData({ ...srv });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name || !serviceFormData.price) {
      showNotification('Please enter a valid service name and standard price.', 'error');
      return;
    }

    if (editingService) {
      dbService.updateServiceItem(editingService.id, serviceFormData);
      showNotification(`Service "${serviceFormData.name}" updated successfully.`);
    } else {
      dbService.addServiceItem({
        organizationId: 'org-01',
        name: serviceFormData.name || 'New Service',
        code: serviceFormData.code || `SRV-${Date.now().toString().slice(-3)}`,
        category: serviceFormData.category || 'Consultation',
        departmentName: serviceFormData.departmentName,
        departmentId: specialties.find((s) => s.name === serviceFormData.departmentName)?.id,
        price: Number(serviceFormData.price) || 0,
        durationMinutes: Number(serviceFormData.durationMinutes) || 15,
        taxRate: Number(serviceFormData.taxRate) || 0,
        description: serviceFormData.description || '',
        preparationInstructions: serviceFormData.preparationInstructions || '',
        assignedDoctorIds: serviceFormData.assignedDoctorIds || [],
        branchIds: serviceFormData.branchIds || ['branch-01'],
        active: serviceFormData.active ?? true,
      });
      showNotification(`Medical service "${serviceFormData.name}" added to catalog.`);
    }

    setIsServiceModalOpen(false);
  };

  const handleToggleServiceActive = (srv: ServiceItem) => {
    if (!canUpdate) return;
    dbService.updateServiceItem(srv.id, { active: !srv.active });
    showNotification(`Service "${srv.name}" marked ${!srv.active ? 'Active' : 'Inactive'}.`);
  };

  const handleDeleteService = (srv: ServiceItem) => {
    if (!canDelete) return;
    if (window.confirm(`Are you sure you want to deactivate or remove "${srv.name}" (${srv.code}) from the clinical catalog?`)) {
      dbService.deleteServiceItem(srv.id);
      showNotification(`Service "${srv.name}" deactivated.`);
    }
  };

  // Handlers for Packages
  const handleOpenAddPackage = () => {
    const nextCodeNum = packages.length + 1;
    const autoCode = `PKG-${nextCodeNum < 10 ? '0' : ''}${nextCodeNum}`;
    setEditingPackage(null);
    setPackageFormData({
      code: autoCode,
      name: '',
      tagline: '',
      description: '',
      badge: 'Specialized',
      departmentName: 'General & Internal Medicine',
      servicesIncluded: [],
      originalPrice: 350,
      discountedPrice: 220,
      validityDays: 365,
      recommendedFor: 'Adults seeking comprehensive preventative health screening.',
      preparationInstructions: 'Fasting 10-12 hours prior to lab investigation.',
      branchIds: ['branch-01', 'branch-02'],
      active: true,
    });
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: HealthPackage) => {
    setEditingPackage(pkg);
    setPackageFormData({ ...pkg });
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageFormData.name || !packageFormData.discountedPrice) {
      showNotification('Please enter a package name and bundle price.', 'error');
      return;
    }

    if (editingPackage) {
      dbService.updateHealthPackage(editingPackage.id, packageFormData);
      showNotification(`Package "${packageFormData.name}" updated successfully.`);
    } else {
      dbService.addHealthPackage({
        name: packageFormData.name || 'New Package',
        code: packageFormData.code || `PKG-${Date.now().toString().slice(-3)}`,
        tagline: packageFormData.tagline || '',
        description: packageFormData.description || '',
        badge: packageFormData.badge,
        departmentName: packageFormData.departmentName,
        servicesIncluded: packageFormData.servicesIncluded || [],
        originalPrice: Number(packageFormData.originalPrice) || 0,
        discountedPrice: Number(packageFormData.discountedPrice) || 0,
        validityDays: Number(packageFormData.validityDays) || 365,
        recommendedFor: packageFormData.recommendedFor || '',
        preparationInstructions: packageFormData.preparationInstructions || '',
        branchIds: packageFormData.branchIds || ['branch-01'],
        active: packageFormData.active ?? true,
      });
      showNotification(`Health package "${packageFormData.name}" created.`);
    }

    setIsPackageModalOpen(false);
  };

  const handleTogglePackageActive = (pkg: HealthPackage) => {
    if (!canUpdate) return;
    dbService.updateHealthPackage(pkg.id, { active: !pkg.active });
    showNotification(`Package "${pkg.name}" marked ${!pkg.active ? 'Active' : 'Inactive'}.`);
  };

  const handleDeletePackage = (pkg: HealthPackage) => {
    if (!canDelete) return;
    if (window.confirm(`Are you sure you want to remove health package "${pkg.name}"?`)) {
      dbService.deleteHealthPackage(pkg.id);
      showNotification(`Package "${pkg.name}" deactivated.`);
    }
  };

  // Toggle included service in package creation
  const handleToggleServiceInPackage = (serviceName: string) => {
    const current = packageFormData.servicesIncluded || [];
    let updated: string[];
    if (current.includes(serviceName)) {
      updated = current.filter((s) => s !== serviceName);
    } else {
      updated = [...current, serviceName];
    }

    // Auto calculate suggested original price
    const matchedServices = services.filter((s) => updated.includes(s.name));
    const calculatedSum = matchedServices.reduce((acc, s) => acc + s.price, 0);

    setPackageFormData({
      ...packageFormData,
      servicesIncluded: updated,
      originalPrice: calculatedSum > 0 ? calculatedSum : packageFormData.originalPrice,
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (activeTab === 'services') {
      const headers = ['Code', 'Service Name', 'Category', 'Department', 'Duration (Mins)', 'Base Price ($)', 'Tax (%)', 'Total ($)', 'Status'];
      const rows = filteredServices.map((s) => [
        s.code || '',
        `"${s.name.replace(/"/g, '""')}"`,
        s.category,
        s.departmentName || '',
        s.durationMinutes,
        s.price,
        s.taxRate,
        (s.price * (1 + (s.taxRate || 0) / 100)).toFixed(2),
        s.active ? 'Active' : 'Inactive',
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Apex_Medical_Services_Tariff_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Tariff sheet exported as CSV.');
    } else {
      const headers = ['Code', 'Package Name', 'Tagline', 'Department', 'Original ($)', 'Discounted ($)', 'Savings ($)', 'Validity Days', 'Status'];
      const rows = filteredPackages.map((p) => [
        p.code || '',
        `"${p.name.replace(/"/g, '""')}"`,
        `"${(p.tagline || '').replace(/"/g, '""')}"`,
        p.departmentName || '',
        p.originalPrice,
        p.discountedPrice,
        p.originalPrice - p.discountedPrice,
        p.validityDays,
        p.active ? 'Active' : 'Inactive',
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Apex_Health_Packages_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Health packages catalog exported as CSV.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Consultation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Diagnostics':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Procedures':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Therapy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Vaccination':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Lab':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* Header Banner & Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Clinical Tariff & Bundles
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              ICD-10 & Standard CPT Compatible
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Medical Services & Tariff Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage clinical consultations, pathology diagnostics, minor procedures, physiotherapy, and health packages.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Download CSV Tariff Sheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Print Clinical Price List"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Tariff</span>
          </button>

          {canCreate && (
            <button
              onClick={activeTab === 'services' ? handleOpenAddService : handleOpenAddPackage}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'services' ? 'Add Medical Service' : 'Create Health Package'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">Active Services</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {activeServicesCount}{' '}
            <span className="text-xs font-medium text-slate-400">/ {services.length} total</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Standardized multi-branch tariff
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">Clinical Specialties</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {consultationsCount}{' '}
            <span className="text-xs font-medium text-slate-400">consultations</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            Across {specialties.length} clinical departments
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">Diagnostics & Labs</span>
            <FlaskConical className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {diagnosticsCount}{' '}
            <span className="text-xs font-medium text-slate-400">procedures</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
            Avg. Fee: ${avgServiceFee}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold">Health Packages</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {packages.length}{' '}
            <span className="text-xs font-medium text-slate-400">bundles</span>
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Avg. bundle discount: {avgPackageDiscount}%
          </div>
        </div>
      </div>

      {/* Main Content Tabs & Filtering */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 px-6 pt-4 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'border-teal-600 text-teal-800 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Services & Tariff Catalog</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
                {services.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
                activeTab === 'packages'
                  ? 'border-teal-600 text-teal-800 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Health Package Bundles</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                {packages.length}
              </span>
            </button>
          </div>

          {activeTab === 'services' && (
            <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl mb-2 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cards View
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={activeTab === 'services' ? 'Search service by name, code (SRV-01), department...' : 'Search packages by name, code, included tests...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-teal-600 focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter (Services only) */}
          {activeTab === 'services' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-teal-600 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Consultation">Consultation</option>
              <option value="Diagnostics">Diagnostics</option>
              <option value="Procedures">Procedures</option>
              <option value="Therapy">Therapy</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Lab">Lab / Pathology</option>
            </select>
          )}

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-teal-600 cursor-pointer"
          >
            <option value="all">All Departments</option>
            {specialties.map((spec) => (
              <option key={spec.id} value={spec.name}>
                {spec.name}
              </option>
            ))}
          </select>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-teal-600 cursor-pointer"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-teal-600 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* TAB 1: SERVICES CATALOG */}
        {activeTab === 'services' && (
          <div>
            {filteredServices.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No matching medical services</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search terms or filters, or add a new clinical service to your clinic tariff sheet.
                </p>
                {canCreate && (
                  <button
                    onClick={handleOpenAddService}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    + Add New Service
                  </button>
                )}
              </div>
            ) : viewMode === 'table' ? (
              /* DENSE CLINICAL TARIFF TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Service & Clinical Scope</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Allocated Doctors</th>
                      <th className="py-3 px-4 text-center">Duration</th>
                      <th className="py-3 px-4 text-right">Standard Tariff</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredServices.map((srv) => {
                      const totalWithTax = srv.price * (1 + (srv.taxRate || 0) / 100);
                      const assignedDoctors = (srv.assignedDoctorIds || [])
                        .map((id) => doctors.find((d) => d.id === id))
                        .filter(Boolean);

                      return (
                        <tr key={srv.id} className="hover:bg-slate-50/60 transition-colors group">
                          {/* Code */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-600 text-[11px] whitespace-nowrap">
                            {srv.code || 'SRV-??'}
                          </td>

                          {/* Name & Description */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {srv.name}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {srv.description}
                            </p>
                            {srv.preparationInstructions && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-1">
                                Prep: {srv.preparationInstructions}
                              </span>
                            )}
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(srv.category)}`}>
                              {srv.category}
                            </span>
                          </td>

                          {/* Department */}
                          <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                            {srv.departmentName || 'General Medicine'}
                          </td>

                          {/* Allocated Doctors */}
                          <td className="py-3.5 px-4">
                            {assignedDoctors.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {assignedDoctors.map((doc) => (
                                  <span
                                    key={doc?.id}
                                    className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                                    title={doc?.name}
                                  >
                                    {doc?.name.replace('Dr. ', '')}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Open Specialist Pool</span>
                            )}
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-4 text-center text-slate-600 font-medium whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {srv.durationMinutes} min
                            </span>
                          </td>

                          {/* Price & Tax */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 text-sm">
                              ${srv.price.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {srv.taxRate > 0 ? `+${srv.taxRate}% tax ($${totalWithTax.toFixed(2)})` : 'Tax exempt (0%)'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleToggleServiceActive(srv)}
                              disabled={!canUpdate}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                srv.active
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${srv.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              {srv.active ? 'Active' : 'Inactive'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {onOpenBookingModal && srv.active && (
                                <button
                                  onClick={() => onOpenBookingModal(srv.name)}
                                  className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg transition-colors cursor-pointer"
                                  title="Book appointment with this service"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {canUpdate && (
                                <button
                                  onClick={() => handleOpenEditService(srv)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Service Details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteService(srv)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors cursor-pointer"
                                  title="Deactivate Service"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARD VIEW */
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((srv) => {
                  const assignedDoctors = (srv.assignedDoctorIds || [])
                    .map((id) => doctors.find((d) => d.id === id))
                    .filter(Boolean);

                  return (
                    <div
                      key={srv.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        srv.active
                          ? 'bg-white border-slate-200 shadow-xs hover:border-teal-300'
                          : 'bg-slate-50/60 border-slate-200/70 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {srv.code || 'SRV'}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(srv.category)}`}>
                            {srv.category}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-sm mt-2">{srv.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-[11px] truncate">{srv.departmentName || 'General Practice'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-[11px]">{srv.durationMinutes} minutes slot</span>
                          </div>
                        </div>

                        {assignedDoctors.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1">
                            {assignedDoctors.map((doc) => (
                              <span key={doc?.id} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {doc?.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-lg font-black text-slate-900">${srv.price.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400">
                            {srv.taxRate > 0 ? `+${srv.taxRate}% tax` : 'Tax exempt'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {onOpenBookingModal && srv.active && (
                            <button
                              onClick={() => onOpenBookingModal(srv.name)}
                              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Book
                            </button>
                          )}
                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEditService(srv)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HEALTH PACKAGE BUNDLES */}
        {activeTab === 'packages' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Configured Preventative Health Packages</h3>
                <p className="text-xs text-slate-500">
                  Pre-assembled clinical bundles offering bundled discounts for executive checkups, cardiac shields, and geriatric wellness.
                </p>
              </div>
              {canCreate && (
                <button
                  onClick={handleOpenAddPackage}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Package Bundle</span>
                </button>
              )}
            </div>

            {filteredPackages.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No health packages found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create bundled checkups to offer patients structured preventative screenings at transparent rates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPackages.map((pkg) => {
                  const savings = pkg.originalPrice - pkg.discountedPrice;
                  const discountPct = Math.round((savings / pkg.originalPrice) * 100);

                  return (
                    <div
                      key={pkg.id}
                      className={`p-6 rounded-3xl border transition-all flex flex-col justify-between bg-white relative ${
                        pkg.badge
                          ? 'border-teal-500 shadow-md ring-2 ring-teal-500/10'
                          : 'border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Top Badge */}
                      {pkg.badge && (
                        <span className="absolute -top-3 left-6 bg-teal-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                          {pkg.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex items-start justify-between gap-2 mt-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            {pkg.code || 'PKG'}
                          </span>
                          <button
                            onClick={() => handleTogglePackageActive(pkg)}
                            disabled={!canUpdate}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                              pkg.active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {pkg.active ? 'Active Bundle' : 'Inactive'}
                          </button>
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mt-1">{pkg.name}</h3>
                        <p className="text-xs text-teal-700 font-semibold mt-0.5">{pkg.tagline}</p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{pkg.description}</p>

                        {/* Included Services list */}
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                            Included Diagnostic & Clinical Tests ({pkg.servicesIncluded.length})
                          </div>
                          <div className="space-y-1.5">
                            {pkg.servicesIncluded.map((testName, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                <span className="font-medium">{testName}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {pkg.recommendedFor && (
                          <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                            <span className="font-bold text-slate-800">Target Audience: </span>
                            {pkg.recommendedFor}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Booking Footer */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">${pkg.discountedPrice}</span>
                            <span className="text-sm font-bold text-slate-400 line-through">${pkg.originalPrice}</span>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Save ${savings} ({discountPct}% OFF)
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Valid for {pkg.validityDays} days from purchase
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {onOpenBookingModal && pkg.active && (
                            <button
                              onClick={() => onOpenBookingModal(pkg.name)}
                              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Book Package</span>
                            </button>
                          )}

                          {canUpdate && (
                            <button
                              onClick={() => handleOpenEditPackage(pkg)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                              title="Edit Package"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeletePackage(pkg)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors cursor-pointer"
                              title="Delete Package"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE / EDIT SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingService ? 'Edit Medical Service' : 'Add New Medical Service'}
                </h3>
                <p className="text-xs text-slate-500">Configure clinical scope, duration, doctor allocation, and pricing tariff.</p>
              </div>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Service Code</label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.code}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-teal-600 uppercase"
                    placeholder="SRV-15"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={serviceFormData.name}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-teal-600"
                    placeholder="e.g. 24-Hour Holter ECG Monitoring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={serviceFormData.category}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:outline-teal-600"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Procedures">Procedures</option>
                    <option value="Therapy">Therapy</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Lab">Lab / Pathology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department / Specialty</label>
                  <select
                    value={serviceFormData.departmentName}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, departmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:outline-teal-600"
                  >
                    {specialties.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={serviceFormData.durationMinutes}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={serviceFormData.price}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={serviceFormData.taxRate}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, taxRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600 font-medium"
                  />
                </div>
              </div>

              {/* Total Calculation Display */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-bold text-xs">
                <span className="text-slate-600">Calculated Billable Tariff:</span>
                <span className="text-teal-800 text-sm">
                  ${(Number(serviceFormData.price || 0) * (1 + (Number(serviceFormData.taxRate || 0) / 100))).toFixed(2)} (Tax Included)
                </span>
              </div>

              {/* Doctor Allocation */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Allocated Doctors / Specialists</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {doctors.map((doc) => {
                    const isChecked = (serviceFormData.assignedDoctorIds || []).includes(doc.id);
                    return (
                      <label key={doc.id} className="flex items-center gap-2 cursor-pointer text-[11px] p-1 rounded hover:bg-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const current = serviceFormData.assignedDoctorIds || [];
                            const updated = isChecked ? current.filter((id) => id !== doc.id) : [...current, doc.id];
                            setServiceFormData({ ...serviceFormData, assignedDoctorIds: updated });
                          }}
                          className="rounded text-teal-600"
                        />
                        <span className="truncate">{doc.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Clinical Description</label>
                <textarea
                  rows={2}
                  value={serviceFormData.description}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600 font-medium"
                  placeholder="Clinical purpose, indications, and patient diagnostic outcomes..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Preparation Instructions (Optional)</label>
                <input
                  type="text"
                  value={serviceFormData.preparationInstructions}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, preparationInstructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600"
                  placeholder="e.g. Fasting for 10 hours, avoid caffeine, wear comfortable clothing"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="srvActive"
                  checked={serviceFormData.active}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, active: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <label htmlFor="srvActive" className="text-slate-700 font-bold cursor-pointer">
                  Service is Active & Available for Appointment Booking
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  {editingService ? 'Update Service' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT HEALTH PACKAGE MODAL */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingPackage ? 'Edit Health Package Bundle' : 'Create New Health Package'}
                </h3>
                <p className="text-xs text-slate-500">Assemble bundled clinical tests and set discount pricing.</p>
              </div>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Package Code</label>
                  <input
                    type="text"
                    required
                    value={packageFormData.code}
                    onChange={(e) => setPackageFormData({ ...packageFormData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-teal-600 uppercase"
                    placeholder="PKG-05"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={packageFormData.name}
                    onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:outline-teal-600"
                    placeholder="e.g. Diabetology & Renal Shield Check"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={packageFormData.tagline}
                    onChange={(e) => setPackageFormData({ ...packageFormData, tagline: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600"
                    placeholder="e.g. Complete metabolic review for blood sugar control"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Promotional Badge</label>
                  <select
                    value={packageFormData.badge || ''}
                    onChange={(e) => setPackageFormData({ ...packageFormData, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium focus:outline-teal-600"
                  >
                    <option value="">No Badge</option>
                    <option value="Most Popular">Most Popular</option>
                    <option value="Best Value">Best Value</option>
                    <option value="Specialized">Specialized</option>
                    <option value="Senior Care">Senior Care</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              {/* Select Included Services from Catalog */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select Included Clinical Services & Diagnostics ({packageFormData.servicesIncluded?.length || 0} selected)
                </label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto space-y-1.5">
                  {services.map((srv) => {
                    const isSelected = (packageFormData.servicesIncluded || []).includes(srv.name);
                    return (
                      <label
                        key={srv.id}
                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200' : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleServiceInPackage(srv.name)}
                            className="rounded text-teal-600"
                          />
                          <span>{srv.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">${srv.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Original Standalone Sum ($)</label>
                  <input
                    type="number"
                    value={packageFormData.originalPrice}
                    onChange={(e) => setPackageFormData({ ...packageFormData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600 font-bold text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Discounted Package Price ($)</label>
                  <input
                    type="number"
                    required
                    value={packageFormData.discountedPrice}
                    onChange={(e) => setPackageFormData({ ...packageFormData, discountedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600 font-black text-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    value={packageFormData.validityDays}
                    onChange={(e) => setPackageFormData({ ...packageFormData, validityDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600 font-medium"
                  />
                </div>
              </div>

              {/* Savings preview */}
              {Number(packageFormData.originalPrice) > Number(packageFormData.discountedPrice) && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl font-bold flex items-center justify-between text-xs">
                  <span>Patient Bundle Savings:</span>
                  <span>
                    ${Number(packageFormData.originalPrice) - Number(packageFormData.discountedPrice)} (
                    {Math.round(((Number(packageFormData.originalPrice) - Number(packageFormData.discountedPrice)) / Number(packageFormData.originalPrice)) * 100)}% Discount)
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Clinical Audience (Recommended For)</label>
                <input
                  type="text"
                  value={packageFormData.recommendedFor}
                  onChange={(e) => setPackageFormData({ ...packageFormData, recommendedFor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600"
                  placeholder="e.g. Adults aged 35+, individuals with hypertension or family history of cardiac disease"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Patient Preparation Guidelines</label>
                <input
                  type="text"
                  value={packageFormData.preparationInstructions}
                  onChange={(e) => setPackageFormData({ ...packageFormData, preparationInstructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-teal-600"
                  placeholder="e.g. 10-12 hours overnight fasting, morning urine sample"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pkgActive"
                  checked={packageFormData.active}
                  onChange={(e) => setPackageFormData({ ...packageFormData, active: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <label htmlFor="pkgActive" className="text-slate-700 font-bold cursor-pointer">
                  Health Package is Active & Available for Booking
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  {editingPackage ? 'Update Package' : 'Publish Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
