/**
 * User Service
 * 
 * Business logic layer for MediEra Users, Staff, Practitioners & RBAC Onboarding.
 * Follows the prompt workflow:
 * Super Admin -> Select Organization -> Select Branch(es) -> Create User -> Assign Role ->
 * Assign Permissions through Role -> Save User -> Send secure password setup link.
 */

import bcrypt from 'bcryptjs';
import { userRepository, DbUserWithBranches } from '../repositories/user.repository';
import { auditService } from './audit.service';
import { emailService } from './email.service';

export class UserService {
  public async getUsers(params?: {
    organizationId?: string;
    branchId?: string;
    role?: string;
    status?: string;
    search?: string;
  }) {
    return userRepository.findAll(params);
  }

  public async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error(`User with ID "${id}" not found.`);
    }
    return user;
  }

  public async createUser(data: {
    email: string;
    name: string;
    phone?: string;
    organizationId: string;
    roleId: string;
    branchIds?: string[];
    branchRoles?: Record<string, string>;
    designation?: string;
    department?: string;
    userType?: string;
    status?: 'Active' | 'Inactive' | 'Invited';
    avatarUrl?: string;
  }, actor?: { id?: string; name?: string; email?: string }) {
    if (!data.email || !data.email.trim()) {
      throw new Error('User email address is required.');
    }
    if (!data.name || !data.name.trim()) {
      throw new Error('User full name is required.');
    }
    if (!data.organizationId) {
      throw new Error('User must be assigned to an Organization.');
    }
    if (!data.roleId) {
      throw new Error('User must be assigned a Role.');
    }

    const user = await userRepository.create(data);

    // Send secure password setup email if invited
    if (user.setupToken) {
      const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?setupToken=${user.setupToken}`;
      try {
        await emailService.sendMail({
          to: user.email,
          subject: 'MediEra Healthcare Portal — Account Setup & Password Creation',
          text: `Hello ${user.name},\n\nYou have been invited to MediEra Healthcare Management System.\nPlease activate your account and create your password using this secure link:\n${setupUrl}\n\nThis setup link expires in 7 days.\n\nBest regards,\nMediEra Healthcare Team`,
        }).catch((mailErr) => {
          console.warn('[UserService.createUser email warning]', mailErr.message);
        });
      } catch {
        // Continue even if SMTP simulation
      }
    }

    await auditService.log({
      action: 'USER_ONBOARD',
      resource: 'user',
      resourceId: user.id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: {
        name: user.name,
        email: user.email,
        role: user.roleName,
        branchesCount: user.branches.length,
      },
    });

    return user;
  }

  public async updateUser(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    roleId?: string;
    organizationId?: string;
    branchIds?: string[];
    branchRoles?: Record<string, string>;
    designation?: string;
    department?: string;
    userType?: string;
    status?: 'Active' | 'Inactive' | 'Invited' | 'Suspended';
    avatarUrl?: string;
  }, actor?: { id?: string; name?: string; email?: string }) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new Error(`User with ID "${id}" not found.`);
    }

    const updated = await userRepository.update(id, data);

    await auditService.log({
      action: 'USER_UPDATE',
      resource: 'user',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { changes: Object.keys(data) },
    });

    return updated;
  }

  public async setUserStatus(id: string, status: 'Active' | 'Inactive', actor?: { id?: string; name?: string; email?: string }) {
    const success = await userRepository.setStatus(id, status);
    if (!success) {
      throw new Error(`Failed to update status for user ID "${id}".`);
    }

    await auditService.log({
      action: 'USER_STATUS_CHANGE',
      resource: 'user',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { status },
    });

    return { success: true, status };
  }

  public async deleteUser(id: string, actor?: { id?: string; name?: string; email?: string }) {
    const success = await userRepository.delete(id);
    if (!success) {
      throw new Error(`Failed to delete user ID "${id}".`);
    }

    await auditService.log({
      action: 'USER_DELETE',
      resource: 'user',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { userId: id },
    });

    return { success: true };
  }

  public async resendInvite(id: string, actor?: { id?: string; name?: string; email?: string }) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error(`User with ID "${id}" not found.`);
    }

    const token = await userRepository.generateSetupToken(id);
    const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?setupToken=${token}`;

    try {
      await emailService.sendMail({
        to: user.email,
        subject: 'MediEra Healthcare Portal — Account Setup Link (Resent)',
        text: `Hello ${user.name},\n\nHere is your requested setup link to activate your MediEra account:\n${setupUrl}\n\nThis link is valid for 7 days.\n\nBest regards,\nMediEra Healthcare Team`,
      }).catch((e) => console.warn('[resendInvite email error]', e.message));
    } catch {
      // Continue
    }

    await auditService.log({
      action: 'USER_INVITE_RESENT',
      resource: 'user',
      resourceId: id,
      userEmail: actor?.email || 'admin@mediera.com',
      metadata: { email: user.email },
    });

    return {
      success: true,
      setupToken: token,
      setupUrl,
      message: `Setup invitation successfully sent to ${user.email}.`,
    };
  }

  public async completePasswordSetup(token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const user = await userRepository.verifySetupToken(token);
    if (!user) {
      throw new Error('Setup link is invalid or has expired. Please contact your clinic administrator.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const success = await userRepository.completePasswordSetup(token, passwordHash);
    if (!success) {
      throw new Error('Failed to complete password setup. Please try again.');
    }

    await auditService.log({
      action: 'USER_PASSWORD_SETUP_COMPLETED',
      resource: 'user',
      resourceId: user.id,
      userEmail: user.email,
      metadata: { message: 'First-time password setup completed successfully.' },
    });

    return { success: true, email: user.email };
  }
}

export const userService = new UserService();
