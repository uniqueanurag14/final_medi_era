import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Branch } from '../types';
import { dbService } from '../services/mockDatabase';

interface AuthContextType {
  currentUser: User;
  user: User;
  currentRole: UserRole;
  currentBranch: Branch;
  allBranches: Branch[];
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  setRole: (role: UserRole) => void;
  setRoleAndUser: (role: UserRole, user?: Partial<User>) => void;
  setBranch: (branchId: string) => void;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
  loginAs: (role: UserRole, customName?: string, customEmail?: string) => void;
  login: (identifier: string, password?: string, requestedRole?: 'patient' | 'erp' | UserRole) => Promise<{ success: boolean; error?: string; user?: User }>;
  registerPatient: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    address: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalHistory?: string[];
    allergies?: string[];
    branchId?: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string; patient?: any; user?: User }>;
  registerStaff: (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    department: string;
    branchId: string;
    licenseNumber?: string;
    shift?: 'Morning (08:00 - 16:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 08:00)' | 'General (09:00 - 18:00)';
    password?: string;
  }) => { success: boolean; error?: string; user?: User };
  registerSuperAdmin: (data: {
    name: string;
    email: string;
    phone: string;
    orgName: string;
    branchName?: string;
    password?: string;
  }) => { success: boolean; error?: string; user?: User };
}

