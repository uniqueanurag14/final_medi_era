import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { AccountDropdown } from './AccountDropdown';
import { HEADER_NAV_ITEMS, NavItem, normalizePath } from '../../config/navigation';
import {
  HeartPulse,
  Phone,
  Clock,
  Calendar,
  Home,
  Menu,
  X,
  Shield,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenBookingModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenBookingModal,
}) => {
  const { currentRole, currentUser, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeCanonicalPath = normalizePath(currentView);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (path === '/book-appointment') {
      onNavigate('/book-appointment');
    } else {
      onNavigate(path);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-200">
      {/* Top emergency & information banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-teal-400 font-medium">
              <Phone className="w-3.5 h-3.5" />
              <span>24/7 Clinical Helpline: <strong>+1 (800) 555-APEX</strong></span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Mon - Sat: 08:00 AM – 08:00 PM | Sun: Emergency OPD</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline-block text-slate-400">Accredited JCI & ISO 9001 Healthcare Provider</span>
            {!isAuthenticated ? (
              <button
                type="button"
                id="header-erp-login-btn"
                onClick={() => onNavigate('/erp/login')}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1.5 underline underline-offset-2 cursor-pointer"
                title="Go to ERP / CRM Login"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Go to ERP Login</span>
              </button>
            ) : currentRole === 'PATIENT' || currentRole === 'CUSTOMER' ? (
              <button
                type="button"
                id="header-patient-dashboard-btn"
                onClick={() => onNavigate('/dashboard')}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1.5 underline underline-offset-2 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                <span>Patient Dashboard</span>
              </button>
            ) : (
              <button
                type="button"
                id="header-erp-workspace-btn"
                onClick={() => onNavigate('/erp/dashboard')}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1.5 underline underline-offset-2 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Go to ERP Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-3 cursor-pointer select-none"
            aria-label="MediEra Home"
          >
            <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none flex items-center gap-1">
                Medi<span className="text-teal-600 dark:text-teal-400">Era</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">
                Medical CRM + ERP | YantraEra
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            {HEADER_NAV_ITEMS.map((link: NavItem) => {
              const isItemActive = activeCanonicalPath === link.path;

              if (link.iconOnly) {
                return (
                  <a
                    key={link.id}
                    href={link.path}
                    onClick={(e) => handleLinkClick(e, link.path)}
                    aria-label={link.ariaLabel || 'Home'}
                    title={link.ariaLabel || 'Home'}
                    className={`p-2.5 rounded-xl transition-all inline-flex items-center justify-center cursor-pointer ${
                      isItemActive
                        ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                  </a>
                );
              }

              return (
                <a
                  key={link.id}
                  href={link.path}
                  onClick={(e) => handleLinkClick(e, link.path)}
                  className={`px-3.5 py-2 rounded-xl text-sm transition-all font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                    isItemActive
                      ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.icon === 'calendar' && <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <ThemeToggle id="public-header-theme-toggle" />
            <AccountDropdown
              onNavigate={onNavigate}
              onOpenBookingModal={() => onOpenBookingModal()}
            />
            <button
              id="navbar-book-appointment-btn"
              type="button"
              onClick={() => onNavigate('/book-appointment')}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 active:scale-98 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle id="public-mobile-theme-toggle" size="sm" />
            <AccountDropdown
              onNavigate={onNavigate}
              onOpenBookingModal={() => onOpenBookingModal()}
            />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          {HEADER_NAV_ITEMS.map((link: NavItem) => {
            const isItemActive = activeCanonicalPath === link.path;

            return (
              <a
                key={link.id}
                href={link.path}
                onClick={(e) => {
                  handleLinkClick(e, link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between cursor-pointer ${
                  isItemActive
                    ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  {link.iconOnly ? (
                    <>
                      <Home className="w-4 h-4 text-teal-600" />
                      <span>Home</span>
                    </>
                  ) : (
                    <>
                      {link.icon === 'calendar' && <Calendar className="w-4 h-4 text-teal-600" />}
                      <span>{link.label}</span>
                    </>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            );
          })}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onNavigate('/book-appointment');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 text-center shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
