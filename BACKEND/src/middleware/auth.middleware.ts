/**
 * Authentication Middleware & JWT Token Service
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name?: string;
  organizationId?: string;
  branchId?: string;
  isSuperAdmin?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-clinic-crm-key-2026';

/**
 * Generates an HMAC-SHA256 Signed JWT Token
 */
export function signToken(payload: AuthenticatedUser, expiresInHours: number = 24): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 Token
 */
export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      organizationId: decoded.organizationId,
      branchId: decoded.branchId,
      isSuperAdmin: decoded.isSuperAdmin || decoded.role === 'SUPER_ADMIN',
    };
  } catch {
    return null;
  }
}

/**
 * Express Middleware: extracts and verifies JWT from Authorization header
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Bearer token.',
    });
  }

  const token = authHeader.substring(7).trim();
  const user = verifyToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }

  req.user = user;
  next();
}

/**
 * Optional Authentication Middleware: populates req.user if token is valid, doesn't block if missing
 */
export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = verifyToken(token);
    if (user) req.user = user;
  }
  next();
}

/**
 * Express Middleware: Enforces Role-Based Access Control (RBAC)
 */
export function requireRoles(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before verifying role permissions.',
      });
    }

    // Super Admin has full administrative access
    if (
      req.user.isSuperAdmin ||
      req.user.role === 'SUPER_ADMIN' ||
      req.user.role === 'SUPERADMIN'
    ) {
      return next();
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access forbidden: Role '${req.user.role}' is not authorized to access this administrative resource.`,
    });
  };
}

/**
 * Express Middleware: Strictly enforces PATIENT role
 * Only Patient users can access patient-specific resources.
 */
export function requirePatient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const user = verifyToken(authHeader.substring(7).trim());
      if (user) req.user = user;
    }
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to your Patient account.',
    });
  }

  const role = req.user.role ? req.user.role.toUpperCase() : '';
  if (role !== 'PATIENT' && role !== 'CUSTOMER') {
    return res.status(403).json({
      success: false,
      error: 'Access forbidden: Only Patient accounts may access this resource.',
    });
  }

  next();
}

/**
 * Express Middleware: Strictly enforces CRM/ERP staff or Super Admin role
 * Patient accounts are strictly prohibited from accessing ERP resources.
 */
export function requireErpUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const user = verifyToken(authHeader.substring(7).trim());
      if (user) req.user = user;
    }
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to the CRM/ERP workspace via /erp/login.',
    });
  }

  const role = req.user.role ? req.user.role.toUpperCase() : '';
  if (role === 'PATIENT' || role === 'CUSTOMER') {
    return res.status(403).json({
      success: false,
      error: 'Access forbidden: Patient accounts are strictly prohibited from accessing CRM/ERP back-office resources.',
    });
  }

  next();
}

/**
 * Express Middleware: Strictly enforces SUPER_ADMIN role
 * Normal CRM/ERP staff and Patients cannot access Super Admin resources.
 */
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const user = verifyToken(authHeader.substring(7).trim());
      if (user) req.user = user;
    }
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Super Administrator session is missing.',
    });
  }

  const isSuper = req.user.isSuperAdmin || req.user.role === 'SUPER_ADMIN' || req.user.role === 'SUPERADMIN';
  if (!isSuper) {
    return res.status(403).json({
      success: false,
      error: 'Access forbidden: Super Administrator privileges required.',
    });
  }

  next();
}

/**
 * Express Middleware: Enforces Ownership on Patient Data
 * Prevents horizontal privilege escalation: A patient cannot view or modify another patient's data.
 */
export function requirePatientOwnership(paramKey: string = 'id') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const user = verifyToken(authHeader.substring(7).trim());
        if (user) req.user = user;
      }
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    const isSuper = req.user.isSuperAdmin || req.user.role === 'SUPER_ADMIN';
    const isStaff = !isSuper && req.user.role !== 'PATIENT' && req.user.role !== 'CUSTOMER';

    // Authorized staff and Super Admins have permission to manage clinical patient records
    if (isSuper || isStaff) {
      return next();
    }

    // For PATIENT role, verify ownership:
    const requestedId = req.params[paramKey] || req.body?.patientId || req.query?.patientId;
    if (requestedId) {
      const userId = req.user.id;
      // Allow if ID matches user ID or starts with patient ID
      if (
        requestedId === userId ||
        requestedId === `usr-${userId}` ||
        userId === `usr-${requestedId}` ||
        requestedId.includes(userId)
      ) {
        return next();
      }
      return res.status(403).json({
        success: false,
        error: 'Access forbidden: You cannot access or modify another patient\'s medical records.',
      });
    }

    next();
  };
}

