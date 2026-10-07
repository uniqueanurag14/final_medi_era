import React from 'react';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { ErrorBoundary } from '../common/ErrorBoundary';

interface PublicLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenBookingModal?: () => void;
  children: React.ReactNode;
}

/**
 * PublicLayout: Layout for the public MediEra website and the Patient/Customer Portal.
 * Preserves the clean healthcare website aesthetic with public Header and Footer.
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentView,
  onNavigate,
  onOpenBookingModal = () => {},
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenBookingModal={onOpenBookingModal}
      />
      <main className="flex-1">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer
        onNavigate={onNavigate}
        onOpenBookingModal={onOpenBookingModal}
      />
    </div>
  );
};
