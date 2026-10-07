import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Building2,
  ArrowLeft,
  Shield,
  KeyRound,
  User,
} from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (view: string) => void;
  onSuccessRedirect?: (role: UserRole) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigate,
  onSuccessRedirect,
}) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setErrorMessage('Please enter both your registered work email / username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(cleanId, password, 'erp');
      setIsSubmitting(false);

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      // Security check: Patient accounts are strictly prohibited
      if (res.user.role === 'PATIENT' || res.user.role === 'CUSTOMER') {
        setErrorMessage(
          'Access Denied: Patient accounts are strictly prohibited from accessing CRM/ERP Backoffice. Please sign in via the Patient Portal at /login.'
        );
        return;
      }

      setSuccessMessage(`Access Granted. Welcome back, ${res.user.name}!`);

      setTimeout(() => {
        if (onSuccessRedirect) {
          onSuccessRedirect(res.user!.role as UserRole);
          return;
        }
        onNavigate('/admin/dashboard');
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'An unexpected error occurred during administrative login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Medi<span className="text-teal-600 dark:text-teal-400">Era</span>
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Backoffice &amp; ERP Portal
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Administrative &amp; Staff Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              CRM/ERP Backoffice Sign In
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Secure operational entry point for Executive Super Admins, Physicians, Clinical Specialists, and Healthcare Staff.
            </p>
          </div>

          {/* Form Container (matches PublicLoginPage container style) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors duration-200">
            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{successMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Work Email or System Username
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. dev.sinha14@gmail.com or admin@mediera.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-teal-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('/forgot-password?role=admin')}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-teal-600 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                  />
                  <span>Remember administrative session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Staff Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to CRM/ERP Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Cross-portal guidance */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you a Patient or Customer?
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/login')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Go to Patient &amp; Customer Portal Login</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} MediEra Medical CRM + ERP System. All rights reserved.
      </footer>
    </div>
  );
};
