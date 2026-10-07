import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Building2,
  ShieldAlert,
  ArrowLeft,
  Info
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
  const [showCredentialsHelp, setShowCredentialsHelp] = useState(false);

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

      // Security check: Patients and public customers MUST NOT access CRM/ERP
      if (res.user.role === 'PATIENT' || res.user.role === 'CUSTOMER') {
        setErrorMessage(
          'Access Denied: Patient accounts are strictly prohibited from accessing the CRM/ERP Backoffice portal. Please sign in via the Patient Portal at /login.'
        );
        return;
      }

      setSuccessMessage(`Access Granted. Welcome back, ${res.user.name}!`);

      setTimeout(() => {
        if (onSuccessRedirect) {
          onSuccessRedirect(res.user!.role as UserRole);
          return;
        }

        // Role-based landing dashboard
        if (res.user?.role === 'DOCTOR') {
          onNavigate('/erp/doctor-queue');
        } else if (res.user?.role === 'RECEPTIONIST') {
          onNavigate('/erp/appointments');
        } else if (res.user?.role === 'NURSE') {
          onNavigate('/erp/doctor-queue');
        } else if (res.user?.role === 'LAB_TECHNICIAN') {
          onNavigate('/erp/labs');
        } else if (res.user?.role === 'PHARMACIST') {
          onNavigate('/erp/inventory');
        } else if (res.user?.role === 'ACCOUNTANT') {
          onNavigate('/erp/billing');
        } else {
          onNavigate('/erp/dashboard');
        }
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'An unexpected error occurred during administrative login.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Bar with Return to Public Site */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Website</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Restricted Backoffice Environment</span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-teal-500/20 mb-3.5">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Medi<span className="text-teal-400">Era</span> Backoffice
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Administrative & Clinical Personnel Portal (/admin)
          </p>
        </div>

        {/* Security Alert / Notice */}
        <div className="mb-6 p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-xs text-slate-300 flex items-start gap-3 shadow-inner">
          <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-white block mb-0.5">Authorized Personnel Only</strong>
            Access to this portal is restricted to the Super Administrator, Physicians, and registered healthcare staff. Public self-registration is disabled.
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">
            Backoffice Sign In
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your provisioned login credentials to access your clinical or administrative workspace.
          </p>

          {/* Feedback banners */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-teal-950/60 border border-teal-700/80 text-xs text-teal-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                  placeholder="admin@mediera.com or doctor.smith"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-teal-600 focus:ring-teal-500"
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                onClick={() => setShowCredentialsHelp(!showCredentialsHelp)}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3 h-3" />
                <span>Default setup info</span>
              </button>
            </div>

            {showCredentialsHelp && (
              <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl text-[11px] text-slate-400 space-y-1.5 animate-in fade-in">
                <p className="font-semibold text-slate-200">System Credentials Reference:</p>
                <p>• <strong>Super Admin:</strong> Configured via <code className="text-teal-300">.env</code> (<code className="text-teal-300">dev.sinha14@gmail.com</code> / <code className="text-teal-300">Admin@123!</code>)</p>
                <p>• <strong>Physicians & Staff:</strong> Use the login credentials created for you by the Super Administrator.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Backoffice</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Public Portal Redirection */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <span>Looking for the Patient Health Portal? </span>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2 cursor-pointer"
          >
            Patient Sign In
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center py-4 text-[11px] text-slate-500 border-t border-slate-800/80">
        MediEra Healthcare Systems &copy; {new Date().getFullYear()} &bull; Backoffice Security Level 4 &bull; Role-Based Access Control
      </div>
    </div>
  );
};
