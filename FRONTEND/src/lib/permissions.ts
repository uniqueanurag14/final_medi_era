export const PERMISSIONS = {
  ALL: 'all',
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  ROLES_READ: 'roles:read',
  ROLES_WRITE: 'roles:write',
  PERMISSIONS_READ: 'permissions:read',
  AUDIT_READ: 'audit:read',
  SESSIONS_READ: 'sessions:read',
  SESSIONS_REVOKE: 'sessions:revoke',
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export function hasPermission(userPermissions: string[] = [], requiredPermission: string): boolean {
  if (userPermissions.includes('all') || userPermissions.includes('*')) {
    return true;
  }
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Handle wildcard matching (e.g. "users:*" matches "users:read")
  const parts = requiredPermission.split(':');
  if (parts.length > 1 && userPermissions.includes(`${parts[0]}:*`)) {
    return true;
  }

  const dotParts = requiredPermission.split('.');
  if (dotParts.length > 1 && userPermissions.includes(`${dotParts[0]}.*`)) {
    return true;
  }

  return false;
}

export function hasAnyPermission(userPermissions: string[] = [], requiredPermissions: string[] = []): boolean {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.some((p) => hasPermission(userPermissions, p));
}

export function hasAllPermissions(userPermissions: string[] = [], requiredPermissions: string[] = []): boolean {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.every((p) => hasPermission(userPermissions, p));
}

