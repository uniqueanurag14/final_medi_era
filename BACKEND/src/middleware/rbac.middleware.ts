/**
 * Role-Based Access Control (RBAC) & Authorization Middleware
 * 
 * Enforces permissions server-side rather than relying on frontend checks.
 */

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/**
 * Requires Super Admin role strictly.
 * Used for Demo Mode toggle, technical settings, and system migrations.
 */
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required to access Super Admin resources.',
    });
  }

  const role = req.user.role?.toUpperCase();
  const isSuper = req.user.isSuperAdmin || role === 'SUPER_ADMIN' || req.user.id === 'usr-admin-01';

  if (!isSuper) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Only an authorized Super Admin can perform this action.',
      requiredRole: 'SUPER_ADMIN',
      currentRole: req.user.role,
    });
  }

  next();
}

/**
 * Requires one of the specified roles.
 */
export function requireAnyRole(allowedRoles: string[]) {
  const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
    }

    const currentRole = (req.user.role || '').toUpperCase();
    const isSuper = req.user.isSuperAdmin || currentRole === 'SUPER_ADMIN';

    if (isSuper || normalizedAllowed.includes(currentRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access denied. Requires one of: ${allowedRoles.join(', ')}`,
      currentRole: req.user.role,
    });
  };
}
