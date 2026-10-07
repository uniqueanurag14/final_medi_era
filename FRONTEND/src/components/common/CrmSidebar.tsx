import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  HeartPulse,
  Pill,
  FlaskConical,
  Receipt,
  Boxes,
  UserCheck,
  TrendingUp,
  History,
  Settings,
  Activity,
  Layers,
  ChevronDown,
  ChevronRight,
  Contact2,
  Clock,
  Send,
  Star,
  Database,
  Building2,
  ShieldCheck,
  Package,
  SlidersHorizontal,
  FolderOpen,
  Plus,
  FileText,
  Award,
} from 'lucide-react';
import { dbService } from '../../services/mockDatabase';

interface CrmSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed?: boolean;
}

export type OfficeCategory = 'all' | 'front_office' | 'back_office';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

export const CrmSidebar: React.FC<CrmSidebarProps> = ({
  currentView,
  onNavigate,
  collapsed = false,
}) => {
  const { currentRole } = useAuth();
  const [officeCategory, setOfficeCategory] = useState<OfficeCategory>('all');

  // Badge alert counts from live/mock fallback
  const waitingAppointmentsCount = dbService.appointments.filter(
    (a) => a.date === '2026-09-01' && (a.status === 'Waiting' || a.status === 'Checked In' || a.status === 'In Consultation')
  ).length;

  const lowStockCount = dbService.inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Expiring Soon').length;
  const pendingLeadsCount = dbService.leads.filter((l) => (l.stage || l.status) === 'New' || (l.stage || l.status) === 'Interested').length;
  const pendingFollowupsCount = dbService.followups.filter((f) => f.status === 'Pending').length;

  // User Management Section (Specification 10)
  const userManagementSection: NavSection = {
    id: 'user-management-section',
    title: 'USER MANAGEMENT',
    icon: Users,
    items: [
      { id: 'admin-departments', label: 'Departments', icon: Building2 },
      { id: 'admin-designations', label: 'Designations', icon: Award },
      { id: 'admin-user-archetypes', label: 'User Archetypes', icon: ShieldCheck },
      { id: 'admin-employees', label: 'User Directory & Staff Access', icon: Users },
    ],
  };

  // Organization & Multi-Branch Hierarchy Section
  const organizationHierarchySection: NavSection = {
    id: 'org-hierarchy-section',
    title: 'Organization & Branch Hierarchy',
    icon: Building2,
    items: [
      { id: 'admin-organizations', label: 'Organizations', icon: Building2 },
      { id: 'admin-branches', label: 'Branches & Sites', icon: Layers },
      { id: 'admin-roles', label: 'Roles & Permissions', icon: ShieldCheck },
    ],
  };

  // Front Office Sections
  const frontOfficeSections: NavSection[] = [
    {
      id: 'front-desk-section',
      title: 'Front Desk & Reception',
      icon: LayoutDashboard,
      items: [
        { id: 'reception-queue', label: 'Live Queue & Tokens', icon: Activity, badge: waitingAppointmentsCount > 0 ? `${waitingAppointmentsCount} Live` : undefined },
        { id: 'admin-appointments', label: 'Appointments Calendar', icon: Calendar, badge: 'Today' },
        { id: 'admin-patients', label: 'Patients (360°)', icon: Users },
        { id: 'nurse-dashboard', label: 'Nurse Triage & Vitals', icon: HeartPulse },
        { id: 'admin-leads', label: 'Patient Leads', icon: Contact2, badge: pendingLeadsCount > 0 ? `${pendingLeadsCount}` : undefined },
      ],
    },
  ];

  // Back Office Sections
  const backOfficeSections: NavSection[] = [
    {
      id: 'clinical-section',
      title: 'Clinical & Diagnostics',
      icon: Stethoscope,
      items: [
        { id: 'doctor-queue', label: 'Physician Consultation Hub', icon: Stethoscope },
        { id: 'admin-prescriptions', label: 'Prescriptions (e-Rx)', icon: Pill },
        { id: 'admin-labs', label: 'Diagnostic Labs & Pathology', icon: FlaskConical },
        { id: 'admin-services', label: 'Medical Services & Tariff', icon: HeartPulse },
      ],
    },
    {
      id: 'inventory-section',
      title: 'Pharmacy & Medical Inventory',
      icon: Boxes,
      items: [
        { id: 'admin-inventory', label: 'Inventory Dashboard & KPIs', icon: LayoutDashboard },
        { id: 'admin-inventory-items', label: 'Medicines & Formulary', icon: Pill, badge: lowStockCount > 0 ? `${lowStockCount} Alert` : undefined },
        { id: 'admin-inventory-movements', label: 'Stock Ledger & Movements', icon: Layers },
        { id: 'admin-inventory-adjustments', label: 'Stock Adjustments & Audit', icon: SlidersHorizontal },
        { id: 'admin-inventory-suppliers', label: 'Suppliers & Vendors', icon: Building2 },
      ],
    },
    {
      id: 'operations-section',
      title: 'Billing & Operations',
      icon: TrendingUp,
      items: [
        { id: 'admin-billing', label: 'Invoices, POS & Revenue', icon: Receipt },
        { id: 'admin-followups', label: 'Care Follow-ups Hub', icon: Clock, badge: pendingFollowupsCount > 0 ? `${pendingFollowupsCount}` : undefined },
        { id: 'admin-reports', label: 'Executive Analytics & BI', icon: TrendingUp },
      ],
    },
    {
      id: 'system-section',
      title: 'System & Governance',
      icon: Settings,
      items: [
        { id: 'admin-settings', label: 'System Configuration', icon: Settings },
        { id: 'admin-audit-logs', label: 'Security & Audit Logs', icon: History },
        { id: 'admin-migrations', label: 'Database Migrations (SQL)', icon: Database, badge: 'Postgres' },
      ],
    },
  ];

  // Full unified sections list for Super Admin & Clinic Admin
  const fullUnifiedSections: NavSection[] = [
    userManagementSection,
    organizationHierarchySection,
    ...frontOfficeSections,
    ...backOfficeSections,
  ];

  // Specific role configurations
  const getSectionsForCurrentRole = (): NavSection[] => {
    if (officeCategory === 'front_office') {
      return frontOfficeSections;
    }
    if (officeCategory === 'back_office') {
      return backOfficeSections;
    }

    switch (currentRole) {
      case 'DOCTOR':
        return [
          {
            id: 'doctor-workspace',
            title: 'Clinical Workspace',
            icon: Stethoscope,
            items: [
              { id: 'doctor-queue', label: 'Live Patient Queue', icon: Activity, badge: `${waitingAppointmentsCount} Waiting` },
              { id: 'doctor-appointments', label: "Today's Schedule", icon: Calendar, badge: 'Today' },
              { id: 'doctor-patients', label: 'My Patients & Clinical Records', icon: Users },
              { id: 'doctor-prescriptions', label: 'Prescriptions Issued', icon: Pill },
              { id: 'admin-followups', label: 'Patient Care Follow-ups', icon: Clock },
            ],
          },
          {
            id: 'doctor-diagnostics',
            title: 'Diagnostics & Reviews',
            icon: FlaskConical,
            items: [
              { id: 'admin-labs', label: 'Diagnostic Lab Reports', icon: FlaskConical },
              { id: 'admin-feedback', label: 'Patient Satisfaction Reviews', icon: Star },
            ],
          },
        ];

      case 'RECEPTIONIST':
        return frontOfficeSections;

      case 'NURSE':
        return [
          {
            id: 'nurse-workspace',
            title: 'Triage & Nursing Care',
            icon: HeartPulse,
            items: [
              { id: 'nurse-dashboard', label: 'Nurse Triage & Vitals', icon: HeartPulse },
              { id: 'reception-queue', label: 'Waiting Room Live Queue', icon: Activity, badge: `${waitingAppointmentsCount}` },
              { id: 'admin-patients', label: 'Patient Clinical Directory', icon: Users },
              { id: 'admin-followups', label: 'Post-Care Follow-ups', icon: Clock },
            ],
          },
        ];

      case 'LAB_TECHNICIAN':
        return [
          {
            id: 'lab-workspace',
            title: 'Diagnostic Laboratory',
            icon: FlaskConical,
            items: [
              { id: 'lab-dashboard', label: 'Lab Orders & Sample Processing', icon: FlaskConical, badge: 'Active' },
              { id: 'admin-labs', label: 'Test Directory & Pricing', icon: FileText },
              { id: 'admin-patients', label: 'Patient Directory', icon: Users },
            ],
          },
        ];

      case 'PHARMACIST':
        return [
          {
            id: 'pharmacy-workspace',
            title: 'Pharmacy & Inventory Control',
            icon: Boxes,
            items: [
              { id: 'admin-inventory', label: 'Inventory Dashboard', icon: LayoutDashboard },
              { id: 'admin-inventory-items', label: 'Formulary & Stock Items', icon: Boxes, badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined },
              { id: 'admin-inventory-movements', label: 'Stock Movements & Ledger', icon: Layers },
              { id: 'admin-inventory-adjustments', label: 'Physical Adjustments', icon: SlidersHorizontal },
              { id: 'admin-prescriptions', label: 'Dispensing Queue (e-Rx)', icon: Pill },
              { id: 'admin-inventory-suppliers', label: 'Suppliers Directory', icon: Building2 },
            ],
          },
        ];

      case 'ACCOUNTANT':
        return [
          {
            id: 'finance-workspace',
            title: 'Financial Revenue & Billing',
            icon: Receipt,
            items: [
              { id: 'accountant-dashboard', label: 'Revenue & Cashflow Dashboard', icon: LayoutDashboard },
              { id: 'admin-billing', label: 'Invoices, POS & Payments', icon: Receipt },
              { id: 'admin-reports', label: 'Financial Analytics & BI', icon: TrendingUp },
            ],
          },
        ];

      case 'PATIENT':
        return [
          {
            id: 'patient-workspace',
            title: 'Patient Health Portal',
            icon: HeartPulse,
            items: [
              { id: 'patient-dashboard', label: 'My Health Dashboard', icon: LayoutDashboard },
              { id: 'patient-appointments', label: 'My Appointments', icon: Calendar },
              { id: 'patient-prescriptions', label: 'My Prescriptions (Rx)', icon: Pill },
              { id: 'patient-reports', label: 'Diagnostic Lab Reports', icon: FlaskConical },
              { id: 'patient-billing', label: 'Invoices & Receipts', icon: Receipt },
              { id: 'patient-documents', label: 'Medical Documents', icon: FolderOpen },
            ],
          },
        ];

      case 'SUPER_ADMIN':
      case 'CLINIC_ADMIN':
      default:
        return fullUnifiedSections;
    }
  };

  const sections = getSectionsForCurrentRole();

  // Accordion State: Track which section IDs are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Initial state: open all sections or at least the section containing currentView
    const initial: Record<string, boolean> = {};
    sections.forEach((sec, idx) => {
      // By default open the first two sections or the active one
      initial[sec.id] = idx === 0 || idx === 1;
    });
    return initial;
  });

  // Automatically expand the section containing the active item
  useEffect(() => {
    sections.forEach((sec) => {
      const containsActive = sec.items.some(
        (item) => currentView === item.id || currentView.startsWith(`${item.id}-`) || (item.id === 'admin-inventory' && currentView.startsWith('admin-inventory'))
      );
      if (containsActive) {
        setOpenSections((prev) => ({ ...prev, [sec.id]: true }));
      }
    });
  }, [currentView, sections]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <aside
      className={`bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 transition-all ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-[calc(100vh-49px)]`}
    >
      <div className="py-3.5 overflow-y-auto">
        {/* Workspace Brand Header */}
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <HeartPulse className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-xs font-bold text-white leading-tight tracking-wide">MEDIERA BACKOFFICE</p>
                <p className="text-[10px] text-teal-400 font-semibold">{currentRole.replace(/_/g, ' ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Office Category Filter (All / Front Office / Back Office) */}
        {!collapsed && currentRole !== 'PATIENT' && (
          <div className="px-3 mb-3">
            <div className="bg-slate-950/80 p-1 rounded-lg border border-slate-800 grid grid-cols-3 gap-1 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setOfficeCategory('all')}
                className={`py-1 rounded text-center transition-all cursor-pointer ${
                  officeCategory === 'all'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setOfficeCategory('front_office')}
                className={`py-1 rounded text-center transition-all cursor-pointer ${
                  officeCategory === 'front_office'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Front Office (Reception, OPD, Triage, Walk-ins)"
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setOfficeCategory('back_office')}
                className={`py-1 rounded text-center transition-all cursor-pointer ${
                  officeCategory === 'back_office'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Back Office (Clinical, Pharmacy, Inventory, Finance, DB)"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Accordion Navigation Sections */}
        <div className="space-y-1 px-2.5">
          {sections.map((section) => {
            const isOpen = openSections[section.id] !== false;
            const SectionIcon = section.icon;

            const isSectionActive = section.items.some(
              (item) => currentView === item.id || currentView.startsWith(`${item.id}-`) || (item.id === 'admin-inventory' && currentView.startsWith('admin-inventory'))
            );

            return (
              <div key={section.id} className="rounded-lg overflow-hidden mb-1">
                {/* Accordion Section Header Toggle */}
                {!collapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${
                      isSectionActive
                        ? 'bg-slate-800/80 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon className={`w-3.5 h-3.5 ${isSectionActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        {section.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="py-1 text-center">
                    <SectionIcon className="w-4 h-4 text-slate-400 mx-auto" />
                  </div>
                )}

                {/* Collapsible Items List */}
                {isOpen && (
                  <div className={`${!collapsed ? 'space-y-0.5 mt-0.5 pl-2 border-l border-slate-800/60 ml-3' : 'space-y-1'}`}>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        currentView === item.id ||
                        currentView.startsWith(`${item.id}-`) ||
                        (item.id === 'admin-inventory' && currentView === 'admin-inventory');

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onNavigate(item.id)}
                          title={collapsed ? item.label : undefined}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all group cursor-pointer ${
                            isActive
                              ? 'bg-teal-600 text-white shadow-xs font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'}`} />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                          </div>

                          {!collapsed && item.badge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                                isActive
                                  ? 'bg-teal-900 text-teal-200'
                                  : 'bg-slate-800 text-teal-400 border border-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>Security Protocol</span>
          <span className="text-emerald-400 font-bold">RBAC Enforced</span>
        </div>
        <div className="mt-0.5 text-[10px] text-slate-500 font-mono flex items-center justify-between">
          <span>MediEra v2.6</span>
          <span className="text-teal-400 font-semibold">PostgreSQL</span>
        </div>
      </div>
    </aside>
  );
};
