import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shield,
  User,
  ArrowUpRight,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (view: string) => void;
  onSuccessRedirect?: (role: UserRole) => void;
}

interface FormErrors {
  identifier?: string;
  password?: string;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigate,
  onSuccessRedirect,
}) => {
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------------------------------------
  // FORM VALIDATION
  // ---------------------------------------------------------

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      errors.identifier = 'Work email or system username is required.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    return errors;
  };

  // ---------------------------------------------------------
  // CLEAR FIELD ERROR WHEN USER STARTS EDITING
  // ---------------------------------------------------------

  const clearFieldError = (field: keyof FormErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const updated = { ...prev };
      delete updated[field];

      return updated;
    });

    // Clear generic backend error when user starts correcting
    // the form.
    setErrorMessage(null);
  };

  // ---------------------------------------------------------
  // LOGIN SUBMIT
  // ---------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate fields before authentication.
    const errors = validateForm();

    setFieldErrors(errors);

    // Do not submit if field validation fails.
    if (Object.keys(errors).length > 0) {
      return;
    }

    const cleanId = identifier.trim();

    setIsSubmitting(true);

    try {
      const res = await login(cleanId, password, 'erp');

      setIsSubmitting(false);

      // Authentication / backend error
      if (!res.success || !res.user) {
        setErrorMessage(
          res.error || 'Authentication failed. Please verify your credentials.',
        );
        return;
      }

      // Security check:
      // Patients and Customers cannot access CRM/ERP.
      if (res.user.role === 'PATIENT' || res.user.role === 'CUSTOMER') {
        setErrorMessage(
          'Access Denied: Patient accounts are strictly prohibited from accessing CRM/ERP Backoffice. Please sign in via the Patient Portal at /login.',
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

      setErrorMessage(
        err.message ||
          'An unexpected error occurred during administrative login.',
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="text-center max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        {/* MediEra Logo */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="group block mx-auto cursor-pointer select-none"
        >
          <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-teal-600/20 mb-3.5">
            <HeartPulse className="w-8 h-8" />
          </div>

          <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Medi
            <span className="text-teal-600 dark:text-teal-400">Era</span>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Backoffice &amp; ERP Portal
          </div>
        </button>

        {/* Gateway Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" />

          <span>Administrative &amp; Staff Gateway</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
          CRM/ERP Backoffice Sign In
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
          Secure operational entry point for Executive Super Admins, Physicians,
          Clinical Specialists, and Healthcare Staff.
        </p>
      </div>

      {/* =====================================================
          MAIN FORM CONTAINER
      ====================================================== */}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors duration-200">
          {/* =================================================
              FORM HEADER
          ================================================== */}

          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Staff &amp; Administrator Sign In
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Access your CRM, ERP, clinical operations, and administrative
                workspace.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 shrink-0">
              <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />

              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                STAFF ONLY
              </span>
            </div>
          </div>

          {/* =================================================
              GENERAL / BACKEND ERROR
          ================================================== */}

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />

              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
          ================================================== */}

          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />

              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* =================================================
              LOGIN FORM
          ================================================== */}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* =================================================
                WORK EMAIL / USERNAME
            ================================================== */}

            <div>
              <label
                htmlFor="admin-identifier"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Work Email or System Username
              </label>

              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                <input
                  id="admin-identifier"
                  type="text"
                  autoFocus
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    clearFieldError('identifier');
                  }}
                  placeholder="e.g. dev.sinha14@gmail.com or admin@mediera.com"
                  aria-invalid={Boolean(fieldErrors.identifier)}
                  aria-describedby={
                    fieldErrors.identifier
                      ? 'admin-identifier-error'
                      : undefined
                  }
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-all ${
                    fieldErrors.identifier
                      ? 'border-rose-400 dark:border-rose-700 focus:outline-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:outline-teal-600'
                  }`}
                />
              </div>

              {/* Field Error */}
              {fieldErrors.identifier && (
                <div
                  id="admin-identifier-error"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />

                  <span>{fieldErrors.identifier}</span>
                </div>
              )}
            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                >
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

              {/* Password Input */}
              <div className="relative flex items-center">
                {/* Lock Icon */}
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  placeholder="••••••••••••"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? 'admin-password-error' : undefined
                  }
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-all ${
                    fieldErrors.password
                      ? 'border-rose-400 dark:border-rose-700 focus:outline-rose-500'
                      : 'border-slate-200 dark:border-slate-700 focus:outline-teal-600'
                  }`}
                />

                {/* Eye / Eye-Off Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="
                    absolute right-3
                    top-1/2
                    -translate-y-1/2
                    flex items-center justify-center
                    w-6 h-6
                    text-slate-400
                    hover:text-slate-600
                    dark:hover:text-slate-200
                    rounded-md
                    focus:outline-none
                    focus:ring-2
                    focus:ring-teal-500/50
                    transition-colors
                    cursor-pointer
                  "
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Field Error */}
              {fieldErrors.password && (
                <div
                  id="admin-password-error"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />

                  <span>{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* REMEMBER ME */}
            <div className="flex flex-row items-center">
              <input
                id="remember-admin-session"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="
      !m-0
      !block
      !h-4
      !w-4
      !shrink-0
      cursor-pointer
      accent-teal-600
    "
              />

              <label
                htmlFor="remember-admin-session"
                className="
      !m-0
      !ml-1.5
      !p-0
      cursor-pointer
      whitespace-nowrap
      text-xs
      font-medium
      leading-4
      text-slate-600
      dark:text-slate-400
    "
              >
                Remember administrative session
              </label>
            </div>

            {/* =================================================
                LOGIN BUTTON
            ================================================== */}

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

          {/* =================================================
              PATIENT PORTAL GUIDANCE
          ================================================== */}

          <div className="mt-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />

              <span>Are you a Patient or Customer?</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Go to Patient Portal</span>

              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ===================================================
            RETURN TO WEBSITE
        ==================================================== */}

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="py-4 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} MediEra Medical CRM + ERP System. All
        rights reserved.
      </footer>
    </div>
  );
};
