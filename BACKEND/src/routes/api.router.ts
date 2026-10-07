/**
 * API Router
 * 
 * Registers REST API endpoints strictly following the pipeline:
 * Request -> REST API -> Controllers -> DTO Validation -> Auth -> RBAC -> Services -> Repositories -> Database Adapter
 */

import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { settingsController } from '../controllers/settings.controller';
import { clinicalController } from '../controllers/clinical.controller';
import { databaseController } from '../controllers/database.controller';
import { whatsappController } from '../controllers/whatsapp.controller';
import { auditController } from '../controllers/audit.controller';
import { dashboardController } from '../controllers/dashboard.controller';
import { inventoryController } from '../controllers/inventory.controller';
import { organizationController } from '../controllers/organization.controller';
import { branchController } from '../controllers/branch.controller';
import { roleController } from '../controllers/role.controller';
import { userController } from '../controllers/user.controller';

import {
  authenticate,
  optionalAuthenticate,
  requirePatient,
  requireErpUser,
  requireSuperAdmin,
  requirePatientOwnership,
} from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

import { validateLoginDto, validateRegisterPatientDto } from '../dtos/auth.dto';
import {
  validateCreatePatientDto,
  validateCreateAppointmentDto,
  validateCreateInvoiceDto,
} from '../dtos/records.dto';

const apiRouter = Router();

// --- Health & Database Diagnostics ---
apiRouter.get('/health', (req, res) => databaseController.getHealth(req, res));
apiRouter.get('/database/status', (req, res) => databaseController.getStatus(req, res));
apiRouter.get('/database/test', (req, res) => databaseController.testConnection(req, res));

// --- Authentication Endpoints ---
apiRouter.post('/auth/login', validateBody(validateLoginDto), (req, res) =>
  authController.login(req, res)
);
apiRouter.post('/auth/register-patient', validateBody(validateRegisterPatientDto), (req, res) =>
  authController.registerPatient(req, res)
);
apiRouter.get('/auth/me', authenticate, (req, res) =>
  authController.getMe(req, res)
);
apiRouter.post('/auth/logout', (req, res) =>
  authController.logout(req, res)
);

// --- Settings Endpoints ---
apiRouter.get('/settings', optionalAuthenticate, (req, res) =>
  settingsController.getAllSettings(req, res)
);

// --- Clinical & ERP Operations ---
// Patients
apiRouter.get('/patients', requireErpUser, (req, res) =>
  clinicalController.getPatients(req, res)
);
apiRouter.get('/patients/:id', authenticate, requirePatientOwnership('id'), (req, res) =>
  clinicalController.getPatientById(req, res)
);
apiRouter.patch('/patients/:id', authenticate, requirePatientOwnership('id'), (req, res) =>
  clinicalController.updatePatient(req, res)
);
apiRouter.post('/patients', validateBody(validateCreatePatientDto), (req, res) =>
  clinicalController.createPatient(req, res)
);

// Appointments
apiRouter.get('/appointments', optionalAuthenticate, (req, res) =>
  clinicalController.getAppointments(req, res)
);
apiRouter.post('/appointments', validateBody(validateCreateAppointmentDto), (req, res) =>
  clinicalController.createAppointment(req, res)
);
apiRouter.patch('/appointments/:id/status', requireErpUser, (req, res) =>
  clinicalController.updateAppointmentStatus(req, res)
);

// Doctors (Publicly viewable directory)
apiRouter.get('/doctors', optionalAuthenticate, (req, res) =>
  clinicalController.getDoctors(req, res)
);

// Invoices
apiRouter.get('/invoices', optionalAuthenticate, (req, res) =>
  clinicalController.getInvoices(req, res)
);
apiRouter.post('/invoices', validateBody(validateCreateInvoiceDto), (req, res) =>
  clinicalController.createInvoice(req, res)
);
apiRouter.post('/invoices/:id/pay', optionalAuthenticate, (req, res) =>
  clinicalController.payInvoice(req, res)
);

