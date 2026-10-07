import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/mockDatabase';
import { ThemeToggle } from './ThemeToggle';
import { ProfileModal } from '../profile/ProfileModal';
import {
  Search,
  Bell,
  Building2,
  Plus,
  User,
  LogOut,
  Calendar,
  DollarSign,
  FileText,
  UserPlus,
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Globe,
  Edit3,
  Camera,
  KeyRound,
  Shield,
} from 'lucide-react';

interface CrmTopBarProps {
  onNavigate: (view: string) => void;
  onOpenBookingModal: () => void;
  onOpenNewPatientModal: () => void;
}

export const CrmTopBar: React.FC<CrmTopBarProps> = ({
  onNavigate,
  onOpenBookingModal,
  onOpenNewPatientModal,
}) => {
  const { currentUser, currentRole, currentBranch, allBranches, setBranch, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'avatar' | 'password' | 'roles'>('profile');

  const notifications = dbService.notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Global search results across patients, doctors, appointments, invoices
  const patientResults = searchQuery.length >= 2
    ? dbService.patients
        .filter(
          (p) =>
            p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.phone.includes(searchQuery)
        )
        .slice(0, 4)
    : [];

  const doctorResults = searchQuery.length >= 2
    ? dbService.doctors
        .filter(
          (d) =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.specialtyName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  const invoiceResults = searchQuery.length >= 2
    ? dbService.invoices
        .filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.patientName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3)
    : [];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Left: Global Search Bar */}
      <div className="relative w-72 sm:w-96">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Global search (Patient, ID, Doctor, Invoice, Rx)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-teal-600 transition-all"
          />
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchDropdown && searchQuery.length >= 2 && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 max-h-96 overflow-y-auto">
            {patientResults.length === 0 && doctorResults.length === 0 && invoiceResults.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400 dark:text-slate-500">
                No matching clinical records found.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {patientResults.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                      Patients
                    </div>
                    {patientResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          onNavigate(`admin-patient-detail-${p.id}`);
                        }}
                        className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{p.firstName} {p.lastName}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5 font-mono">({p.patientId})</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">{p.phone}</span>
                      </div>
                    ))}
                  </div>
                )}

                {doctorResults.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                      Physicians
                    </div>
                    {doctorResults.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          onNavigate('admin-doctors');
                        }}
                        className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">{d.name}</span>
                        <span className="text-[11px] text-teal-700 dark:text-teal-400">{d.specialtyName}</span>
                      </div>
                    ))}
                  </div>
                )}

                {invoiceResults.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1">
                      Invoices & Billing
                    </div>
                    {invoiceResults.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                          onNavigate('admin-billing');
                        }}
                        className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                        <span className="text-slate-600 dark:text-slate-400">{inv.patientName} (${inv.grandTotal})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="hidden sm:flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Action</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-75" />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-200">
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onOpenBookingModal();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium transition-colors"
              >
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Book New Appointment
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onOpenNewPatientModal();
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium transition-colors"
              >
                <UserPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Register New Patient
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onNavigate('doctor-queue');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium transition-colors"
              >
                <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Open Doctor Queue
              </button>
              <button
                onClick={() => {
                  setShowQuickActions(false);
                  onNavigate('admin-billing');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium transition-colors"
              >
                <DollarSign className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Issue New Bill / Invoice
              </button>
            </div>
          )}
        </div>

        {/* Branch Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{currentBranch.name}</span>
        </div>

        {/* Theme Mode Toggle */}
        <ThemeToggle id="crm-topbar-theme-toggle" />

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                <span className="font-bold text-slate-900 dark:text-white">System Notifications</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold cursor-pointer">Mark all as read</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 hover:bg-teal-50/50 dark:hover:bg-slate-800 transition-colors">
                    <p className="font-bold text-slate-900 dark:text-white">{notif.title}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{notif.message}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002?auto=format&fit=crop&q=80&w=100'}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name.split('(')[0]}</div>
              <div className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">{currentRole.replace('_', ' ')}</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="font-extrabold text-slate-900 dark:text-white truncate text-sm">
                  {currentUser.name} ({currentUser.roleDisplayName || (currentRole === 'SUPER_ADMIN' ? 'Executive Super Admin' : currentRole.replace('_', ' '))})
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{currentUser.email}</p>
              </div>

              {/* View Public Website */}
              <button
                type="button"
                id="crm-view-public-site-link"
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('/');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>View Public Website</span>
              </button>

              {/* My Profile */}
              <button
                type="button"
                id="crm-my-profile-link"
                onClick={() => {
                  setShowUserMenu(false);
                  setProfileModalTab('profile');
                  setIsProfileModalOpen(true);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-bold text-slate-900 dark:text-white transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>My Profile</span>
              </button>

              {/* My Profile Tree Sub-options */}
              <div className="pl-6 pr-2 py-0.5 space-y-0.5 border-l-2 border-teal-500/20 ml-5 my-0.5">
                <button
                  type="button"
                  id="crm-edit-profile-sublink"
                  onClick={() => {
                    setShowUserMenu(false);
                    setProfileModalTab('profile');
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  id="crm-edit-picture-sublink"
                  onClick={() => {
                    setShowUserMenu(false);
                    setProfileModalTab('avatar');
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Edit Profile Picture</span>
                </button>
                <button
                  type="button"
                  id="crm-change-password-sublink"
                  onClick={() => {
                    setShowUserMenu(false);
                    setProfileModalTab('password');
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Change Password</span>
                </button>
                <button
                  type="button"
                  id="crm-access-roles-sublink"
                  onClick={() => {
                    setShowUserMenu(false);
                    setProfileModalTab('roles');
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Access Roles</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
              <button
                type="button"
                id="crm-signout-btn"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  onNavigate('/admin/login');
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 flex items-center gap-2 transition-colors font-bold cursor-pointer"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialTab={profileModalTab}
      />
    </header>
  );
};
