import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  ChevronDown,
  LogIn,
  UserPlus,
  Calendar,
  CalendarPlus,
  LayoutDashboard,
  LogOut,
  Shield,
  FileText,
} from 'lucide-react';

interface AccountDropdownProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: () => void;
  className?: string;
}

export const AccountDropdown: React.FC<AccountDropdownProps> = ({
  onNavigate,
  onOpenBookingModal,
  className = '',
}) => {
  const { currentUser, currentRole, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (view: string) => {
    setIsOpen(false);
    onNavigate(view);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    onNavigate('/login');
  };

  const isLoggedIn = Boolean(isAuthenticated);
  const isPatient = isLoggedIn && (currentRole === 'PATIENT' || currentRole === 'CUSTOMER');
  const isSuperAdmin = isLoggedIn && currentRole === 'SUPER_ADMIN';
  const isStaff = isLoggedIn && !isPatient && !isSuperAdmin;

  // Determine back office target based on role
  const getCrmBackOfficeTarget = () => {
    if (currentRole === 'DOCTOR') return '/erp/doctor-queue';
    if (currentRole === 'RECEPTIONIST') return '/erp/appointments';
    if (currentRole === 'NURSE') return '/erp/doctor-queue';
    if (currentRole === 'LAB_TECHNICIAN') return '/erp/labs';
    if (currentRole === 'PHARMACIST') return '/erp/inventory';
    if (currentRole === 'ACCOUNTANT') return '/erp/billing';
    return '/erp/dashboard';
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Account Trigger Button */}
      <button
        type="button"
        id="account-dropdown-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
      >
        {isLoggedIn ? (
          <>
            <div className="w-6 h-6 rounded-full bg-teal-600/10 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser?.name?.charAt(0) || <User className="w-3.5 h-3.5" />}
            </div>
            <span className="max-w-[120px] truncate text-xs font-bold">
              {currentUser?.name?.split(' ')[0] || 'My Account'}
            </span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Login</span>
          </>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="account-dropdown-menu"
          className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs text-slate-700 dark:text-slate-200"
        >
          {/* Status Header if logged in */}
          {isLoggedIn && (
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="font-extrabold text-slate-900 dark:text-white truncate text-sm">
                {currentUser?.name}
              </p>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold tracking-wide uppercase mt-0.5">
                {isPatient ? 'Patient Portal' : currentRole?.replace('_', ' ')}
              </p>
            </div>
          )}

          {/* 1. BEFORE LOGIN STATE */}
          {!isLoggedIn && (
            <div className="space-y-1">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="font-extrabold text-slate-900 dark:text-white">
                  Patient Portal Access
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Sign in or create a patient account
                </p>
              </div>

              {/* 1. A) Patient Login */}
              <button
                type="button"
                id="account-patient-login-link"
                onClick={() => handleNavigate('/login')}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Patient Login</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Access appointments &amp; records</span>
                </div>
              </button>

              {/* 1. B) Patient Registration */}
              <button
                type="button"
                id="account-patient-register-link"
                onClick={() => handleNavigate('/registration')}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">Patient Registration</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">New patient? Register here</span>
                </div>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1.5" />

              {/* CRM / ERP Staff Login link */}
              <button
                type="button"
                id="account-erp-login-link"
                onClick={() => handleNavigate('/erp/login')}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium cursor-pointer text-[11px]"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Go to ERP / CRM Login</span>
              </button>
            </div>
          )}

          {/* 2. AFTER LOGIN (PATIENT) */}
          {isLoggedIn && isPatient && (
            <div className="space-y-0.5">
              {/* 1. A ) Patient Dashboard */}
              <button
                type="button"
                id="patient-dashboard-link"
                onClick={() => handleNavigate('/dashboard')}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-bold text-teal-700 dark:text-teal-400 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Patient Dashboard</span>
              </button>

              {/* 1. B ) My Profile */}
              <button
                type="button"
                id="patient-profile-link"
                onClick={() => handleNavigate('/profile')}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <User className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>My Profile</span>
              </button>

              {/* 1. C ) My Appointments */}
              <button
                type="button"
                id="patient-appointments-link"
                onClick={() => handleNavigate('/appointments')}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>My Appointments</span>
              </button>

              {/* 1. D ) Book Appointment */}
              <button
                type="button"
                id="patient-book-appointment-link"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenBookingModal) {
                    onOpenBookingModal();
                  } else {
                    onNavigate('/book-appointment');
                  }
                }}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Book Appointment</span>
              </button>

              {/* etc ... Invoices & Payments */}
              <button
                type="button"
                id="patient-invoices-link"
                onClick={() => handleNavigate('/dashboard')}
                className="w-full text-left px-4 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>Invoices &amp; Payments</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                type="button"
                id="patient-logout-btn"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* 3. LOGGED-IN STAFF EMPLOYEE STATE */}
          {isLoggedIn && isStaff && (
            <div className="space-y-0.5">
              <button
                type="button"
                id="staff-profile-link"
                onClick={() => handleNavigate(getCrmBackOfficeTarget())}
                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <User className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                id="staff-crm-link"
                onClick={() => handleNavigate(getCrmBackOfficeTarget())}
                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>CRM / Back Office</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <button
                type="button"
                id="staff-logout-btn"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* 4. LOGGED-IN SUPER ADMIN STATE */}
          {isLoggedIn && isSuperAdmin && (
            <div className="space-y-0.5">
              <button
                type="button"
                id="admin-profile-link"
                onClick={() => handleNavigate('admin-settings')}
                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>Super Admin Profile</span>
              </button>
              <button
                type="button"
                id="admin-crm-link"
                onClick={() => handleNavigate('admin-dashboard')}
                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>CRM / Back Office</span>
              </button>
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <button
                type="button"
                id="admin-logout-btn"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 font-semibold cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
