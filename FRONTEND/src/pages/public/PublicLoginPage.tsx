import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  HeartPulse,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  User,
  Phone,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowUpRight,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react';

interface PublicLoginPageProps {
  onNavigate: (view: string) => void;
  initialMode?: 'login' | 'register';
  initialPortal?: string;
}

interface LoginFormErrors {
  identifier?: string;
  password?: string;
}

interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

interface SetupFormErrors {
  password?: string;
  confirmPassword?: string;
}

export const PublicLoginPage: React.FC<PublicLoginPageProps> = ({
  onNavigate,
  initialMode = 'login',
  initialPortal,
}) => {
  const { login, registerPatient, allBranches } = useAuth();

  // ---------------------------------------------------------
  // AUTH MODE
  // ---------------------------------------------------------

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'setup'>(
    () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);

        if (params.get('setupToken')) {
          return 'setup';
        }
      }

      return initialMode;
    },
  );

  // ---------------------------------------------------------
  // SETUP TOKEN
  // ---------------------------------------------------------

  const [setupToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      return params.get('setupToken');
    }

    return null;
  });

  // ---------------------------------------------------------
  // LOGIN STATE
  // ---------------------------------------------------------

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [loginErrors, setLoginErrors] = useState<LoginFormErrors>({});

  // ---------------------------------------------------------
  // REGISTRATION STATE
  // ---------------------------------------------------------

  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '1995-06-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'O+',
    address: '',
    allergies: '',
    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    branchId: allBranches[0]?.id || 'branch-01',
    password: '',
    confirmPassword: '',
  });

  const [registerErrors, setRegisterErrors] = useState<RegisterFormErrors>({});

  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);

  // ---------------------------------------------------------
  // SETUP PASSWORD STATE
  // ---------------------------------------------------------

  const [newSetupPassword, setNewSetupPassword] = useState('');
  const [confirmSetupPassword, setConfirmSetupPassword] = useState('');

  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [showSetupConfirmPassword, setShowSetupConfirmPassword] =
    useState(false);

  const [setupErrors, setSetupErrors] = useState<SetupFormErrors>({});

  // ---------------------------------------------------------
  // GENERAL STATE
  // ---------------------------------------------------------

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------------------------------------
  // MODE SWITCHING
  // ---------------------------------------------------------

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);

    setErrorMessage(null);
    setSuccessMessage(null);

    setLoginErrors({});
    setRegisterErrors({});
    setSetupErrors({});
  };

  // ---------------------------------------------------------
  // LOGIN VALIDATION
  // ---------------------------------------------------------

  const validateLoginForm = (): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    const cleanIdentifier = loginIdentifier.trim();

    if (!cleanIdentifier) {
      errors.identifier = 'Email address, phone number, or MRN is required.';
    }

    if (!loginPassword) {
      errors.password = 'Password is required.';
    } else if (loginPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    return errors;
  };

  // ---------------------------------------------------------
  // REGISTRATION VALIDATION
  // ---------------------------------------------------------

  const validateRegisterForm = (): RegisterFormErrors => {
    const errors: RegisterFormErrors = {};

    const firstName = patientForm.firstName.trim();
    const lastName = patientForm.lastName.trim();
    const phone = patientForm.phone.trim();
    const email = patientForm.email.trim();
    const address = patientForm.address.trim();

    if (!firstName) {
      errors.firstName = 'First name is required.';
    } else if (firstName.length < 2) {
      errors.firstName = 'First name must contain at least 2 characters.';
    }

    if (!lastName) {
      errors.lastName = 'Last name is required.';
    } else if (lastName.length < 2) {
      errors.lastName = 'Last name must contain at least 2 characters.';
    }

    if (!phone) {
      errors.phone = 'Phone number is required.';
    } else {
      const phoneDigits = phone.replace(/\D/g, '');

      if (phoneDigits.length < 10) {
        errors.phone = 'Please enter a valid phone number.';
      }
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (patientForm.dateOfBirth) {
      const dob = new Date(patientForm.dateOfBirth);
      const today = new Date();

      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    if (!address) {
      errors.address = 'Residential address is required.';
    }

    if (!patientForm.password) {
      errors.password = 'Password is required.';
    } else if (patientForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(patientForm.password)) {
      errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(patientForm.password)) {
      errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(patientForm.password)) {
      errors.password = 'Password must contain at least one number.';
    }

    if (!patientForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (patientForm.password !== patientForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  // ---------------------------------------------------------
  // SETUP PASSWORD VALIDATION
  // ---------------------------------------------------------

  const validateSetupForm = (): SetupFormErrors => {
    const errors: SetupFormErrors = {};

    if (!newSetupPassword) {
      errors.password = 'Password is required.';
    } else if (newSetupPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(newSetupPassword)) {
      errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(newSetupPassword)) {
      errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(newSetupPassword)) {
      errors.password = 'Password must contain at least one number.';
    }

    if (!confirmSetupPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (newSetupPassword !== confirmSetupPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  };

  // ---------------------------------------------------------
  // CLEAR FIELD ERRORS
  // ---------------------------------------------------------

  const clearLoginError = (field: keyof LoginFormErrors) => {
    setLoginErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const updated = { ...previous };

      delete updated[field];

      return updated;
    });

    setErrorMessage(null);
  };

  const clearRegisterError = (field: keyof RegisterFormErrors) => {
    setRegisterErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const updated = { ...previous };

      delete updated[field];

      return updated;
    });

    setErrorMessage(null);
  };

  const clearSetupError = (field: keyof SetupFormErrors) => {
    setSetupErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const updated = { ...previous };

      delete updated[field];

      return updated;
    });

    setErrorMessage(null);
  };

  // ---------------------------------------------------------
  // LOGIN SUBMIT
  // ---------------------------------------------------------

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    const errors = validateLoginForm();

    setLoginErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const cleanId = loginIdentifier.trim();

    setIsSubmitting(true);

    try {
      const res = await login(cleanId, loginPassword, 'PATIENT');

      if (!res.success || !res.user) {
        setErrorMessage(
          res.error || 'Authentication failed. Please verify your credentials.',
        );
        return;
      }

      // Patients only.
      if (
        res.user.role &&
        res.user.role !== 'PATIENT' &&
        res.user.role !== 'CUSTOMER'
      ) {
        setErrorMessage(
          'Access Denied: This login is exclusively for Patients. CRM/ERP staff and administrators must sign in via /admin.',
        );
        return;
      }

      setSuccessMessage(
        `Welcome back, ${res.user.name}! Opening your patient health console...`,
      );

      setTimeout(() => {
        onNavigate('/dashboard');
      }, 600);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'An unexpected error occurred during patient login.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // PATIENT REGISTRATION SUBMIT
  // ---------------------------------------------------------

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    const errors = validateRegisterForm();

    setRegisterErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const allergiesArr = patientForm.allergies
        ? patientForm.allergies
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const historyArr = patientForm.medicalHistory
        ? patientForm.medicalHistory
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const { confirmPassword: _confirmPassword, ...registrationData } =
        patientForm;

      const res = await registerPatient({
        ...registrationData,
        firstName: patientForm.firstName.trim(),
        lastName: patientForm.lastName.trim(),
        phone: patientForm.phone.trim(),
        email: patientForm.email.trim(),
        address: patientForm.address.trim(),
        allergies: allergiesArr,
        medicalHistory: historyArr,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create patient account.');
        return;
      }

      setSuccessMessage(
        `Registration successful! Your MRN is ${
          res.patient?.patientId || 'generated'
        }. Redirecting to your Patient Dashboard...`,
      );

      setTimeout(() => {
        onNavigate('/dashboard');
      }, 900);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'An unexpected error occurred while creating your patient account.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // SETUP PASSWORD SUBMIT
  // ---------------------------------------------------------

  const handleSetupPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!setupToken) {
      setErrorMessage(
        'No setup token found in this link. Please contact your clinic administrator.',
      );
      return;
    }

    const errors = validateSetupForm();

    setSetupErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: setupToken,
          password: newSetupPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(
          'Account activated and password saved! You can now log in with your email and new password.',
        );

        setAuthMode('login');

        if (data.data?.email) {
          setLoginIdentifier(data.data.email);
        }
      } else {
        setErrorMessage(data.error || 'Failed to complete password setup.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error activating account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // SHARED FIELD ERROR COMPONENT
  // ---------------------------------------------------------

  const FieldError = ({ message }: { message?: string }) => {
    if (!message) {
      return null;
    }

    return (
      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{message}</span>
      </div>
    );
  };

  // ---------------------------------------------------------
  // INPUT CLASS HELPERS
  // ---------------------------------------------------------

  const inputClass = (hasError: boolean, extra = '') =>
    `w-full py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 transition-all ${extra} ${
      hasError
        ? 'border-rose-400 dark:border-rose-700 focus:outline-rose-500'
        : 'border-slate-200 dark:border-slate-700 focus:outline-teal-600'
    }`;

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

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
            Patient &amp; Customer Health Portal
          </div>
        </button>

        {/* Portal Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wider">
          <UserCheck className="w-3.5 h-3.5" />

          <span>Patient Secure Gateway</span>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
          Patient Health Portal
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
          Secure digital access to your medical records, appointments,
          e-prescriptions, laboratory results, and clinical information.
        </p>
      </div>

      {/* =====================================================
          MAIN FORM
      ====================================================== */}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors duration-200">
          {/* =================================================
              FORM HEADER
          ================================================== */}

          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {authMode === 'login'
                  ? 'Patient Sign In'
                  : authMode === 'register'
                    ? 'New Patient Registration'
                    : 'Activate Patient Account'}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {authMode === 'login'
                  ? 'Access your appointments, e-prescriptions, medical records, and lab results.'
                  : authMode === 'register'
                    ? 'Create your digital patient chart and Medical Record Number (MRN).'
                    : 'Create your permanent password to activate your account.'}
              </p>
            </div>

            {/* Mode switcher */}
            {authMode !== 'setup' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {authMode === 'setup' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/60 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />

                <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  SECURE SETUP
                </span>
              </div>
            )}
          </div>

          {/* =================================================
              GENERAL ERROR
          ================================================== */}

          {errorMessage && (
            <div
              role="alert"
              className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />

              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* =================================================
              SUCCESS MESSAGE
          ================================================== */}

          {successMessage && (
            <div
              role="status"
              className="mb-6 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />

              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* =================================================
              SETUP PASSWORD
          ================================================== */}

          {authMode === 'setup' && (
            <form
              onSubmit={handleSetupPasswordSubmit}
              className="space-y-4"
              noValidate
            >
              <div className="p-4 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />

                  <div>
                    <p className="font-bold">Welcome to MediEra Healthcare!</p>

                    <p className="mt-1 leading-relaxed">
                      Please create your permanent password to complete your
                      account setup and activate clinical access.
                    </p>
                  </div>
                </div>
              </div>

              {/* Setup password */}
              <div>
                <label
                  htmlFor="setup-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Create New Password
                </label>

                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="setup-password"
                    type={showSetupPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newSetupPassword}
                    onChange={(e) => {
                      setNewSetupPassword(e.target.value);
                      clearSetupError('password');
                    }}
                    placeholder="Minimum 8 characters"
                    aria-invalid={Boolean(setupErrors.password)}
                    aria-describedby={
                      setupErrors.password ? 'setup-password-error' : undefined
                    }
                    className={inputClass(
                      Boolean(setupErrors.password),
                      'pl-10 pr-11',
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowSetupPassword((previous) => !previous)
                    }
                    aria-label={
                      showSetupPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showSetupPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors cursor-pointer"
                  >
                    {showSetupPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <FieldError message={setupErrors.password} />
              </div>

              {/* Confirm setup password */}
              <div>
                <label
                  htmlFor="setup-confirm-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm Password
                </label>

                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="setup-confirm-password"
                    type={showSetupConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmSetupPassword}
                    onChange={(e) => {
                      setConfirmSetupPassword(e.target.value);
                      clearSetupError('confirmPassword');
                    }}
                    placeholder="Re-enter your password"
                    aria-invalid={Boolean(setupErrors.confirmPassword)}
                    aria-describedby={
                      setupErrors.confirmPassword
                        ? 'setup-confirm-password-error'
                        : undefined
                    }
                    className={inputClass(
                      Boolean(setupErrors.confirmPassword),
                      'pl-10 pr-11',
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowSetupConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showSetupConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    aria-pressed={showSetupConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors cursor-pointer"
                  >
                    {showSetupConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <FieldError message={setupErrors.confirmPassword} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    <span>Activating Account...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />

                    <span>Set Password &amp; Activate Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* =================================================
              LOGIN FORM
          ================================================== */}

          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {/* Identifier */}
              <div>
                <label
                  htmlFor="patient-identifier"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email Address, Phone Number, or MRN
                </label>

                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="patient-identifier"
                    type="text"
                    autoFocus
                    required
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      clearLoginError('identifier');
                    }}
                    placeholder="e.g. patient@example.com or MRN-10001"
                    aria-invalid={Boolean(loginErrors.identifier)}
                    aria-describedby={
                      loginErrors.identifier
                        ? 'patient-identifier-error'
                        : undefined
                    }
                    className={inputClass(
                      Boolean(loginErrors.identifier),
                      'pl-10 pr-4',
                    )}
                  />
                </div>

                <FieldError message={loginErrors.identifier} />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="patient-login-password"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => onNavigate('/forgot-password?role=patient')}
                    className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="patient-login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      clearLoginError('password');
                    }}
                    placeholder="••••••••••••"
                    aria-invalid={Boolean(loginErrors.password)}
                    aria-describedby={
                      loginErrors.password
                        ? 'patient-login-password-error'
                        : undefined
                    }
                    className={inputClass(
                      Boolean(loginErrors.password),
                      'pl-10 pr-11',
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword((previous) => !previous)
                    }
                    aria-label={
                      showLoginPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showLoginPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <FieldError message={loginErrors.password} />
              </div>

              {/* Remember me */}
              <div className="flex flex-row items-center">
                <input
                  id="remember-patient-session"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="!m-0 !block !h-4 !w-4 !shrink-0 cursor-pointer accent-teal-600"
                />

                <label
                  htmlFor="remember-patient-session"
                  className="!m-0 !ml-1.5 !p-0 cursor-pointer whitespace-nowrap text-xs font-medium leading-4 text-slate-600 dark:text-slate-400"
                >
                  Remember my patient session
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Patient Portal</span>

                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Register link */}
              <div className="text-center pt-3">
                <span className="text-xs text-slate-500">
                  Don't have a patient account yet?{' '}
                </span>

                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Create your health profile
                </button>
              </div>
            </form>
          )}

          {/* =================================================
              REGISTRATION FORM
          ================================================== */}

          {authMode === 'register' && (
            <form
              onSubmit={handlePatientRegister}
              className="space-y-4"
              noValidate
            >
              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="patient-first-name"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    First Name *
                  </label>

                  <input
                    id="patient-first-name"
                    type="text"
                    required
                    value={patientForm.firstName}
                    onChange={(e) => {
                      setPatientForm({
                        ...patientForm,
                        firstName: e.target.value,
                      });

                      clearRegisterError('firstName');
                    }}
                    placeholder="e.g. Emily"
                    aria-invalid={Boolean(registerErrors.firstName)}
                    className={inputClass(
                      Boolean(registerErrors.firstName),
                      'px-3.5',
                    )}
                  />

                  <FieldError message={registerErrors.firstName} />
                </div>

                <div>
                  <label
                    htmlFor="patient-last-name"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Last Name *
                  </label>

                  <input
                    id="patient-last-name"
                    type="text"
                    required
                    value={patientForm.lastName}
                    onChange={(e) => {
                      setPatientForm({
                        ...patientForm,
                        lastName: e.target.value,
                      });

                      clearRegisterError('lastName');
                    }}
                    placeholder="e.g. Parker"
                    aria-invalid={Boolean(registerErrors.lastName)}
                    className={inputClass(
                      Boolean(registerErrors.lastName),
                      'px-3.5',
                    )}
                  />

                  <FieldError message={registerErrors.lastName} />
                </div>
              </div>

              {/* Phone / Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="patient-phone"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Phone Number *
                  </label>

                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                    <input
                      id="patient-phone"
                      type="tel"
                      required
                      value={patientForm.phone}
                      onChange={(e) => {
                        setPatientForm({
                          ...patientForm,
                          phone: e.target.value,
                        });

                        clearRegisterError('phone');
                      }}
                      placeholder="+1 (555) 000-0000"
                      aria-invalid={Boolean(registerErrors.phone)}
                      className={inputClass(
                        Boolean(registerErrors.phone),
                        'pl-10 pr-4',
                      )}
                    />
                  </div>

                  <FieldError message={registerErrors.phone} />
                </div>

                <div>
                  <label
                    htmlFor="patient-email"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email Address
                  </label>

                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                    <input
                      id="patient-email"
                      type="email"
                      value={patientForm.email}
                      onChange={(e) => {
                        setPatientForm({
                          ...patientForm,
                          email: e.target.value,
                        });

                        clearRegisterError('email');
                      }}
                      placeholder="emily.parker@example.com"
                      aria-invalid={Boolean(registerErrors.email)}
                      className={inputClass(
                        Boolean(registerErrors.email),
                        'pl-10 pr-4',
                      )}
                    />
                  </div>

                  <FieldError message={registerErrors.email} />
                </div>
              </div>

              {/* DOB / Gender / Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="patient-dob"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Date of Birth
                  </label>

                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />

                    <input
                      id="patient-dob"
                      type="date"
                      value={patientForm.dateOfBirth}
                      onChange={(e) => {
                        setPatientForm({
                          ...patientForm,
                          dateOfBirth: e.target.value,
                        });

                        clearRegisterError('dateOfBirth');
                      }}
                      aria-invalid={Boolean(registerErrors.dateOfBirth)}
                      className={inputClass(
                        Boolean(registerErrors.dateOfBirth),
                        'pl-9 pr-2',
                      )}
                    />
                  </div>

                  <FieldError message={registerErrors.dateOfBirth} />
                </div>

                <div>
                  <label
                    htmlFor="patient-gender"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Gender
                  </label>

                  <select
                    id="patient-gender"
                    value={patientForm.gender}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        gender: e.target.value as 'Male' | 'Female' | 'Other',
                      })
                    }
                    className={inputClass(false, 'px-3')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="patient-blood-group"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Blood Group
                  </label>

                  <select
                    id="patient-blood-group"
                    value={patientForm.bloodGroup}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        bloodGroup: e.target.value,
                      })
                    }
                    className={inputClass(false, 'px-3')}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="patient-address"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Residential Address *
                </label>

                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="patient-address"
                    type="text"
                    required
                    value={patientForm.address}
                    onChange={(e) => {
                      setPatientForm({
                        ...patientForm,
                        address: e.target.value,
                      });

                      clearRegisterError('address');
                    }}
                    placeholder="Street address, apartment, city"
                    aria-invalid={Boolean(registerErrors.address)}
                    className={inputClass(
                      Boolean(registerErrors.address),
                      'pl-10 pr-4',
                    )}
                  />
                </div>

                <FieldError message={registerErrors.address} />
              </div>

              {/* Optional medical details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="patient-allergies"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Allergies
                  </label>

                  <input
                    id="patient-allergies"
                    type="text"
                    value={patientForm.allergies}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        allergies: e.target.value,
                      })
                    }
                    placeholder="e.g. Penicillin, Peanuts"
                    className={inputClass(false, 'px-3.5')}
                  />

                  <p className="mt-1 text-[10px] text-slate-400">
                    Separate multiple items with commas.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="patient-medical-history"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Medical History
                  </label>

                  <input
                    id="patient-medical-history"
                    type="text"
                    value={patientForm.medicalHistory}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        medicalHistory: e.target.value,
                      })
                    }
                    placeholder="e.g. Diabetes, Hypertension"
                    className={inputClass(false, 'px-3.5')}
                  />

                  <p className="mt-1 text-[10px] text-slate-400">
                    Separate multiple conditions with commas.
                  </p>
                </div>
              </div>

              {/* Emergency contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="emergency-contact-name"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Emergency Contact Name
                  </label>

                  <input
                    id="emergency-contact-name"
                    type="text"
                    value={patientForm.emergencyContactName}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        emergencyContactName: e.target.value,
                      })
                    }
                    placeholder="Full name"
                    className={inputClass(false, 'px-3.5')}
                  />
                </div>

                <div>
                  <label
                    htmlFor="emergency-contact-phone"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Emergency Contact Phone
                  </label>

                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                    <input
                      id="emergency-contact-phone"
                      type="tel"
                      value={patientForm.emergencyContactPhone}
                      onChange={(e) =>
                        setPatientForm({
                          ...patientForm,
                          emergencyContactPhone: e.target.value,
                        })
                      }
                      placeholder="+1 (555) 000-0000"
                      className={inputClass(false, 'pl-10 pr-4')}
                    />
                  </div>
                </div>
              </div>

              {/* Registration password */}
              <div>
                <label
                  htmlFor="patient-register-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Create Portal Password *
                </label>

                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="patient-register-password"
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={patientForm.password}
                    onChange={(e) => {
                      setPatientForm({
                        ...patientForm,
                        password: e.target.value,
                      });

                      clearRegisterError('password');
                    }}
                    placeholder="Minimum 8 characters"
                    aria-invalid={Boolean(registerErrors.password)}
                    aria-describedby={
                      registerErrors.password
                        ? 'patient-register-password-error'
                        : undefined
                    }
                    className={inputClass(
                      Boolean(registerErrors.password),
                      'pl-10 pr-11',
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword((previous) => !previous)
                    }
                    aria-label={
                      showRegisterPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showRegisterPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors cursor-pointer"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <FieldError message={registerErrors.password} />

                <p className="mt-1.5 text-[10px] text-slate-400">
                  Use 8+ characters with uppercase, lowercase, and a number.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="patient-register-confirm-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm Portal Password *
                </label>

                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />

                  <input
                    id="patient-register-confirm-password"
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={patientForm.confirmPassword}
                    onChange={(e) => {
                      setPatientForm({
                        ...patientForm,
                        confirmPassword: e.target.value,
                      });

                      clearRegisterError('confirmPassword');
                    }}
                    placeholder="Re-enter your password"
                    aria-invalid={Boolean(registerErrors.confirmPassword)}
                    aria-describedby={
                      registerErrors.confirmPassword
                        ? 'patient-register-confirm-password-error'
                        : undefined
                    }
                    className={inputClass(
                      Boolean(registerErrors.confirmPassword),
                      'pl-10 pr-11',
                    )}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showRegisterConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    aria-pressed={showRegisterConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-colors cursor-pointer"
                  >
                    {showRegisterConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <FieldError message={registerErrors.confirmPassword} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    <span>Creating Patient Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />

                    <span>Complete Patient Self-Registration</span>
                  </>
                )}
              </button>

              {/* Login link */}
              <div className="text-center pt-3">
                <span className="text-xs text-slate-500">
                  Already registered as a patient?{' '}
                </span>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Sign In to your account
                </button>
              </div>
            </form>
          )}

          {/* =================================================
              ADMIN / STAFF GUIDANCE
          ================================================== */}

          {authMode !== 'setup' && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />

                <span>
                  Are you a Doctor, Clinical Employee, or Administrator?
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Go to /admin</span>

                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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