// --- Medical Inventory & Pharmacy Operations (CRM/ERP Staff Only) ---
apiRouter.get('/inventory/dashboard', requireErpUser, (req, res) =>
  inventoryController.getDashboard(req, res)
);
apiRouter.get('/inventory/items', requireErpUser, (req, res) =>
  inventoryController.getItems(req, res)
);
apiRouter.get('/inventory/items/:id', requireErpUser, (req, res) =>
  inventoryController.getItemById(req, res)
);
apiRouter.post('/inventory/items', requireErpUser, (req, res) =>
  inventoryController.createItem(req, res)
);
apiRouter.put('/inventory/items/:id', requireErpUser, (req, res) =>
  inventoryController.updateItem(req, res)
);
apiRouter.delete('/inventory/items/:id', requireSuperAdmin, (req, res) =>
  inventoryController.deleteItem(req, res)
);
apiRouter.post('/inventory/stock-in', requireErpUser, (req, res) =>
  inventoryController.stockIn(req, res)
);
apiRouter.post('/inventory/stock-out', requireErpUser, (req, res) =>
  inventoryController.stockOut(req, res)
);
apiRouter.post('/inventory/adjustments', requireErpUser, (req, res) =>
  inventoryController.createAdjustment(req, res)
);
apiRouter.get('/inventory/movements', requireErpUser, (req, res) =>
  inventoryController.getMovements(req, res)
);
apiRouter.get('/inventory/adjustments', requireErpUser, (req, res) =>
  inventoryController.getAdjustments(req, res)
);
apiRouter.get('/inventory/categories', requireErpUser, (req, res) =>
  inventoryController.getCategories(req, res)
);
apiRouter.post('/inventory/categories', requireErpUser, (req, res) =>
  inventoryController.createCategory(req, res)
);
apiRouter.get('/inventory/suppliers', requireErpUser, (req, res) =>
  inventoryController.getSuppliers(req, res)
);
apiRouter.post('/inventory/suppliers', requireErpUser, (req, res) =>
  inventoryController.createSupplier(req, res)
);

// --- System Audit & Governance Logs (Super Admin Only) ---
apiRouter.get('/audit-logs', requireSuperAdmin, (req, res) =>
  auditController.getAuditLogs(req, res)
);
apiRouter.post('/audit-logs', requireSuperAdmin, (req, res) =>
  auditController.createAuditLog(req, res)
);

// --- Real Operations & Dashboard Metrics (CRM/ERP Staff Only) ---
apiRouter.get('/dashboard/stats', requireErpUser, (req, res) =>
  dashboardController.getStats(req, res)
);
apiRouter.get('/stats', requireErpUser, (req, res) =>
  dashboardController.getStats(req, res)
);

// --- WhatsApp Business Platform & Notification Engine (CRM/ERP Staff Only) ---
apiRouter.get('/whatsapp/notifications', requireErpUser, (req, res) =>
  whatsappController.getNotifications(req, res)
);
apiRouter.get('/whatsapp/stats', requireErpUser, (req, res) =>
  whatsappController.getStats(req, res)
);
apiRouter.get('/whatsapp/config', requireErpUser, (req, res) =>
  whatsappController.getConfig(req, res)
);
apiRouter.post('/whatsapp/scheduler/tick', requireSuperAdmin, (req, res) =>
  whatsappController.runSchedulerTick(req, res)
);
apiRouter.post('/whatsapp/notifications/:id/retry', requireErpUser, (req, res) =>
  whatsappController.retryNotification(req, res)
);
apiRouter.post('/whatsapp/test-send', requireErpUser, (req, res) =>
  whatsappController.sendTestNotification(req, res)
);

// Meta Graph API Webhooks
apiRouter.get('/whatsapp/webhook', (req, res) =>
  whatsappController.webhookVerify(req, res)
);
apiRouter.post('/whatsapp/webhook', (req, res) =>
  whatsappController.webhookReceive(req, res)
);

