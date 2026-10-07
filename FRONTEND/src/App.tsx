import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { dbService } from './services/mockDatabase';
import { Invoice } from './types';

// Modals
import { BookAppointmentModal } from './components/modals/BookAppointmentModal';
import { NewPatientModal } from './components/modals/NewPatientModal';
import { CollectPaymentModal } from './components/modals/CollectPaymentModal';
import { PrintDocumentModal } from './components/modals/PrintDocumentModal';

// Layouts
import { CrmSidebar } from './components/common/CrmSidebar';
import { CrmTopBar } from './components/common/CrmTopBar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages
import { PublicHomePage } from './pages/public/PublicHomePage';
import { PublicAboutPage } from './pages/public/PublicAboutPage';
import { PublicFaqPage } from './pages/public/PublicFaqPage';
import { PublicDoctorsPage } from './pages/public/PublicDoctorsPage';
import { PublicDoctorDetailPage } from './pages/public/PublicDoctorDetailPage';
import { PublicSpecialtiesPage } from './pages/public/PublicSpecialtiesPage';
import { PublicServicesPage } from './pages/public/PublicServicesPage';
import { PublicPackagesPage } from './pages/public/PublicPackagesPage';
import { PublicContactPage } from './pages/public/PublicContactPage';
import { PublicLoginPage } from './pages/public/PublicLoginPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AccessDeniedPage } from './components/common/AccessDeniedPage';
import { PublicBookAppointmentPage } from './pages/public/PublicBookAppointmentPage';
import { normalizePath, updateSEO } from './config/navigation';

// Internal CRM Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminPatientsPage } from './pages/admin/AdminPatientsPage';
import { AdminPatientDetailPage } from './pages/admin/AdminPatientDetailPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminBillingPage } from './pages/admin/AdminBillingPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminLabsPage } from './pages/admin/AdminLabsPage';
import { AdminPrescriptionsPage } from './pages/admin/AdminPrescriptionsPage';
import { AdminLeadsPage } from './pages/admin/AdminLeadsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminFollowupsPage } from './pages/admin/AdminFollowupsPage';
import { AdminCampaignsPage } from './pages/admin/AdminCampaignsPage';
import { AdminSegmentsPage } from './pages/admin/AdminSegmentsPage';
import { AdminAutomationPage } from './pages/admin/AdminAutomationPage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminTemplatesPage } from './pages/admin/AdminTemplatesPage';
import { AdminReferralsPage } from './pages/admin/AdminReferralsPage';
import { AdminMigrationsPage } from './pages/admin/AdminMigrationsPage';
import { AdminOrganizationsPage } from './pages/admin/AdminOrganizationsPage';
import { AdminBranchesPage } from './pages/admin/AdminBranchesPage';
import { AdminEmployeesPage } from './pages/admin/AdminEmployeesPage';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage';
import { AdminDesignationsPage } from './pages/admin/AdminDesignationsPage';
import { AdminUserArchetypesPage } from './pages/admin/AdminUserArchetypesPage';
import { AdminRolesPage } from './pages/admin/AdminRolesPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';

// Doctor & Patient Portals
import { DoctorQueuePage } from './pages/doctor/DoctorQueuePage';
import { PatientDashboardPage } from './pages/patient/PatientDashboardPage';

