import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { apiRequest } from '../../api/client.ts';
import { User, Shield, Lock, CheckCircle2, AlertCircle, X, KeyRound } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { PasswordInput } from '../ui/PasswordInput.tsx';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser, changePassword } = useAuth();
  const { preference, setPreference } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setDisplayName(user.displayName || '');
      setThemePreference((user.themePreference as any) || 'system');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    // Immediately apply selected theme preference
    setPreference(themePreference);

    const res = await apiRequest('/api/v1/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        firstName,
        lastName,
        displayName,
        themePreference,
      }),
    });

    setSavingProfile(false);
    if (res.success) {
      setProfileMsg({ text: 'Profile details saved successfully.', type: 'success' });
      refreshUser();
    } else {
      setProfileMsg({ text: res.error?.message || 'Failed to update profile.', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassMsg({ text: 'Please fill in all password fields.', type: 'error' });
      return;
    }
    if (newPassword.length < 8) {
      setPassMsg({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }

    setChangingPass(true);
    setPassMsg(null);

    const res = await changePassword(currentPassword, newPassword);
    setChangingPass(false);

    if (res.success) {
      setPassMsg({ text: 'Password updated successfully.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPassMsg({ text: res.message || 'Failed to update password.', type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
          <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center text-lg font-bold">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">{user.displayName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-500">{user.email}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase tracking-wider">
                <Shield className="w-3 h-3 text-zinc-600" />
                {user.roleName}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Profile Information</h3>

          {profileMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
              Theme Preference
            </label>
            <select
              value={themePreference}
              onChange={(e) => {
                const val = e.target.value as any;
                setThemePreference(val);
                setPreference(val);
              }}
              className="block w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
            >
              <option value="system">System Default</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <form onSubmit={handleChangePassword} className="space-y-4 pt-6 border-t border-zinc-200">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Change Password</h3>
          </div>

          {passMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                passMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {passMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{passMsg.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
              Current Password
            </label>
            <PasswordInput
              id="profile-modal-current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                New Password
              </label>
              <PasswordInput
                id="profile-modal-new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                Confirm Password
              </label>
              <PasswordInput
                id="profile-modal-confirm-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              disabled={changingPass}
              className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center text-xs text-zinc-400">
          <span>Member since {formatDateTime(user.createdAt)}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