// --- Healthcare Hierarchy: Organizations, Branches, Roles & Users ---
// Public Setup Token verification
apiRouter.post('/auth/setup-password', (req, res) =>
  userController.completePasswordSetup(req, res)
);

// Organizations
apiRouter.get('/organizations', requireErpUser, (req, res) =>
  organizationController.getOrganizations(req, res)
);
apiRouter.get('/organizations/:id', requireErpUser, (req, res) =>
  organizationController.getOrganizationById(req, res)
);
apiRouter.post('/organizations', requireSuperAdmin, (req, res) =>
  organizationController.createOrganization(req, res)
);
apiRouter.put('/organizations/:id', requireSuperAdmin, (req, res) =>
  organizationController.updateOrganization(req, res)
);
apiRouter.patch('/organizations/:id/status', requireSuperAdmin, (req, res) =>
  organizationController.setStatus(req, res)
);
apiRouter.delete('/organizations/:id', requireSuperAdmin, (req, res) =>
  organizationController.deleteOrganization(req, res)
);

// Branches
apiRouter.get('/branches', requireErpUser, (req, res) =>
  branchController.getBranches(req, res)
);
apiRouter.get('/branches/:id', requireErpUser, (req, res) =>
  branchController.getBranchById(req, res)
);
apiRouter.post('/branches', requireSuperAdmin, (req, res) =>
  branchController.createBranch(req, res)
);
apiRouter.put('/branches/:id', requireSuperAdmin, (req, res) =>
  branchController.updateBranch(req, res)
);
apiRouter.put('/branches/:id/settings', requireSuperAdmin, (req, res) =>
  branchController.updateSettings(req, res)
);
apiRouter.patch('/branches/:id/status', requireSuperAdmin, (req, res) =>
  branchController.setStatus(req, res)
);
apiRouter.delete('/branches/:id', requireSuperAdmin, (req, res) =>
  branchController.deleteBranch(req, res)
);

// Roles & Permissions
apiRouter.get('/roles', requireErpUser, (req, res) =>
  roleController.getRoles(req, res)
);
apiRouter.get('/roles/:id', requireErpUser, (req, res) =>
  roleController.getRoleById(req, res)
);
apiRouter.post('/roles', requireSuperAdmin, (req, res) =>
  roleController.createRole(req, res)
);
apiRouter.put('/roles/:id', requireSuperAdmin, (req, res) =>
  roleController.updateRole(req, res)
);
apiRouter.patch('/roles/:id/status', requireSuperAdmin, (req, res) =>
  roleController.setStatus(req, res)
);
apiRouter.delete('/roles/:id', requireSuperAdmin, (req, res) =>
  roleController.deleteRole(req, res)
);
apiRouter.get('/permissions', requireErpUser, (req, res) =>
  roleController.getPermissions(req, res)
);

// Users & Onboarding (Super Admin Manages CRM/ERP Users)
apiRouter.get('/users', requireErpUser, (req, res) =>
  userController.getUsers(req, res)
);
apiRouter.get('/users/:id', requireErpUser, (req, res) =>
  userController.getUserById(req, res)
);
apiRouter.post('/users', requireSuperAdmin, (req, res) =>
  userController.createUser(req, res)
);
apiRouter.put('/users/:id', requireSuperAdmin, (req, res) =>
  userController.updateUser(req, res)
);
apiRouter.patch('/users/:id/status', requireSuperAdmin, (req, res) =>
  userController.setStatus(req, res)
);
apiRouter.delete('/users/:id', requireSuperAdmin, (req, res) =>
  userController.deleteUser(req, res)
);
apiRouter.post('/users/:id/resend-invite', requireSuperAdmin, (req, res) =>
  userController.resendInvite(req, res)
);

export { apiRouter };
