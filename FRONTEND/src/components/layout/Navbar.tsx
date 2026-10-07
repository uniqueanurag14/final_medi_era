import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Activity,
  Sliders,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { ProfileModal } from '../profile/ProfileModal.tsx';

export type NavTab = 'dashboard' | 'users' | 'roles' | 'audit' | 'sessions' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'sessions', label: 'Active Sessions', icon: Activity },
    { id: 'settings', label: 'System Settings', icon: Sliders },
  ];

  return (
    <>
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 shrink-0">
              <div
                onClick={() => onTabChange('dashboard')}
                className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs cursor-pointer"
              >
                <Shield className="w-5 h-5 text-zinc-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => onTabChange('dashboard')}
                    className="font-bold text-zinc-900 tracking-tight text-base sm:text-lg cursor-pointer"
                  >
                    User Governance
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                    PostgreSQL
                  </span>
                </div>
                <p className="text-xs text-zinc-500 hidden md:block">
                  Enterprise User Management System
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 overflow-x-auto py-1 px-2 max-w-full">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3 shrink-0">
              {user && (
                <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200">
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-2 text-left p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                    title="View / Edit Profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user.firstName?.[0] || user.email[0]}
                    </div>
                    <div className="hidden lg:block text-right">
                      <div className="text-xs font-bold text-zinc-900 leading-none mb-1">
                        {user.displayName}
                      </div>
                      <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
                        {user.roleName}
                      </span>
                    </div>
                  </button>

                  <button
                    id="btn-logout"
                    onClick={logout}
                    title="Sign Out"
                    className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};
