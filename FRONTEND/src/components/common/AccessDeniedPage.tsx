import React from 'react';
import {
  ShieldAlert,
  Lock,
  ArrowLeft,
  LogIn,
  LayoutDashboard,
} from 'lucide-react';

interface AccessDeniedPageProps {
  status: 401 | 403 | 404;
  title: string;
  message: string;
  primaryActionLabel: string;
  primaryActionPath: string;
  secondaryActionLabel?: string;
  secondaryActionPath?: string;
  onNavigate: (path: string) => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  status,
  title,
  message,
  primaryActionLabel,
  primaryActionPath,
  secondaryActionLabel,
  secondaryActionPath,
  onNavigate,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl w-full text-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 shadow-inner">
          {status === 401 ? (
            <Lock className="w-8 h-8" />
          ) : (
            <ShieldAlert className="w-8 h-8" />
          )}
        </div>

        <div className="inline-block px-3 py-1 mb-3 text-xs font-mono font-bold tracking-wider uppercase rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          HTTP {status}{' '}
          {status === 401
            ? 'Unauthorized'
            : status === 403
              ? 'Forbidden'
              : 'Not Found'}
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
          {title}
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          {message}
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => onNavigate(primaryActionPath)}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {status === 401 ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <LayoutDashboard className="w-4 h-4" />
            )}
            <span>{primaryActionLabel}</span>
          </button>

          {secondaryActionLabel && secondaryActionPath && (
            <button
              type="button"
              onClick={() => onNavigate(secondaryActionPath)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