// Unauthenticated Guest representation for safe UI rendering
const GUEST_ANONYMOUS_USER: User = {
  id: 'usr-unauthenticated',
  organizationId: 'org-01',
  branchId: 'branch-01',
  role: 'CUSTOMER',
  email: 'guest@mediera.local',
  name: 'Guest Visitor',
  active: false,
  permissions: [],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load authenticated session from storage if present
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const stored = localStorage.getItem('mediera_session_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.role && parsed.active) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors and fall back to guest
    }
    return GUEST_ANONYMOUS_USER;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem('mediera_session_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role && parsed.active) {
          return parsed.role;
        }
      }
    } catch {
      // Ignore
    }
    return 'CUSTOMER';
  });

  const [currentBranchId, setCurrentBranchId] = useState<string>(() => {
    return localStorage.getItem('clinic_crm_active_branch') || 'branch-01';
  });

  // Sync state changes with session storage
  useEffect(() => {
    if (currentUser.id !== 'usr-unauthenticated') {
      localStorage.setItem('mediera_session_user', JSON.stringify(currentUser));
      localStorage.setItem('clinic_crm_active_role', currentRole);
    }
  }, [currentUser, currentRole]);

  useEffect(() => {
    localStorage.setItem('clinic_crm_active_branch', currentBranchId);
  }, [currentBranchId]);

  const allBranches = dbService.branches;
  const currentBranch = allBranches.find((b) => b.id === currentBranchId) || allBranches[0] || {
    id: 'branch-01',
    organizationId: 'org-01',
    name: 'Main Medical Center',
    code: 'MMC-01',
    address: '100 Medical Center Way',
    city: 'Metro City',
    state: 'State',
    country: 'Country',
    zipCode: '10001',
    postalCode: '10001',
    phone: '+1 (555) 000-0000',
    email: 'info@mediera.local',
    isMainBranch: true,
    active: true,
    status: 'Active',
    departments: [],
    operatingHours: '8:00 AM - 8:00 PM',
  };

  const isAuthenticated = Boolean(
    currentUser && currentUser.active && currentUser.id !== 'usr-unauthenticated'
  );

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  const setRoleAndUser = (role: UserRole, customUser?: Partial<User>) => {
    setCurrentRole(role);
    if (customUser) {
      setCurrentUser((prev) => ({
        ...prev,
        ...customUser,
        role,
      }));
    }
  };

  const setBranch = (branchId: string) => {
    setCurrentBranchId(branchId);
  };

  // Disabled bypass function
  const loginAs = (_role: UserRole, _customName?: string, _customEmail?: string) => {
    console.warn('[AuthContext] Mock role switching bypass is disabled. Authenticate via /admin or Patient Portal.');
  };

  // --- Strict Credentials & Account Authentication ---
  const login = async (
    identifier: string,
    password?: string,
    portalOrRole?: 'patient' | 'erp' | UserRole
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanId = identifier.trim();

    if (!cleanId) {
      return { success: false, error: 'Email, username, or phone number is required.' };
    }

    if (!password) {
      return { success: false, error: 'Password is required to authenticate.' };
    }

    const portalStr = portalOrRole ? String(portalOrRole) : '';
    const resolvedPortal: 'patient' | 'erp' | undefined =
      portalStr === 'patient' || portalStr === 'PATIENT' || portalStr === 'CUSTOMER'
        ? 'patient'
        : portalStr === 'erp' || (portalStr !== '' && portalStr !== 'PATIENT' && portalStr !== 'CUSTOMER')
        ? 'erp'
        : undefined;

    // 1. Try server-side proxy route if available
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password, portal: resolvedPortal }),
      });
      const data = await resp.json().catch(() => null);

      if (resp.status >= 400 || (data && !data.success)) {
        return {
          success: false,
          error: data?.error || (resp.status === 403 ? 'Access forbidden for this account type.' : 'Authentication failed.'),
        };
      }

      if (data && data.success && data.data && data.data.user) {
        const u = data.data.user;
        const targetRole = (u.role === 'SUPERADMIN' ? 'SUPER_ADMIN' : u.role) as UserRole;
        const authUser: User = {
          id: u.id,
          organizationId: u.organizationId || 'org-01',
          branchId: u.branchId || currentBranchId,
          role: targetRole,
          email: u.email,
          name: u.name,
          active: true,
          permissions: u.isSuperAdmin ? ['all'] : (u.permissions || ['patient_portal.access']),
        };
        setCurrentRole(targetRole);
        setCurrentUser(authUser);
        localStorage.setItem('mediera_session_user', JSON.stringify(authUser));
        if (data.data.token) {
          localStorage.setItem('mediera_auth_token', data.data.token);
          localStorage.setItem('clinic_crm_auth_token', data.data.token);
        }
        dbService.recordLoginAttempt({
          userId: authUser.id,
          email: authUser.email,
          role: targetRole,
          success: true,
          ipAddress: '127.0.0.1',
          userAgent: 'Production Web Client',
          loginMethod: 'Password',
        });
        return { success: true, user: authUser };
      }
    } catch {
      // Backend not reached or offline, fallback to database verification
    }

    // 2. Direct database authentication via dbService
    const result = dbService.authenticateUser(cleanId, password, resolvedPortal === 'patient' ? 'PATIENT' : undefined);
    if (result.success && result.user) {
      if (resolvedPortal === 'patient' && result.user.role !== 'PATIENT' && result.user.role !== 'CUSTOMER') {
        return {
          success: false,
          error: 'Access Denied: This login is only for Patients. Staff and Administrators must log in at /erp/login.',
        };
      }
      if (resolvedPortal === 'erp' && (result.user.role === 'PATIENT' || result.user.role === 'CUSTOMER')) {
        return {
          success: false,
          error: 'Access Denied: Patient accounts cannot access CRM/ERP. Please sign in via the Patient Portal at /login.',
        };
      }
      setCurrentRole(result.user.role as UserRole);
      setCurrentUser(result.user);
      localStorage.setItem('mediera_session_user', JSON.stringify(result.user));
      dbService.recordLoginAttempt({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        success: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Internal Client',
        loginMethod: 'Password',
      });
      return { success: true, user: result.user };
    }

    return {
      success: false,
      error: result.error || 'Invalid credentials. User not found.',
    };
  };

  // --- Real Patient Self-Registration ---
  const registerPatient = async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    address: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalHistory?: string[];
    allergies?: string[];
    branchId?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string; patient?: any; user?: User }> => {
    if (!data.firstName || !data.lastName || !data.phone) {
      return { success: false, error: 'First name, last name, and phone number are required.' };
    }

    try {
      const resp = await fetch('/api/auth/register-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@example.com`,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          bloodGroup: data.bloodGroup || 'O+',
          address: data.address.trim(),
          branchId: data.branchId || currentBranchId,
          password: data.password,
          allergies: data.allergies || [],
          medicalHistory: data.medicalHistory || [],
        }),
      });

      const res = await resp.json().catch(() => null);
      if (res && res.success && res.data && res.data.user) {
        const u = res.data.user;
        const patUser: User = {
          id: u.id,
          organizationId: u.organizationId || 'org-01',
          branchId: u.branchId || currentBranchId,
          role: 'PATIENT',
          email: u.email,
          name: u.name,
          phone: data.phone.trim(),
          patientId: u.id,
          active: true,
          permissions: ['patient_portal.access'],
        };

        setCurrentRole('PATIENT');
        setCurrentUser(patUser);
        localStorage.setItem('mediera_session_user', JSON.stringify(patUser));
        if (res.data.token) {
          localStorage.setItem('mediera_auth_token', res.data.token);
          localStorage.setItem('clinic_crm_auth_token', res.data.token);
        }

        const newPatient = dbService.createPatient({
          organizationId: u.organizationId || 'org-01',
          branchId: u.branchId || currentBranchId,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone.trim(),
          email: u.email,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          bloodGroup: (data.bloodGroup as any) || 'O+',
          address: data.address.trim(),
          city: 'Metro City',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          emergencyRelationship: 'Family',
          allergies: data.allergies || [],
          medicalConditions: data.medicalHistory || [],
          currentMedications: [],
          category: 'New',
          status: 'Active',
          isDemo: false,
        });

        return { success: true, patient: newPatient, user: patUser };
      }
    } catch {
      // Backend not running, proceed to client database
    }

    // Local client database registration
    const newPatient: any = dbService.createPatient({
      organizationId: 'org-01',
      branchId: data.branchId || currentBranchId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@patient.local`,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: (data.bloodGroup as any) || 'O+',
      address: data.address.trim(),
      city: 'Metro City',
      emergencyContactName: data.emergencyContactName || '',
      emergencyContactPhone: data.emergencyContactPhone || '',
      emergencyRelationship: 'Family',
      allergies: data.allergies || [],
      medicalConditions: data.medicalHistory || [],
      currentMedications: [],
      category: 'New',
      status: 'Active',
      isDemo: false,
    });

    const patUser: User = {
      id: `usr-${newPatient.id}`,
      organizationId: newPatient.organizationId,
      branchId: newPatient.branchId,
      role: 'PATIENT',
      email: newPatient.email,
      name: `${newPatient.firstName} ${newPatient.lastName}`,
      phone: newPatient.phone,
      patientId: newPatient.id,
      active: true,
      permissions: ['patient_portal.access'],
    };

    setCurrentRole('PATIENT');
    setCurrentUser(patUser);
    localStorage.setItem('mediera_session_user', JSON.stringify(patUser));
    if (newPatient.branchId) setCurrentBranchId(newPatient.branchId);

    return { success: true, patient: newPatient, user: patUser };
  };

  // --- Staff Registration by Super Admin ---
  const registerStaff = (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    department: string;
    branchId: string;
    licenseNumber?: string;
    shift?: 'Morning (08:00 - 16:00)' | 'Evening (14:00 - 22:00)' | 'Night (22:00 - 08:00)' | 'General (09:00 - 18:00)';
    password?: string;
  }) => {
    if (!data.name || !data.email || !data.role) {
      return { success: false, error: 'Name, email, and staff role are mandatory.' };
    }

    const createdStaff = dbService.createStaffMember({
      organizationId: 'org-01',
      branchId: data.branchId || currentBranchId,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: data.role,
      department: data.department || 'Clinical Operations',
      joiningDate: new Date().toISOString().split('T')[0],
      shift: data.shift || 'General (09:00 - 18:00)',
      status: 'Active',
    });

    const roleDef = dbService.getRoles().find(
      (r) =>
        r.id === data.role ||
        r.id === `role-${data.role.toLowerCase().replace(/_/g, '-')}` ||
        r.name.toUpperCase().replace(/\s+/g, '_') === data.role
    );

    const staffUser: User = {
      id: `usr-${createdStaff.id}`,
      organizationId: 'org-01',
      branchId: createdStaff.branchId,
      role: data.role,
      email: createdStaff.email,
      name: createdStaff.name,
      phone: createdStaff.phone,
      active: true,
      permissions: roleDef?.permissions || ['patient.view', 'appointment.view'],
    };

    return { success: true, user: staffUser };
  };

  // --- Super Admin Configuration ---
  const registerSuperAdmin = (data: {
    name: string;
    email: string;
    phone: string;
    orgName: string;
    branchName?: string;
    password?: string;
  }) => {
    if (!data.name || !data.email || !data.orgName) {
      return { success: false, error: 'Executive name, official email, and organization name are required.' };
    }

    dbService.updateOrganization({
      name: data.orgName,
      email: data.email,
      phone: data.phone,
    });

    const adminUser: User = {
      id: `usr-super-${Date.now()}`,
      organizationId: 'org-01',
      branchId: currentBranchId,
      role: 'SUPER_ADMIN',
      email: data.email.trim(),
      name: `${data.name.trim()} (Executive Super Admin)`,
      phone: data.phone.trim(),
      active: true,
      permissions: ['all'],
    };

    setCurrentRole('SUPER_ADMIN');
    setCurrentUser(adminUser);
    localStorage.setItem('mediera_session_user', JSON.stringify(adminUser));

    return { success: true, user: adminUser };
  };

  const logout = () => {
    localStorage.removeItem('mediera_session_user');
    localStorage.removeItem('mediera_session_token');
    localStorage.removeItem('mediera_auth_token');
    localStorage.removeItem('clinic_crm_auth_token');
    localStorage.removeItem('clinic_crm_active_role');
    setCurrentRole('CUSTOMER');
    setCurrentUser(GUEST_ANONYMOUS_USER);
  };

  const hasPermission = (permission: string): boolean => {
    // Unauthenticated visitors have no permissions
    if (!isAuthenticated) {
      return false;
    }

    // Critical Security Rule: Super Admin account has immutable full access
    if (currentRole === 'SUPER_ADMIN' || currentUser.role === 'SUPER_ADMIN') {
      return true;
    }

    // Account status validation
    if (!currentUser.active) {
      return false;
    }

    // Check dynamic roles permissions
    const dynamicRoles = dbService.getRoles();
    const userRoleDef = dynamicRoles.find(
      (r) =>
        r.id === currentUser.role ||
        r.id === `role-${currentUser.role.toLowerCase().replace(/_/g, '-')}` ||
        r.name.toUpperCase().replace(/\s+/g, '_') === currentUser.role
    );

    const effectivePerms = new Set<string>([
      ...(currentUser.permissions || []),
      ...(userRoleDef?.permissions || []),
    ]);

    if (effectivePerms.has('all')) return true;
    if (effectivePerms.has(permission)) return true;

    const aliases: string[] = [];
    if (permission === 'patient.view' || permission === 'customer.view') {
      aliases.push('patient.view', 'customer.view', 'patients.read', 'patients.*');
    } else if (permission === 'patient.create' || permission === 'customer.create') {
      aliases.push('patient.create', 'customer.create', 'patients.create', 'patients.*');
    } else if (permission === 'patient.update' || permission === 'customer.update') {
      aliases.push('patient.update', 'customer.update', 'patients.update', 'patients.*');
    } else if (permission === 'patient.delete' || permission === 'customer.delete') {
      aliases.push('patient.delete', 'customer.delete', 'patients.delete', 'patients.*');
    }

    if (aliases.some((a) => effectivePerms.has(a))) return true;

    const prefix = permission.split('.')[0];
    if (effectivePerms.has(`${prefix}.*`)) return true;
    return false;
  };

  const isSuperAdmin =
    isAuthenticated &&
    (currentRole === 'SUPER_ADMIN' ||
      currentUser.role === 'SUPER_ADMIN' ||
      currentUser.roleId === 'role-super-admin' ||
      currentUser.email === 'dev.sinha14@gmail.com');

  const enrichedUser: User = {
    ...currentUser,
    firstName: currentUser.firstName || currentUser.name?.split(' ')[0] || 'User',
    lastName: currentUser.lastName || currentUser.name?.split(' ').slice(1).join(' ') || '',
    displayName: currentUser.displayName || currentUser.name || currentUser.email,
    roleName: currentUser.roleName || (typeof currentUser.role === 'string' ? currentUser.role : 'User'),
    status: currentUser.status || (currentUser.active ? 'ACTIVE' : 'INACTIVE'),
    emailVerified: currentUser.emailVerified ?? true,
    themePreference: currentUser.themePreference || 'system',
    createdAt: currentUser.createdAt || '2026-01-01T00:00:00Z',
    updatedAt: currentUser.updatedAt || '2026-01-01T00:00:00Z',
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('mediera_session_token');
      if (token) {
        const res = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.data) {
            setCurrentUser(data.data);
          }
        }
      }
    } catch {
      // Ignore network errors on refresh
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem('mediera_session_token');
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) {
        return { success: true, message: data.message || 'Password updated successfully.' };
      }
      return { success: false, message: data.error?.message || data.message || 'Failed to update password.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to update password.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: enrichedUser,
        user: enrichedUser,
        currentRole,
        currentBranch,
        allBranches,
        isSuperAdmin,
        isAuthenticated,
        refreshUser,
        changePassword,
        setRole,
        setRoleAndUser,
        setBranch,
        hasPermission,
        logout,
        loginAs,
        login,
        registerPatient,
        registerStaff,
        registerSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
