/**
 * Authentication Service
 * 
 * Implements business logic for logins, sessions, and patient self-registration.
 * Follows separation of concerns: queries executed only via repositories.
 */

import { userRepository, DbUser } from '../repositories/user.repository';
import { signToken, AuthenticatedUser } from '../middleware/auth.middleware';
import { LoginDto, RegisterPatientDto } from '../dtos/auth.dto';
import { getProtectedSuperAdmin } from '../db/adapter';

export interface AuthResult {
  success: boolean;
  statusCode?: number;
  token?: string;
  user?: AuthenticatedUser;
  error?: string;
}

export class AuthService {
  /**
   * Authenticates user against configured database with strict portal and RBAC checks
   */
  public async login(dto: LoginDto): Promise<AuthResult> {
    const cleanIdentifier = dto.identifier.trim().toLowerCase();
    const superAdmin = getProtectedSuperAdmin();
    const configuredPassword = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123!';
    const portal = dto.portal ? dto.portal.toLowerCase() : undefined;

    // 1. Check Super Admin credentials
    const isSuperAdminIdentifier =
      cleanIdentifier === superAdmin.email.toLowerCase() ||
      cleanIdentifier === superAdmin.username.toLowerCase();

    if (isSuperAdminIdentifier) {
      // Patient Login Rule: Super Admin CANNOT log in via Patient Portal
      if (portal === 'patient') {
        return {
          success: false,
          statusCode: 403,
          error: 'Access Denied: This login is only for Patients. Super Administrators and CRM/ERP staff must sign in via /erp/login.',
        };
      }

      if (!dto.password || dto.password !== configuredPassword) {
        return { success: false, statusCode: 401, error: 'Invalid password. Please check your credentials.' };
      }

      const superUser: AuthenticatedUser = {
        id: superAdmin.id,
        email: superAdmin.email,
        role: 'SUPER_ADMIN',
        name: superAdmin.name,
        organizationId: 'org-mediera-01',
        branchId: 'br-main-01',
        isSuperAdmin: true,
      };

      const token = signToken(superUser, dto.rememberMe ? 168 : 24);
      return { success: true, token, user: superUser };
    }

    // 2. Query user from database via UserRepository
    const dbUser = await userRepository.findByIdentifier(cleanIdentifier);

    if (dbUser) {
      const userRole = (dbUser.roleName || '').toUpperCase();
      const isPatientRole = userRole === 'PATIENT' || userRole === 'CUSTOMER';

      // Rule: If accessing Patient Portal (/login), only PATIENT role allowed
      if (portal === 'patient' && !isPatientRole) {
        return {
          success: false,
          statusCode: 403,
          error: `Access Denied: This login is only for Patients. Accounts with role '${userRole}' must sign in via /erp/login.`,
        };
      }

      // Rule: If accessing CRM/ERP Portal (/erp/login), PATIENT role strictly rejected
      if (portal === 'erp' && isPatientRole) {
        return {
          success: false,
          statusCode: 403,
          error: 'Access Denied: Patient accounts are strictly prohibited from accessing CRM/ERP back-office. Please sign in via the Patient Portal at /login.',
        };
      }

      if (!dto.password) {
        return { success: false, statusCode: 401, error: 'Password is required to authenticate.' };
      }

      if (!dbUser.active || dbUser.status === 'Suspended') {
        return { success: false, statusCode: 403, error: 'User account is inactive or suspended.' };
      }

      const passwordValid = await userRepository.verifyPassword(dbUser, dto.password);
      if (!passwordValid) {
        return { success: false, statusCode: 401, error: 'Invalid password. Please check your credentials.' };
      }

      const authUser: AuthenticatedUser = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.roleName || (isPatientRole ? 'PATIENT' : 'STAFF'),
        name: dbUser.name,
        organizationId: dbUser.organizationId,
        branchId: dbUser.branchId,
        isSuperAdmin: dbUser.roleName === 'SUPER_ADMIN',
      };

      const token = signToken(authUser, dto.rememberMe ? 168 : 24);
      return { success: true, token, user: authUser };
    }

    // 3. User not found
    return {
      success: false,
      statusCode: 401,
      error: 'Invalid credentials. User not found.',
    };
  }

  /**
   * Registers a new patient into the database with automatic PATIENT role
   */
  public async registerPatient(dto: RegisterPatientDto): Promise<AuthResult> {
    const patientEmail = dto.email || `${dto.firstName.toLowerCase()}.${dto.lastName.toLowerCase()}@example.com`;

    // Strictly enforce PATIENT role
    const newUser = await userRepository.create({
      email: patientEmail,
      name: `${dto.firstName} ${dto.lastName}`,
      phone: dto.phone,
      organizationId: dto.organizationId || 'org-mediera-01',
      roleId: 'role-patient',
      branchIds: [dto.branchId || 'br-main-01'],
      userType: 'Patient',
      status: 'Active',
      password: dto.password,
    });

    const authUser: AuthenticatedUser = {
      id: newUser.id,
      email: newUser.email,
      role: 'PATIENT',
      name: newUser.name,
      organizationId: newUser.organizationId,
      branchId: newUser.branchId,
      isSuperAdmin: false,
    };

    const token = signToken(authUser, 24);
    return { success: true, token, user: authUser };
  }
}


export const authService = new AuthService();
