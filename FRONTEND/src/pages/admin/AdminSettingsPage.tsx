import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/mockDatabase';
import { useTheme } from '../../context/ThemeContext';
import {
  Settings,
  Building,
  MapPin,
  Clock,
  Shield,
  CreditCard,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  Database,
  ToggleLeft,
  ToggleRight,
  Server,
  AlertTriangle,
  Sparkles,
  Trash2,
  Layers,
  History,
  Activity,
  Search,
  Filter,
  RefreshCw,
  HardDrive,
  Cpu,
  Mail,
  Smartphone,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

interface AdminSettingsPageProps {
  onNavigate: (view: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'system_data' | 'demo' | 'general' | 'technical' | 'audit'>('system_data');
  const { theme, preference, setPreference } = useTheme();

  // Technical Settings from DB
  const [techSettings, setTechSettings] = useState(dbService.getTechnicalSettings());
  const [demoStats, setDemoStats] = useState(dbService.getDemoDataStats());
  const [backendDemoEnv, setBackendDemoEnv] = useState<'enable' | 'disable'>('disable');
  const isDemoEnabled = dbService.isDemoDataEnabled();

  // System Data Configuration state from /api/settings/data-config
  const [dataConfig, setDataConfig] = useState<{
    currentDatabase: string;
    enableDemoData: boolean;
    enableDummyData: boolean;
    demoDataStatus: string;
    dummyDataStatus: string;
    runtimeDemoData: boolean;
    runtimeDummyData: boolean;
    canToggleDemo: boolean;
    canToggleDummy: boolean;
    demoDisabledReason: string | null;
    dummyDisabledReason: string | null;
  }>({
    currentDatabase: 'PostgreSQL',
    enableDemoData: false,
    enableDummyData: false,
    demoDataStatus: 'Disabled',
    dummyDataStatus: 'Disabled',
    runtimeDemoData: false,
    runtimeDummyData: false,
    canToggleDemo: false,
    canToggleDummy: false,
    demoDisabledReason: 'System configuration (.env ENABLE_DEMO_DATA=false) prevents enabling demo data',
    dummyDisabledReason: 'System configuration (.env ENABLE_DUMMY_DATA=false) prevents enabling dummy data',
  });

  // Fetch data-config on mount
  useEffect(() => {
    fetch('/api/settings/data-config')
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.success && payload?.data) {
          setDataConfig(payload.data);
        }
      })
      .catch(() => {});

    fetch('/api/settings/demo-mode')
      .then((res) => res.json())
      .then((payload) => {
        if (payload?.success && typeof payload?.data?.demoDataEnabled === 'boolean') {
          setBackendDemoEnv(payload.data.demoEnvironment || (payload.data.demoDataEnabled ? 'enable' : 'disable'));
        }
      })
      .catch(() => {});
  }, []);

  // General Settings
  const branches = dbService.branches;
  const [clinicName, setClinicName] = useState('Apex Health Specialty Medical Centre');
  const [taxRate, setTaxRate] = useState(5.0);
  const [currency, setCurrency] = useState('USD ($)');
  const [opdSlotDuration, setOpdSlotDuration] = useState(15);

  // Status Alerts
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [auditQuery, setAuditQuery] = useState('');
  const [auditFilter, setAuditFilter] = useState('all');

  const showNotice = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setActionNotice({ text, type });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleToggleDemoData = (enabled: boolean) => {
    dbService.setDemoDataEnabled(enabled);
    setDemoStats(dbService.getDemoDataStats());
    setTechSettings(dbService.getTechnicalSettings());
    showNotice(
      enabled
        ? 'Demo & sample data has been ENABLED across all clinic modules.'
        : 'Demo & sample data has been DISABLED. The application is now running in pure production mode with zero demo artifacts.',
      'success'
    );
  };

  const handleSafeSeedDemoData = () => {
    const result = dbService.seedDemoDataSafely();
    setDemoStats(result.stats);
    setTechSettings(dbService.getTechnicalSettings());
    showNotice(result.message, 'success');
  };

  const handleClearDemoData = () => {
    if (
      window.confirm(
        'Are you sure you want to remove ALL demo/sample records? All real production patient data, custom doctors, and active transactions will be completely preserved.'
      )
    ) {
      const result = dbService.clearDemoDataOnly();
      setDemoStats(result.stats);
      setTechSettings(dbService.getTechnicalSettings());
      showNotice(result.message, 'info');
    }
  };

  const handleResetEmptyDatabase = () => {
    if (
      window.confirm(
        '⚠️ WARNING: This will reset all business records (patients, appointments, invoices, leads) to zero (0). Use this to verify the application functions properly with an empty database. Are you sure you want to proceed?'
      )
    ) {
      const result = dbService.resetToEmptyProductionDatabase();
      setDemoStats(dbService.getDemoDataStats());
      setTechSettings(dbService.getTechnicalSettings());
      showNotice(result.message, 'info');
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateTechnicalSettings(
      {
        clinicName,
        defaultTaxRate: taxRate,
        billingCurrency: currency,
        slotDurationMinutes: opdSlotDuration,
      },
      'Super Admin'
    );
    showNotice('Clinic general configuration saved and synchronized successfully across all branches.', 'success');
  };

  const handleSaveTechnical = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateTechnicalSettings(techSettings, 'Super Admin');
    showNotice('Technical database architecture & API settings updated successfully.', 'success');
  };

  // Filtered audit logs
  const auditLogs = dbService.auditLogs.filter((log) => {
    if (auditFilter !== 'all' && log.module.toLowerCase() !== auditFilter.toLowerCase()) return false;
    if (auditQuery) {
      const q = auditQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.userRole.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Administration & Technical Configuration
            </h1>
            <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage demo data lifecycle, production empty database mode, database parameters, and system audit governance.
          </p>
        </div>

        {/* Global Demo Status Indicator */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
          <div className={`w-2.5 h-2.5 rounded-full ${isDemoEnabled ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-bold text-slate-700">
            System Mode:{' '}
            <strong className={isDemoEnabled ? 'text-amber-700' : 'text-emerald-700'}>
              {isDemoEnabled ? 'Demo Data Active' : 'Pure Production (Demo Disabled)'}
            </strong>
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 font-semibold shadow-xs transition-all ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : actionNotice.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-900'
              : 'bg-blue-50 border border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice.text}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('system_data')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'system_data'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          System → Data Configuration
          <span className="bg-slate-900 text-teal-300 text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded">
            {dataConfig.currentDatabase}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'demo'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          Demo Data Management
          {isDemoEnabled ? (
            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              Active
            </span>
          ) : (
            <span className="bg-emerald-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              Off
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          Clinic Identity & Branches
        </button>

        <button
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'technical'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Server className="w-4 h-4" />
          Database & Architecture
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          Audit & Governance Logs
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {dbService.auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 0: SYSTEM -> DATA CONFIGURATION */}
      {activeTab === 'system_data' && (
        <div className="space-y-6">
          {/* Breadcrumbs Banner */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-700">Admin</span>
            <span>→</span>
            <span className="text-slate-700">Settings</span>
            <span>→</span>
            <span className="text-slate-700">System</span>
            <span>→</span>
            <span className="text-teal-700 font-bold font-mono">Data Configuration</span>
          </div>

          {/* Primary Triple Display Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Database Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Database Engine</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                  ACTIVE
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Database</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
                  {dataConfig.currentDatabase}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Environment key:</span>
                  <span className="font-mono font-bold text-slate-800">CURRENT_DATABASE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Demo Data Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Demo Data Authority</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  dataConfig.enableDemoData ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {dataConfig.demoDataStatus.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Demo Data</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
                  {dataConfig.demoDataStatus}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Environment key:</span>
                  <span className="font-mono font-bold text-slate-800">ENABLE_DEMO_DATA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Enforcement:</span>
                  <span className="text-rose-700 font-bold">Strict Safety Lock</span>
                </div>
              </div>
            </div>

            {/* 3. Dummy Data Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dummy Fallbacks</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  dataConfig.enableDummyData ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {dataConfig.dummyDataStatus.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Dummy Data</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight block mt-0.5">
                  {dataConfig.dummyDataStatus}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Environment key:</span>
                  <span className="font-mono font-bold text-slate-800">ENABLE_DUMMY_DATA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fallback Policy:</span>
                  <span className="text-rose-700 font-bold">Zero Fallbacks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Control Guard Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                Administrator Runtime Toggles & Governance
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                The administrator can only enable runtime demo/dummy functionality if the corresponding .env capability is enabled. If set to false in .env, admin toggles are locked and cannot override the environment.
              </p>
            </div>

            {/* Toggle Rows */}
            <div className="space-y-4">
              {/* Demo Toggle Row */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Demo Data Runtime Toggle</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      ENABLE_DEMO_DATA={String(dataConfig.enableDemoData)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {dataConfig.canToggleDemo
                      ? 'Environment allows runtime toggling of demo data.'
                      : 'Admin Toggle → DISABLED → System configuration (.env) prevents enabling.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!dataConfig.canToggleDemo}
                    onClick={() => {
                      if (!dataConfig.canToggleDemo) {
                        showNotice('System configuration (.env ENABLE_DEMO_DATA=false) prevents enabling demo data.', 'error');
                        return;
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !dataConfig.canToggleDemo
                        ? 'opacity-50 bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-teal-600 text-white cursor-pointer hover:bg-teal-700'
                    }`}
                    title={!dataConfig.canToggleDemo ? 'System configuration prevents enabling' : 'Toggle demo data'}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    DISABLED (System Locked)
                  </button>
                </div>
              </div>

              {/* Dummy Toggle Row */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Dummy Fallback Data Runtime Toggle</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      ENABLE_DUMMY_DATA={String(dataConfig.enableDummyData)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {dataConfig.canToggleDummy
                      ? 'Environment allows fallback dummy data when database has 0 rows.'
                      : 'Admin Toggle → DISABLED → System configuration (.env) prevents enabling.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!dataConfig.canToggleDummy}
                    onClick={() => {
                      if (!dataConfig.canToggleDummy) {
                        showNotice('System configuration (.env ENABLE_DUMMY_DATA=false) prevents enabling dummy data.', 'error');
                        return;
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !dataConfig.canToggleDummy
                        ? 'opacity-50 bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-teal-600 text-white cursor-pointer hover:bg-teal-700'
                    }`}
                    title={!dataConfig.canToggleDummy ? 'System configuration prevents enabling' : 'Toggle dummy data'}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    DISABLED (System Locked)
                  </button>
                </div>
              </div>
            </div>

            {/* Safety Layer Pipeline Diagram */}
            <div className="p-5 rounded-xl bg-slate-900 text-white space-y-3">
              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
                Environment Is The Global Safety Layer
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-teal-900/80 text-teal-200 border border-teal-700 font-bold">
                  .env capability
                </span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Admin permission
                </span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Runtime setting
                </span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Feature availability
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rule enforced: <span className="text-teal-300 font-semibold">Never allow an admin UI setting to override an .env value of false.</span> When ENABLE_DEMO_DATA=false and ENABLE_DUMMY_DATA=false, the application strictly communicates with the configured {dataConfig.currentDatabase} database. An empty database returns 0 rows and displays the designated empty states.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: DEMO DATA MANAGEMENT */}
      {activeTab === 'demo' && (
        <div className="space-y-6">
          {/* Main Master Switch Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-600" />
                  Demo & Sample Data Control
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Enable or disable sample medical records. When disabled, the application operates purely with real production database records. Demo data is never hard-coded and is never required for application functionality.
                </p>
              </div>

              {/* Master On/Off Switch Buttons */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleDemoData(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isDemoEnabled
                      ? 'bg-white text-amber-800 shadow-xs border border-amber-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ToggleRight className="w-4 h-4 text-amber-600" />
                  Enable Demo Data
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleDemoData(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    !isDemoEnabled
                      ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ToggleLeft className="w-4 h-4 text-emerald-600" />
                  Disable Demo Data
                </button>
              </div>
            </div>

            {/* Environment Variable Source of Truth Banner */}
            <div className="mt-4 p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-teal-950 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-teal-700" />
                    Environment Authority (.env):
                  </span>
                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-teal-200/80 text-teal-950">
                    DEMO_ENVIRONMENT={backendDemoEnv.toUpperCase()}
                  </span>
                </div>
                <p className="text-teal-800 text-[11px]">
                  The backend is the authoritative source of truth for Demo Mode. Demo data is kept separate from real database logic and operates without real customer data.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] ${
                  backendDemoEnv === 'enable'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  Backend Authority: {backendDemoEnv === 'enable' ? 'Demo Mode Active' : 'Real Database Active'}
                </span>
              </div>
            </div>

            {/* Current State Info Banner */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-800 block">
                  Current Status:{' '}
                  {isDemoEnabled ? (
                    <span className="text-amber-700 font-black">Demo Data is VISIBLE in all portals</span>
                  ) : (
                    <span className="text-emerald-700 font-black">Demo Data is HIDDEN / Filtered out</span>
                  )}
                </span>
                <span className="text-slate-500">
                  {isDemoEnabled
                    ? 'All user tables display both sample records (tagged with [DEMO]) and production records (tagged with [PROD]).'
                    : 'Only user-created real production business records are queried. The app is ready for empty-database testing.'}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] bg-white border border-slate-200 text-slate-700">
                  Filter Active: {!isDemoEnabled ? 'WHERE is_demo = FALSE' : 'ALL RECORDS'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Record Distinction Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  Live Record Breakdown & Origin Audit
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distinguishes demo sample records from live production data across core operational entities.
                </p>
              </div>
              <button
                onClick={() => setDemoStats(dbService.getDemoDataStats())}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                title="Refresh stats"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Patients */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Patients</span>
                <div className="text-lg font-black text-slate-900">{demoStats.totalPatients}</div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-semibold">
                  <span className="text-amber-700">{demoStats.demoPatients} Demo</span>
                  <span className="text-emerald-700">{demoStats.prodPatients} Prod</span>
                </div>
              </div>

              {/* Appointments */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Appointments</span>
                <div className="text-lg font-black text-slate-900">{demoStats.totalAppointments}</div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-semibold">
                  <span className="text-amber-700">{demoStats.demoAppointments} Demo</span>
                  <span className="text-emerald-700">{demoStats.prodAppointments} Prod</span>
                </div>
              </div>

              {/* Invoices */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Invoices</span>
                <div className="text-lg font-black text-slate-900">{demoStats.totalInvoices}</div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-semibold">
                  <span className="text-amber-700">{demoStats.demoInvoices} Demo</span>
                  <span className="text-emerald-700">{demoStats.prodInvoices} Prod</span>
                </div>
              </div>

              {/* Doctors */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Doctors</span>
                <div className="text-lg font-black text-slate-900">{demoStats.totalDoctors}</div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-semibold">
                  <span className="text-amber-700">{demoStats.demoDoctors} Demo</span>
                  <span className="text-emerald-700">{demoStats.prodDoctors} Prod</span>
                </div>
              </div>

              {/* Inventory */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Formulary / SKU</span>
                <div className="text-lg font-black text-slate-900">{demoStats.totalInventory}</div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-semibold">
                  <span className="text-amber-700">{demoStats.demoInventory} Demo</span>
                  <span className="text-emerald-700">{demoStats.prodInventory} Prod</span>
                </div>
              </div>

              {/* Leads */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">CRM Leads</span>
                <div className="text-lg font-black text-slate-900">{demoStats.totalLeads}</div>
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 font-semibold">
                  <span className="text-amber-700">{demoStats.demoLeads} Demo</span>
                  <span className="text-emerald-700">{demoStats.prodLeads} Prod</span>
                </div>
              </div>
            </div>
          </div>

          {/* Safe Seeding & Empty Database Operations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Safe Data Synchronization & Production Preparation
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Execute safe seeding with automatic duplicate detection, or reset to zero business records for live clinic deployment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1: Safe Demo Seeding */}
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-900 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    Safe Demo Data Seeding
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Safely seeds baseline clinic data without overwriting existing production records. Uses <em>Check &amp; Update</em> logic to prevent duplicates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSafeSeedDemoData}
                  className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Seed Demo Data Safely
                </button>
              </div>

              {/* Card 2: Purge Demo Records Only */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                    <Trash2 className="w-4 h-4 text-amber-600" />
                    Purge Demo Records Only
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Removes all records flagged with <code>isDemo = true</code>. All live customer registrations and appointments created by users are preserved.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearDemoData}
                  className="w-full py-2.5 px-3 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-amber-700" />
                  Purge Demo Records
                </button>
              </div>

              {/* Card 3: Empty Database Mode */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Reset to Empty Production DB
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Clears all business entities to zero (0) records. Allows Super Admin to verify empty states, walk-in creation, and clean clinic initialization.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetEmptyDatabase}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Empty Production DB
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GENERAL & CLINIC IDENTITY */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" />
              General Clinic Identity & Localization
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Organization / Clinic Legal Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Billing Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white font-medium"
                >
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="AED (د.إ)">AED (د.إ) - UAE Dirham</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Default Sales Tax / GST Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Standard OPD Slot Duration (Minutes)</label>
                <select
                  value={opdSlotDuration}
                  onChange={(e) => setOpdSlotDuration(parseInt(e.target.value) || 15)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                >
                  <option value={10}>10 Minutes</option>
                  <option value={15}>15 Minutes (Default)</option>
                  <option value={20}>20 Minutes</option>
                  <option value={30}>30 Minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interface Appearance & Theme Preferences */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Sun className="w-4 h-4 text-teal-600" />
                Interface Appearance & Theme Mode
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                Active Theme: <span className="text-teal-600 capitalize">{theme}</span>
              </span>
            </div>

            <p className="text-slate-600 text-[11px]">
              Select your preferred visual mode for the clinical workspace. Changes take effect across all dashboards, patient queues, and management panels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Light Mode Button */}
              <button
                type="button"
                onClick={() => setPreference('light')}
                className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                  preference === 'light'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-900 ring-2 ring-teal-600/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Light Mode</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">High clarity daylight theme</div>
                </div>
                {preference === 'light' && (
                  <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full mt-1">
                    Active
                  </span>
                )}
              </button>

              {/* Dark Mode Button */}
              <button
                type="button"
                onClick={() => setPreference('dark')}
                className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                  preference === 'dark'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-900 ring-2 ring-teal-600/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-200">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Dark Mode</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">High contrast night workspace</div>
                </div>
                {preference === 'dark' && (
                  <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full mt-1">
                    Active
                  </span>
                )}
              </button>

              {/* System Match Button */}
              <button
                type="button"
                onClick={() => setPreference('system')}
                className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                  preference === 'system'
                    ? 'border-teal-600 bg-teal-50/50 text-teal-900 ring-2 ring-teal-600/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">System Match</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Sync with OS appearance</div>
                </div>
                {preference === 'system' && (
                  <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-full mt-1">
                    Active ({theme})
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Branches */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              Active Clinic Branches ({branches.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branches.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">{b.name}</span>
                    {b.isMainBranch && (
                      <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Main HQ
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px]">{b.address}, {b.city}</p>
                  <p className="text-slate-500 text-[10px]">Phone: {b.phone} • Email: {b.email}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save General Identity
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: TECHNICAL & DATABASE ARCHITECTURE */}
      {activeTab === 'technical' && (
        <form onSubmit={handleSaveTechnical} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-600" />
              Database Engine & Persistence Layer
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Database Engine</label>
                <select
                  value={techSettings.databaseEngine}
                  onChange={(e) => setTechSettings({ ...techSettings, databaseEngine: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white font-semibold"
                >
                  <option value="postgresql">PostgreSQL 16 (Relational Cloud SQL)</option>
                  <option value="mysql">MySQL 8.0 (Relational RDS)</option>
                  <option value="sqlite">SQLite 3 (Embedded Local)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Connection Host</label>
                <input
                  type="text"
                  value={techSettings.databaseHost}
                  onChange={(e) => setTechSettings({ ...techSettings, databaseHost: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Port</label>
                <input
                  type="number"
                  value={techSettings.databasePort}
                  onChange={(e) => setTechSettings({ ...techSettings, databasePort: parseInt(e.target.value) || 5432 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Database Name</label>
                <input
                  type="text"
                  value={techSettings.databaseName}
                  onChange={(e) => setTechSettings({ ...techSettings, databaseName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Database User</label>
                <input
                  type="text"
                  value={techSettings.databaseUser}
                  onChange={(e) => setTechSettings({ ...techSettings, databaseUser: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">SSL Mode</label>
                <select
                  value={techSettings.sslMode}
                  onChange={(e) => setTechSettings({ ...techSettings, sslMode: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 bg-white font-medium"
                >
                  <option value="require">Require (Production Recommended)</option>
                  <option value="verify-full">Verify Full Certificate</option>
                  <option value="prefer">Prefer</option>
                  <option value="disable">Disable (Local Dev Only)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Connection Pool Max</label>
                <input
                  type="number"
                  value={techSettings.connectionPoolMax}
                  onChange={(e) => setTechSettings({ ...techSettings, connectionPoolMax: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Slow Query Log Threshold (ms)</label>
                <input
                  type="number"
                  value={techSettings.slowQueryThresholdMs}
                  onChange={(e) => setTechSettings({ ...techSettings, slowQueryThresholdMs: parseInt(e.target.value) || 200 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-teal-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Automated Daily Backups</label>
                <div className="flex items-center gap-3 h-9">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={techSettings.backupAutomated}
                      onChange={(e) => setTechSettings({ ...techSettings, backupAutomated: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    <span className="ml-2 font-semibold text-slate-700">
                      {techSettings.backupAutomated ? 'Enabled (Daily at 02:00)' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Technical Parameters
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: AUDIT & GOVERNANCE LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600" />
                System Security & Administrative Audit Trail
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Tamper-evident logs of all super admin mutations, data changes, and security events.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-48 focus:outline-teal-600"
                />
              </div>

              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-medium"
              >
                <option value="all">All Modules</option>
                <option value="Settings">Settings</option>
                <option value="Patients">Patients</option>
                <option value="Appointments">Appointments</option>
                <option value="Billing">Billing</option>
                <option value="Consultations">Consultations</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User & Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Module & Entity</th>
                  <th className="py-2.5 px-3">Details / Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No audit logs match current search filters.
                    </td>
                  </tr>
                ) : (
                  auditLogs.slice(0, 50).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-800">{log.userName || log.userRole}</span>
                        <span className="block text-[9px] text-slate-500 font-mono">{log.userRole}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action.includes('RESET') || log.action.includes('DELETED')
                              ? 'bg-rose-100 text-rose-800'
                              : log.action.includes('ENABLED') || log.action.includes('CREATED') || log.action.includes('SEEDED')
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{log.module}</span>
                        <span className="text-slate-400 text-[10px]"> / {log.entityType}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
