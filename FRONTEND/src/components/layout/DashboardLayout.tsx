import React from 'react';
import { CrmSidebar } from '../common/CrmSidebar';
import { CrmTopBar } from '../common/CrmTopBar';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface DashboardLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenBookingModal?: () => void;
  onOpenNewPatientModal?: () => void;
  children: React.ReactNode;
}

/**
 * DashboardLayout: Back-office ERP interface layout for MediEra staff, clinicians and administrators.
 * Features sidebar navigation, search top-bar, and workspace canvas.
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentView,
  onNavigate,
  onOpenBookingModal = () => {},
  onOpenNewPatientModal = () => {},
  children,
}) => {
  return (
    <div className="backoffice-workspace flex h-screen overflow-hidden bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <CrmSidebar
        currentView={currentView}
        onNavigate={onNavigate}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CrmTopBar
          onNavigate={onNavigate}
          onOpenBookingModal={onOpenBookingModal}
          onOpenNewPatientModal={onOpenNewPatientModal}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/70 dark:bg-slate-950 transition-colors duration-200">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};
