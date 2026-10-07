import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../api/client.ts';
import { Mail, KeyRound, AlertCircle, CheckCircle, ArrowLeft, X, Lock, RefreshCw } from 'lucide-react';
import { PasswordInput } from '../ui/PasswordInput.tsx';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalStep = 'request' | 'verify' | 'new-password' | 'success';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<ModalStep>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  if (!isOpen) return null;

  const fullCode = code.join('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await apiRequest('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: cleanEmail }),
    });

    setLoading(false);
    if (res.success) {
      setMessage('Check your email for the 6-digit reset code.');
      setCooldown(60);
      setStep('verify');
    } else {
      setError(res.error?.message || 'Failed to submit request. Please try again.');
    }
  };

  const handleCodeChange = (index: number, val: string) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6);
      if (digits) {
        const nextCode = [...code];
        for (let i = 0; i < 6; i++) {
          nextCode[i] = digits[i] || '';
        }
        setCode(nextCode);
        const nextIdx = Math.min(digits.length, 5);
        inputRefs.current[nextIdx]?.focus();
      }
      return;
    }

    const digit = val.replace(/\D/g, '');
    const nextCode = [...code];
    nextCode[index] = digit;
    setCode(nextCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await apiRequest('/api/v1/auth/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: fullCode }),
    });

    setLoading(false);
    if (res.success) {
      setStep('new-password');
    } else {
      setError(res.error?.message || 'Invalid or expired reset code. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);

    const res = await apiRequest('/api/v1/auth/resend-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    setResending(false);
    if (res.success) {
      setMessage('A new verification code has been sent to your email.');
      setCooldown(60);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(res.error?.message || 'Failed to resend reset code.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiRequest('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        code: fullCode,
        newPassword,
        confirmPassword,
      }),
    });

    setLoading(false);
    if (res.success) {
      setStep('success');
    } else {
      setError(res.error?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-zinc-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4">
          <KeyRound className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold text-zinc-900">
          {step === 'request' && 'Forgot Password'}
          {step === 'verify' && 'Verify Reset Code'}
          {step === 'new-password' && 'Reset Password'}
          {step === 'success' && 'Password Updated'}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 mb-5">
          {step === 'request' && 'Enter your email address to receive a 6-digit reset code.'}
          {step === 'verify' && `Enter the 6-digit code sent to ${email}`}
          {step === 'new-password' && 'Set a new secure password for your account.'}
          {step === 'success' && 'Your password has been changed successfully.'}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {message && step !== 'success' && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Reset Code</span>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-zinc-700">
                  Enter 6-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMessage(null);
                    setStep('request');
                  }}
                  className="text-[11px] text-zinc-500 hover:text-zinc-900 underline"
                >
                  Change Email
                </button>
              </div>

              <div className="flex justify-between gap-1.5">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    className="w-11 h-12 text-center text-lg font-bold font-mono border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={cooldown > 0 || resending}
                className="text-xs text-zinc-600 hover:text-zinc-900 disabled:text-zinc-400"
              >
                {resending ? 'Resending...' : cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
              </button>

              <button
                type="submit"
                disabled={loading || fullCode.length !== 6}
                className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'new-password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                New Password
              </label>
              <PasswordInput
                id="reset-modal-new-password"
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
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Confirm Password
              </label>
              <PasswordInput
                id="reset-modal-confirm-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                iconLeft={<Lock className="w-4 h-4 text-zinc-400" />}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep('verify')}
                className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">
              Password reset successfully.
            </p>
            <p className="text-xs text-zinc-500">
              You can now log in with your new password.
            </p>
            <button
              onClick={() => {
                onClose();
                onSuccess();
              }}
              className="w-full py-2.5 px-4 bg-zinc-900 text-white font-semibold text-sm rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
