/**
 * Authentication & User DTOs with strict validation
 */

export interface LoginDto {
  identifier: string; // email, username or phone
  password?: string;
  portal?: 'patient' | 'erp';
  role?: string;
  rememberMe?: boolean;
}

export function validateLoginDto(data: any): { valid: boolean; errors: string[]; dto?: LoginDto } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const identifier = String(data.identifier || data.email || data.username || '').trim();
  if (!identifier) {
    errors.push('Identifier (email, username, or phone) is required');
  }

  const portal = data.portal ? (String(data.portal).toLowerCase() === 'erp' ? 'erp' : 'patient') : undefined;

  return {
    valid: errors.length === 0,
    errors,
    dto: errors.length === 0 ? {
      identifier,
      password: data.password ? String(data.password) : undefined,
      portal,
      role: data.role ? String(data.role) : undefined,
      rememberMe: Boolean(data.rememberMe),
    } : undefined,
  };
}

export interface RegisterPatientDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  organizationId?: string;
  branchId?: string;
  password?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string[];
  medicalHistory?: string[];
}

export function validateRegisterPatientDto(data: any): { valid: boolean; errors: string[]; dto?: RegisterPatientDto } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const firstName = String(data.firstName || '').trim();
  const lastName = String(data.lastName || '').trim();
  const phone = String(data.phone || '').trim();

  if (!firstName) errors.push('First name is required');
  if (!lastName) errors.push('Last name is required');
  if (!phone) errors.push('Phone number is required');

  // Security: Patient self-registration CANNOT set role or userType. It is always PATIENT.
  return {
    valid: errors.length === 0,
    errors,
    dto: errors.length === 0 ? {
      firstName,
      lastName,
      phone,
      email: data.email ? String(data.email).trim() : undefined,
      dateOfBirth: data.dateOfBirth ? String(data.dateOfBirth) : undefined,
      gender: (['Male', 'Female', 'Other'].includes(data.gender) ? data.gender : 'Other') as 'Male' | 'Female' | 'Other',
      address: data.address ? String(data.address).trim() : undefined,
      organizationId: data.organizationId ? String(data.organizationId).trim() : 'org-mediera-01',
      branchId: data.branchId ? String(data.branchId).trim() : 'br-main-01',
      password: data.password ? String(data.password) : undefined,
      bloodGroup: data.bloodGroup ? String(data.bloodGroup) : 'O+',
      emergencyContactName: data.emergencyContactName ? String(data.emergencyContactName).trim() : undefined,
      emergencyContactPhone: data.emergencyContactPhone ? String(data.emergencyContactPhone).trim() : undefined,
      allergies: Array.isArray(data.allergies) ? data.allergies.map(String) : [],
      medicalHistory: Array.isArray(data.medicalHistory) ? data.medicalHistory.map(String) : [],
    } : undefined,
  };
}

export interface CreateCrmUserDto {
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  organizationId: string;
  branchIds?: string[];
  branchRoles?: Record<string, string>;
  designation?: string;
  department?: string;
  userType?: string;
  password?: string;
  status?: 'Active' | 'Inactive' | 'Invited';
}

export function validateCreateCrmUserDto(data: any): { valid: boolean; errors: string[]; dto?: CreateCrmUserDto } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim().toLowerCase();
  const roleId = String(data.roleId || '').trim();
  const organizationId = String(data.organizationId || 'org-mediera-01').trim();

  if (!name) errors.push('Full name is required');
  if (!email || !email.includes('@')) errors.push('A valid email address is required');
  if (!roleId) errors.push('A valid role selection is required');

  return {
    valid: errors.length === 0,
    errors,
    dto: errors.length === 0 ? {
      name,
      email,
      phone: data.phone ? String(data.phone).trim() : undefined,
      roleId,
      organizationId,
      branchIds: Array.isArray(data.branchIds) && data.branchIds.length > 0 ? data.branchIds.map(String) : ['br-main-01'],
      branchRoles: data.branchRoles && typeof data.branchRoles === 'object' ? data.branchRoles : undefined,
      designation: data.designation ? String(data.designation).trim() : undefined,
      department: data.department ? String(data.department).trim() : undefined,
      userType: data.userType ? String(data.userType).trim() : 'Staff',
      password: data.password ? String(data.password) : undefined,
      status: data.status && ['Active', 'Inactive', 'Invited'].includes(data.status) ? data.status : 'Active',
    } : undefined,
  };
}