function ClinicAppContent() {
  const { currentRole, currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname) {
      return normalizePath(window.location.pathname);
    }
    return '/';
  });

  // Global Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPrefillDoctorId, setBookingPrefillDoctorId] = useState<
    string | undefined
  >();
  const [bookingPrefillSpecialtyId, setBookingPrefillSpecialtyId] = useState<
    string | undefined
  >();
  const [bookingPrefillService, setBookingPrefillService] = useState<
    string | undefined
  >();

  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] =
    useState<Invoice | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocType, setPrintDocType] = useState<
    'prescription' | 'invoice' | 'lab_report' | 'token'
  >('prescription');
  const [printDocData, setPrintDocData] = useState<any>(null);

  // Sync browser back/forward and initial URL state
  useEffect(() => {
    const onPopState = () => {
      const canonical = normalizePath(window.location.pathname);
      setCurrentView(canonical);
      updateSEO(canonical);
    };

    window.addEventListener('popstate', onPopState);

    // Initial canonical sync
    const initialCanonical = normalizePath(window.location.pathname);
    if (window.location.pathname !== initialCanonical) {
      window.history.replaceState(
        { path: initialCanonical },
        '',
        initialCanonical,
      );
    }
    updateSEO(initialCanonical);

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Centralized, type-safe navigation handler with history & SEO update
  const handleNavigate = (targetPath: string) => {
    if (typeof targetPath !== 'string') return;
    const canonical = normalizePath(targetPath);
    setCurrentView(canonical);

    if (typeof window !== 'undefined') {
      if (window.location.pathname !== canonical) {
        window.history.pushState({ path: canonical }, '', canonical);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    updateSEO(canonical);
  };

  // Helper to open booking modal with optional prefill - DEFENSIVE AGAINST NON-STRINGS
  const handleOpenBookingModal = (
    doctorIdOrService?: unknown,
    specialtyId?: string,
    serviceName?: string,
  ) => {
    if (typeof doctorIdOrService === 'string') {
      if (
        !doctorIdOrService.startsWith('doc-') &&
        !specialtyId &&
        !serviceName
      ) {
        setBookingPrefillDoctorId(undefined);
        setBookingPrefillSpecialtyId(undefined);
        setBookingPrefillService(doctorIdOrService);
      } else {
        setBookingPrefillDoctorId(doctorIdOrService);
        setBookingPrefillSpecialtyId(specialtyId);
        setBookingPrefillService(serviceName);
      }
    } else {
      setBookingPrefillDoctorId(undefined);
      setBookingPrefillSpecialtyId(undefined);
      setBookingPrefillService(undefined);
    }
    setIsBookingModalOpen(true);
  };

  // Helper to open payment collection modal
  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedPaymentInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  // Helper to open print modal
  const handleOpenPrintModal = (
    type: 'prescription' | 'invoice' | 'lab_report' | 'token',
    data: any,
  ) => {
    setPrintDocType(type);
    setPrintDocData(data);
    setIsPrintModalOpen(true);
  };

  // Canonical path evaluation
  const canonicalView = normalizePath(currentView);
  const isDoctorDetail =
    canonicalView.startsWith('/doctors/') ||
    (typeof currentView === 'string' &&
      currentView.startsWith('doctor-detail-'));
  const doctorDetailId = isDoctorDetail
    ? canonicalView.startsWith('/doctors/')
      ? canonicalView.replace('/doctors/', '')
      : currentView.replace('doctor-detail-', '')
    : '';

  // User Authentication & Role Resolution
  const isAuthenticated = Boolean(
    currentUser &&
    currentUser.active &&
    currentUser.id !== 'usr-unauthenticated',
  );
  const isPatient = Boolean(
    isAuthenticated &&
    (currentRole === 'PATIENT' || currentRole === 'CUSTOMER'),
  );
  const isSuperAdmin = Boolean(
    isAuthenticated &&
    (currentRole === 'SUPER_ADMIN' || currentUser?.isSuperAdmin),
  );
  const isErpStaff = Boolean(isAuthenticated && !isPatient);

  // 1. CRM/ERP Auth Routes & Attempted public registration
  const isErpLoginView =
    canonicalView === '/erp/login' ||
    canonicalView === '/admin/login' ||
    currentView === 'erp-login';
  const isErpRegisterAttempt =
    canonicalView === '/erp/registration' ||
    canonicalView === '/erp/register' ||
    currentView === 'erp-register';

  // 2. Patient Auth Routes
  const isPatientLoginView =
    canonicalView === '/login' ||
    currentView === 'login' ||
    currentView === 'public-login';
  const isPatientRegisterView =
    canonicalView === '/registration' ||
    canonicalView === '/register' ||
    currentView === 'register' ||
    currentView === 'public-register';

  // 3. Patient Protected Routes (Personal data & pages strictly require authenticated PATIENT session)
  const isPatientProtectedRoute =
    canonicalView === '/dashboard' ||
    canonicalView === '/profile' ||
    canonicalView === '/my-profile' ||
    canonicalView === '/appointments' ||
    canonicalView === '/my-appointments' ||
    canonicalView === '/booking-confirmation' ||
    canonicalView === '/confirmation' ||
    canonicalView === '/invoices' ||
    canonicalView === '/history' ||
    canonicalView === '/medical-history' ||
    canonicalView.startsWith('/patient') ||
    currentView === 'dashboard' ||
    currentView === 'profile' ||
    currentView === 'my-profile' ||
    currentView === 'appointments' ||
    currentView === 'my-appointments' ||
    currentView === 'booking-confirmation' ||
    currentView === 'patient-dashboard' ||
    currentView === 'patient-profile' ||
    currentView === 'patient-appointments' ||
    currentView === 'patient-invoices' ||
    currentView === 'patient-history' ||
    currentView === 'patient-referrals';

  // 4. Public Informational Routes
  const publicRoutes = [
    '/',
    '/specialities',
    '/services',
    '/doctors',
    '/health-packages',
    '/book-appointment',
    '/about-us',
    '/contact-us',
    '/faq',
  ];
  const isPublicMarketingView =
    publicRoutes.includes(canonicalView) ||
    isDoctorDetail ||
    [
      'home',
      'public-home',
      'about',
      'public-about',
      'faq',
      'public-faq',
      'doctors',
      'public-doctors',
      'specialties',
      'public-specialties',
      'services',
      'public-services',
      'packages',
      'public-packages',
      'contact',
      'public-contact',
      'book-appointment',
    ].includes(currentView);

  // 5. CRM / ERP Routes
  const isErpRoute =
    !isPublicMarketingView &&
    !isPatientLoginView &&
    !isPatientRegisterView &&
    !isPatientProtectedRoute &&
    !isErpLoginView &&
    !isErpRegisterAttempt;

  // Check if current ERP route requires Super Admin
  const isSuperAdminRoute =
    [
      '/erp/users',
      '/erp/admin/users',
      '/erp/organizations',
      '/erp/admin/organizations',
      '/erp/branches',
      '/erp/admin/branches',
      '/erp/roles',
      '/erp/admin/roles',
      '/erp/settings',
      '/erp/admin/settings',
      '/erp/audit-logs',
      '/erp/admin/audit-logs',
      '/erp/migrations',
    ].includes(canonicalView) ||
    [
      'admin-employees',
      'admin-departments',
      'admin-designations',
      'admin-user-archetypes',
      'admin-organizations',
      'admin-branches',
      'admin-roles',
      'admin-settings',
      'admin-audit-logs',
      'admin-migrations',
    ].includes(currentView);

  // --- 1. CRM/ERP REGISTRATION ATTEMPT (DOES NOT EXIST) ---
  if (isErpRegisterAttempt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header
          currentView={canonicalView}
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
        <main className="flex-1">
          <AccessDeniedPage
            status={404}
            title="Registration Not Available"
            message="Public self-registration for the CRM/ERP Back Office does not exist. CRM/ERP user accounts and healthcare staff credentials are created internally by the Super Administrator."
            primaryActionLabel="CRM/ERP Sign In"
            primaryActionPath="/erp/login"
            secondaryActionLabel="Return Home"
            secondaryActionPath="/"
            onNavigate={handleNavigate}
          />
        </main>
        <Footer
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      </div>
    );
  }

  // --- 2. CRM/ERP LOGIN PORTAL (/erp/login) ---
  if (isErpLoginView) {
    if (isPatient) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
          <Header
            currentView={canonicalView}
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
          <main className="flex-1">
            <AccessDeniedPage
              status={403}
              title="Access Denied: Patient Account"
              message="Patient accounts are strictly prohibited from accessing CRM/ERP Back Office login. Please return to your Patient Portal."
              primaryActionLabel="Return to Patient Dashboard"
              primaryActionPath="/dashboard"
              secondaryActionLabel="Sign Out"
              secondaryActionPath="/login"
              onNavigate={handleNavigate}
            />
          </main>
          <Footer
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
        </div>
      );
    }
    return <AdminLoginPage onNavigate={handleNavigate} />;
  }

  // --- 3. PATIENT AUTHENTICATION ROUTES (/login, /registration) ---
  if (isPatientLoginView || isPatientRegisterView) {
    if (isErpStaff || isSuperAdmin) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
          <Header
            currentView={canonicalView}
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
          <main className="flex-1">
            <AccessDeniedPage
              status={403}
              title="CRM/ERP Staff Logged In"
              message={`You are currently signed in with a CRM/ERP staff account (${currentUser?.email}). The Patient Portal login is exclusively for Patients.`}
              primaryActionLabel="Go to CRM/ERP Workspace"
              primaryActionPath="/erp/dashboard"
              secondaryActionLabel="Sign Out"
              secondaryActionPath="/login"
              onNavigate={handleNavigate}
            />
          </main>
          <Footer
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header
          currentView={canonicalView}
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
        <main className="flex-1">
          <ErrorBoundary>
            <PublicLoginPage
              initialMode={isPatientRegisterView ? 'register' : 'login'}
              initialPortal="patient"
              onNavigate={handleNavigate}
            />
          </ErrorBoundary>
        </main>
        <Footer
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      </div>
    );
  }

  // --- 4. PATIENT PROTECTED ROUTES (/dashboard, /profile, /appointments) ---
  if (isPatientProtectedRoute) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
          <Header
            currentView={canonicalView}
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
          <main className="flex-1">
            <AccessDeniedPage
              status={401}
              title="Patient Sign In Required"
              message="Please sign in to your Patient account to access your personal dashboard, appointments, and medical charts."
              primaryActionLabel="Sign In as Patient"
              primaryActionPath="/login"
              secondaryActionLabel="Register as Patient"
              secondaryActionPath="/registration"
              onNavigate={handleNavigate}
            />
          </main>
          <Footer
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
        </div>
      );
    }

    if (isErpStaff || isSuperAdmin) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
          <Header
            currentView={canonicalView}
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
          <main className="flex-1">
            <AccessDeniedPage
              status={403}
              title="Access Restricted to Patients"
              message="CRM/ERP staff accounts cannot access patient portal routes directly. Please switch to your Patient account or return to the CRM/ERP workspace."
              primaryActionLabel="Go to CRM/ERP Workspace"
              primaryActionPath="/erp/dashboard"
              secondaryActionLabel="Sign Out"
              secondaryActionPath="/login"
              onNavigate={handleNavigate}
            />
          </main>
          <Footer
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
          />
        </div>
      );
    }

    // Authenticated Patient rendering
    const patientTab =
      canonicalView === '/profile' ||
      canonicalView === '/my-profile' ||
      currentView === 'patient-profile' ||
      currentView === 'profile' ||
      currentView === 'my-profile'
        ? 'profile'
        : canonicalView === '/appointments' ||
            canonicalView === '/my-appointments' ||
            canonicalView === '/booking-confirmation' ||
            canonicalView === '/confirmation' ||
            currentView === 'patient-appointments' ||
            currentView === 'appointments' ||
            currentView === 'my-appointments'
          ? 'appointments'
          : currentView.includes('invoice') || currentView.includes('billing')
            ? 'invoices'
            : currentView.includes('history')
              ? 'history'
              : currentView.includes('referral')
                ? 'referrals'
                : 'overview';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header
          currentView={canonicalView}
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
        <main className="flex-1">
          <ErrorBoundary>
            <PatientDashboardPage
              initialTab={patientTab}
              onOpenBookingModal={() => handleOpenBookingModal()}
              onOpenPrintModal={handleOpenPrintModal}
              onOpenPaymentModal={handleOpenPaymentModal}
              onNavigate={handleNavigate}
            />
          </ErrorBoundary>
        </main>
        <Footer
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      </div>
    );
  }

  // --- 5. PUBLIC INFORMATIONAL ROUTES ---
  if (isPublicMarketingView) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header
          currentView={canonicalView}
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
        <main className="flex-1">
          <ErrorBoundary>
            {canonicalView === '/' && (
              <PublicHomePage
                onNavigate={handleNavigate}
                onOpenBookingModal={() => handleOpenBookingModal()}
              />
            )}
            {canonicalView === '/specialities' && (
              <PublicSpecialtiesPage
                onNavigate={handleNavigate}
                onOpenBookingModal={(docId, specId) =>
                  handleOpenBookingModal(docId, specId)
                }
              />
            )}
            {canonicalView === '/services' && (
              <PublicServicesPage
                onNavigate={handleNavigate}
                onOpenBookingModal={(serviceName) =>
                  handleOpenBookingModal(serviceName)
                }
              />
            )}
            {canonicalView === '/doctors' && (
              <PublicDoctorsPage
                onNavigate={handleNavigate}
                onOpenBookingModal={(docId, specId) =>
                  handleOpenBookingModal(docId, specId)
                }
              />
            )}
            {isDoctorDetail && (
              <PublicDoctorDetailPage
                doctorId={doctorDetailId}
                onNavigate={handleNavigate}
                onOpenBookingModal={(docId, specId) =>
                  handleOpenBookingModal(docId, specId)
                }
              />
            )}
            {canonicalView === '/health-packages' && (
              <PublicPackagesPage
                onNavigate={handleNavigate}
                onOpenBookingModal={(pkgName) =>
                  handleOpenBookingModal(pkgName)
                }
              />
            )}
            {canonicalView === '/book-appointment' && (
              <PublicBookAppointmentPage
                onNavigate={handleNavigate}
                prefilledDoctorId={bookingPrefillDoctorId}
                prefilledSpecialtyId={bookingPrefillSpecialtyId}
                prefilledService={bookingPrefillService}
                onOpenPrintModal={handleOpenPrintModal}
              />
            )}
            {canonicalView === '/about-us' && (
              <PublicAboutPage
                onNavigate={handleNavigate}
                onOpenBookingModal={() => handleOpenBookingModal()}
              />
            )}
            {canonicalView === '/contact-us' && (
              <PublicContactPage onNavigate={handleNavigate} />
            )}
            {canonicalView === '/faq' && (
              <PublicFaqPage
                onNavigate={handleNavigate}
                onOpenBookingModal={() => handleOpenBookingModal()}
              />
            )}
          </ErrorBoundary>
        </main>
        <Footer
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      </div>
    );
  }

  // --- 6. CRM / ERP BACK-OFFICE ROUTES (PROTECTED) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header
          currentView={canonicalView}
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
        <main className="flex-1">
          <AccessDeniedPage
            status={401}
            title="Authentication Required"
            message="Please sign in to the MediEra CRM/ERP back-office system to access clinical operations, appointments, and administration."
            primaryActionLabel="CRM/ERP Sign In"
            primaryActionPath="/erp/login"
            secondaryActionLabel="Return to Public Site"
            secondaryActionPath="/"
            onNavigate={handleNavigate}
          />
        </main>
        <Footer
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      </div>
    );
  }

  if (isPatient) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Header
          currentView={canonicalView}
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
        <main className="flex-1">
          <AccessDeniedPage
            status={403}
            title="Access Forbidden: Patients Prohibited"
            message="Patient accounts are strictly prohibited from accessing CRM/ERP back-office routes and clinical administration."
            primaryActionLabel="Return to Patient Dashboard"
            primaryActionPath="/dashboard"
            secondaryActionLabel="Sign Out"
            secondaryActionPath="/login"
            onNavigate={handleNavigate}
          />
        </main>
        <Footer
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
        />
      </div>
    );
  }

  if (isSuperAdminRoute && !isSuperAdmin) {
    return (
      <div className="backoffice-workspace flex h-screen overflow-hidden bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <CrmSidebar currentView={currentView} onNavigate={handleNavigate} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CrmTopBar
            onNavigate={handleNavigate}
            onOpenBookingModal={() => handleOpenBookingModal()}
            onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70 dark:bg-slate-950">
            <AccessDeniedPage
              status={403}
              title="Super Administrator Privileges Required"
              message={`Access Denied: Only authorized Super Administrators can manage CRM/ERP users, branch networks, roles, and system settings. Your current staff role (${currentRole}) is not permitted.`}
              primaryActionLabel="Return to Workspace Dashboard"
              primaryActionPath="/erp/dashboard"
              secondaryActionLabel="Return to Public Site"
              secondaryActionPath="/"
              onNavigate={handleNavigate}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="backoffice-workspace flex h-screen overflow-hidden bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <CrmSidebar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar Header */}
        <CrmTopBar
          onNavigate={handleNavigate}
          onOpenBookingModal={() => handleOpenBookingModal()}
          onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70 dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              {(currentView === 'admin-dashboard' ||
                currentView === '/admin/dashboard' ||
                currentView === '/erp/dashboard' ||
                currentView === '/erp' ||
                currentView === 'erp-dashboard') &&
                (currentRole === 'DOCTOR' ? (
                  <DoctorQueuePage
                    onOpenPrintModal={handleOpenPrintModal}
                    onNavigate={handleNavigate}
                  />
                ) : currentRole === 'RECEPTIONIST' ? (
                  <AdminAppointmentsPage
                    onNavigate={handleNavigate}
                    onOpenBookingModal={() => handleOpenBookingModal()}
                    onOpenPrintModal={handleOpenPrintModal}
                  />
                ) : currentRole === 'ACCOUNTANT' ? (
                  <AdminBillingPage
                    onNavigate={handleNavigate}
                    onOpenPrintModal={handleOpenPrintModal}
                    onOpenPaymentModal={handleOpenPaymentModal}
                  />
                ) : currentRole === 'PHARMACIST' ? (
                  <AdminInventoryPage onNavigate={handleNavigate} />
                ) : (
                  <AdminDashboardPage
                    onNavigate={handleNavigate}
                    onOpenBookingModal={() => handleOpenBookingModal()}
                    onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
                  />
                ))}

              {(currentView === 'admin-patients' ||
                currentView === '/admin/patients') && (
                <AdminPatientsPage
                  onNavigate={handleNavigate}
                  onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                />
              )}

              {currentView.startsWith('admin-patient-detail-') && (
                <AdminPatientDetailPage
                  patientId={currentView.replace('admin-patient-detail-', '')}
                  onNavigate={handleNavigate}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                  onOpenPrintModal={handleOpenPrintModal}
                  onOpenPaymentModal={handleOpenPaymentModal}
                />
              )}

              {(currentView === 'admin-appointments' ||
                currentView === '/admin/appointments' ||
                currentView === 'reception-queue') && (
                <AdminAppointmentsPage
                  onNavigate={handleNavigate}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                  onOpenPrintModal={handleOpenPrintModal}
                />
              )}

              {(currentView === 'admin-doctors' ||
                currentView === '/admin/doctors') && (
                <AdminDoctorsPage
                  onNavigate={handleNavigate}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                />
              )}

              {(currentView === 'admin-billing' ||
                currentView === '/admin/billing') && (
                <AdminBillingPage
                  onNavigate={handleNavigate}
                  onOpenPrintModal={handleOpenPrintModal}
                  onOpenPaymentModal={handleOpenPaymentModal}
                />
              )}

              {(currentView.startsWith('admin-inventory') ||
                currentView === 'pharmacy-pos' ||
                currentView === 'pharmacy-dashboard') && (
                <AdminInventoryPage
                  onNavigate={handleNavigate}
                  initialTab={
                    currentView === 'admin-inventory-items'
                      ? 'items'
                      : currentView === 'admin-inventory-movements'
                        ? 'movements'
                        : currentView === 'admin-inventory-adjustments'
                          ? 'adjustments'
                          : currentView === 'admin-inventory-suppliers'
                            ? 'suppliers'
                            : 'dashboard'
                  }
                />
              )}

              {(currentView === 'admin-labs' ||
                currentView === 'lab-workstation') && (
                <AdminLabsPage
                  onNavigate={handleNavigate}
                  onOpenPrintModal={handleOpenPrintModal}
                />
              )}

              {currentView === 'admin-prescriptions' && (
                <AdminPrescriptionsPage
                  onNavigate={handleNavigate}
                  onOpenPrintModal={handleOpenPrintModal}
                />
              )}

              {currentView === 'admin-leads' && (
                <AdminLeadsPage
                  onNavigate={handleNavigate}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                />
              )}

              {(currentView === 'admin-followups' ||
                currentView === 'doctor-followups') && (
                <AdminFollowupsPage
                  onNavigate={handleNavigate}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                />
              )}

              {currentView === 'admin-campaigns' && (
                <AdminCampaignsPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-segments' && (
                <AdminSegmentsPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-automation' && (
                <AdminAutomationPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-feedback' && (
                <AdminFeedbackPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-templates' && (
                <AdminTemplatesPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-referrals' && (
                <AdminReferralsPage onNavigate={handleNavigate} />
              )}

              {(currentView === 'admin-services' ||
                currentView === 'admin-packages') && (
                <AdminServicesPage
                  onNavigate={handleNavigate}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                />
              )}

              {currentView === 'admin-specialities' && (
                <AdminSettingsPage onNavigate={handleNavigate} />
              )}

              {(currentView === 'admin-staff' ||
                currentView === 'admin-consultations') && (
                <AdminDoctorsPage
                  onNavigate={handleNavigate}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                />
              )}

              {currentView === 'admin-reports' && (
                <AdminReportsPage onNavigate={handleNavigate} />
              )}

              {(currentView === 'admin-settings' ||
                currentView === '/admin/settings') && (
                <AdminSettingsPage onNavigate={handleNavigate} />
              )}

              {(currentView === 'admin-audit-logs' ||
                currentView === '/admin/audit-logs' ||
                currentView === 'audit-logs' ||
                currentView === '/audit-logs') && (
                <AdminAuditLogsPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-migrations' && <AdminMigrationsPage />}

              {currentView === 'admin-organizations' && (
                <AdminOrganizationsPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-branches' && (
                <AdminBranchesPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-employees' && (
                <AdminEmployeesPage onNavigate={handleNavigate} />
              )}

              {currentView === 'admin-roles' && (
                <AdminRolesPage onNavigate={handleNavigate} />
              )}

              {(currentView === 'doctor-queue' ||
                currentView === 'nurse-dashboard' ||
                currentView === 'doctor-appointments') && (
                <DoctorQueuePage
                  onOpenPrintModal={handleOpenPrintModal}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'doctor-patients' && (
                <AdminPatientsPage
                  onNavigate={handleNavigate}
                  onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                />
              )}

              {currentView === 'doctor-prescriptions' && (
                <AdminPrescriptionsPage
                  onNavigate={handleNavigate}
                  onOpenPrintModal={handleOpenPrintModal}
                />
              )}

              {(currentView === 'reception-dashboard' ||
                currentView === 'reception-appointments') && (
                <AdminAppointmentsPage
                  onNavigate={handleNavigate}
                  onOpenBookingModal={() => handleOpenBookingModal()}
                  onOpenPrintModal={handleOpenPrintModal}
                />
              )}

              {currentView === 'lab-dashboard' && (
                <AdminLabsPage
                  onNavigate={handleNavigate}
                  onOpenPrintModal={handleOpenPrintModal}
                />
              )}

              {currentView === 'accountant-dashboard' && (
                <AdminBillingPage
                  onNavigate={handleNavigate}
                  onOpenPrintModal={handleOpenPrintModal}
                  onOpenPaymentModal={handleOpenPaymentModal}
                />
              )}

              {(currentView.startsWith('patient-') ||
                currentView.startsWith('/patient') ||
                currentView === 'patient-portal') && (
                <PatientDashboardPage
                  key={currentView}
                  initialTab={
                    currentView.includes('profile')
                      ? 'profile'
                      : currentView.includes('home-visit')
                        ? 'book-home-visit'
                        : currentView.includes('appointments')
                          ? 'appointments'
                          : currentView.includes('billing') ||
                              currentView.includes('invoices')
                            ? 'invoices'
                            : currentView.includes('history') ||
                                currentView.includes('prescriptions') ||
                                currentView.includes('reports')
                              ? 'history'
                              : currentView.includes('referral')
                                ? 'referrals'
                                : currentView.includes('book')
                                  ? 'book-appointment'
                                  : 'overview'
                  }
                  onOpenBookingModal={() => handleOpenBookingModal()}
                  onOpenPrintModal={handleOpenPrintModal}
                  onOpenPaymentModal={handleOpenPaymentModal}
                  onNavigate={handleNavigate}
                />
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* GLOBAL MODALS */}
      <BookAppointmentModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={(appt) => {
          handleOpenPrintModal('token', { appointment: appt });
        }}
        prefilledDoctorId={bookingPrefillDoctorId}
        prefilledSpecialtyId={bookingPrefillSpecialtyId}
        prefilledService={bookingPrefillService}
      />

      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSuccess={(newPatient) => {
          handleNavigate(`admin-patient-detail-${newPatient.id}`);
        }}
      />

      {selectedPaymentInvoice && (
        <CollectPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPaymentInvoice(null);
          }}
          invoice={selectedPaymentInvoice}
          onPaymentSuccess={(updatedInv) => {
            handleOpenPrintModal('invoice', { invoice: updatedInv });
          }}
        />
      )}

      {printDocData && (
        <PrintDocumentModal
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false);
            setPrintDocData(null);
          }}
          documentType={printDocType}
          data={printDocData}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ClinicAppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
