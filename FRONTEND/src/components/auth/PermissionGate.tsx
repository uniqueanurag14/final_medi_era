import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../lib/permissions.ts';

export interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
}) => {
  const { user, isSuperAdmin } = useAuth();

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const userPerms = user?.permissions || [];

  if (permission && !hasPermission(userPerms, permission)) {
    return <>{fallback}</>;
  }

  if (anyPermission && anyPermission.length > 0 && !hasAnyPermission(userPerms, anyPermission)) {
    return <>{fallback}</>;
  }

  if (allPermissions && allPermissions.length > 0 && !hasAllPermissions(userPerms, allPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;

