import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, PermissionCode } from '../../types';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

/**
 * Normalizes clinical roles to core user types:
 * - SUPER_ADMIN -> SUPER_ADMIN
 * - ADMIN / CLINIC_ADMIN -> ADMIN
 * - DOCTOR, RECEPTIONIST, NURSE, LAB_TECHNICIAN, PHARMACIST, ACCOUNTANT, EMPLOYEE -> EMPLOYEE
 * - PATIENT, CUSTOMER -> CUSTOMER
 */
export const getCoreUserType = (role: UserRole): 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER' => {
  if (role === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (role === 'ADMIN' || role === 'CLINIC_ADMIN') return 'ADMIN';
  if (role === 'CUSTOMER' || role === 'PATIENT') return 'CUSTOMER';
  return 'EMPLOYEE';
};

export const isSuperAdminRole = (role: UserRole): boolean => role === 'SUPER_ADMIN';
export const isAdminRole = (role: UserRole): boolean => role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'CLINIC_ADMIN';
export const isEmployeeRole = (role: UserRole): boolean => role !== 'CUSTOMER' && role !== 'PATIENT';
export const isCustomerRole = (role: UserRole): boolean => role === 'CUSTOMER' || role === 'PATIENT';

/**
 * Evaluates whether a role matches the allowed role criteria (including core type aliases)
 */
export const checkRoleAccess = (currentRole: UserRole, allowedRoles: (UserRole | 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER')[]): boolean => {
  if (currentRole === 'SUPER_ADMIN') return true; // Super Admin always retains full access
  if (allowedRoles.includes(currentRole)) return true;

  const coreType = getCoreUserType(currentRole);
  if (allowedRoles.includes(coreType)) return true;

  // Specific aliases
  if (allowedRoles.includes('ADMIN') && (currentRole === 'CLINIC_ADMIN')) return true;
  if (allowedRoles.includes('CUSTOMER') && (currentRole === 'PATIENT')) return true;
  if (allowedRoles.includes('EMPLOYEE') && (
    currentRole === 'DOCTOR' ||
    currentRole === 'RECEPTIONIST' ||
    currentRole === 'NURSE' ||
    currentRole === 'LAB_TECHNICIAN' ||
    currentRole === 'PHARMACIST' ||
    currentRole === 'ACCOUNTANT'
  )) return true;

  return false;
};

interface RoleGuardProps {
  allowedRoles: (UserRole | 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onNavigateBack?: () => void;
}

/**
 * Reusable RoleGuard Component
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
  onNavigateBack,
}) => {
  const { currentRole } = useAuth();

  const isAllowed = checkRoleAccess(currentRole, allowedRoles);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 p-6 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your current role (<span className="font-bold text-slate-800">{currentRole.replace('_', ' ')}</span>) does not have administrative clearance to access this module.
          </p>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 text-left space-y-1">
          <p className="font-semibold text-slate-700">Required Role Clearance:</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {allowedRoles.map((r) => (
              <span key={r} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 font-bold rounded-md">
                {r.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
        {onNavigateBack && (
          <button
            onClick={onNavigateBack}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

interface PermissionGuardProps {
  permission: PermissionCode;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Reusable PermissionGuard Component
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
}) => {
  const { hasPermission, currentRole } = useAuth();

  // Super Admin always retains full access
  if (currentRole === 'SUPER_ADMIN' || hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
      <span>
        Permission required: <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded font-bold">{permission}</code>. Contact your clinic administrator.
      </span>
    </div>
  );
};

/**
 * Imperative programmatic helper functions
 */
export const requireAuth = (currentUser: any): boolean => {
  return Boolean(currentUser && currentUser.active);
};

export const requireRole = (
  currentRole: UserRole,
  allowedRoles: (UserRole | 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER')[]
): boolean => {
  return checkRoleAccess(currentRole, allowedRoles);
};

export const requirePermission = (
  hasPermissionFn: (perm: string) => boolean,
  currentRole: UserRole,
  permission: PermissionCode
): boolean => {
  if (currentRole === 'SUPER_ADMIN') return true;
  return hasPermissionFn(permission);
};
