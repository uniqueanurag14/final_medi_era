import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { KeyRound, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { PasswordInput } from '../ui/PasswordInput.tsx';

export const ForcePasswordChangeModal: React.FC = () => {
  const { changePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await changePassword(currentPassword, newPassword);
    if (!res.success) {
      setError(res.message || 'Failed to update password.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-zinc-200">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-amber-600" />
        </div>

        <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
          Mandatory Password Change
        </h3>
        <p className="text-sm text-zinc-600 mt-1 mb-6">
          Your account was provisioned with a temporary password. Please set your secure personal password before proceeding.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
              Current Temporary Password
            </label>
            <PasswordInput
              id="input-current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              autoComplete="current-password"
              iconLeft={<Lock className="w-4 h-4 text-zinc-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
              New Secure Password
            </label>
            <PasswordInput
              id="input-new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              iconLeft={<Lock className="w-4 h-4 text-zinc-400" />}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
              Confirm New Password
            </label>
            <PasswordInput
              id="input-confirm-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              autoComplete="new-password"
              iconLeft={<CheckCircle2 className="w-4 h-4 text-zinc-400" />}
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              id="btn-submit-force-password"
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save & Continue'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="py-2.5 px-4 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-medium text-sm rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
