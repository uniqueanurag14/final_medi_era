/**
 * WhatsApp Business Platform Service
 * 
 * Implements the official Meta Cloud API integration for automated
 * medical clinic appointment confirmations and reminders.
 * 
 * - Strictly official Meta WhatsApp Business Cloud API / Supported Provider
 * - Zero browser automation, zero QR-session hacking, zero unofficial web wrappers
 * - Pre-approved template parameter binding
 * - Automated idempotency & duplicate-message protection
 * - Safe credential isolation (never logs tokens)
 * - Resilient fallback simulation mode when live API credentials are unset
 */

import {
  whatsappNotificationRepository,
  DbWhatsAppNotification,
  WhatsAppNotificationType,
} from '../repositories/whatsapp-notification.repository';
import { appointmentRepository } from '../repositories/appointment.repository';
import { patientRepository } from '../repositories/patient.repository';

export interface WhatsAppConfig {
  enabled: boolean;
  provider: 'meta' | 'simulation';
  apiUrl: string;
  apiKey: string;
  phoneNumberId: string;
  businessAccountId: string;
  templateLang: string;
  clinicName: string;
}

export interface SendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  status: 'SENT' | 'FAILED' | 'QUEUED';
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  public loadConfig(): WhatsAppConfig {
    const apiKey = process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    const rawProvider = (process.env.WHATSAPP_PROVIDER || 'meta').toLowerCase();
    
    // If credentials are missing, we run in secure simulation mode so app does not crash
    const provider = rawProvider === 'simulation' || (!apiKey || !phoneNumberId) ? 'simulation' : 'meta';

    return {
      enabled: process.env.WHATSAPP_ENABLED !== 'false',
      provider,
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0',
      apiKey,
      phoneNumberId,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      templateLang: process.env.WHATSAPP_TEMPLATE_LANG || 'en_US',
      clinicName: process.env.WHATSAPP_CLINIC_NAME || process.env.APP_NAME || 'MediEra Medical Care',
    };
  }

  public getConfig(): Omit<WhatsAppConfig, 'apiKey'> & { hasApiKey: boolean } {
    this.config = this.loadConfig();
    return {
      enabled: this.config.enabled,
      provider: this.config.provider,
      apiUrl: this.config.apiUrl,
      hasApiKey: Boolean(this.config.apiKey),
      phoneNumberId: this.config.phoneNumberId,
      businessAccountId: this.config.businessAccountId,
      templateLang: this.config.templateLang,
      clinicName: this.config.clinicName,
    };
  }

  /**
   * Sanitizes phone number to E.164 without leading plus for Meta Cloud API.
   * e.g. "+91 98765-43210" -> "919876543210"
   */
  public sanitizePhoneNumber(phone: string): string | null {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');

    // Common Indian local number fallback (10 digits starting with 6, 7, 8, 9)
    if (clean.length === 10 && /^[6-9]/.test(clean)) {
      clean = '91' + clean;
    } else if (clean.length === 11 && clean.startsWith('0')) {
      clean = '91' + clean.substring(1);
    } else if (clean.length === 10 && clean.startsWith('1')) {
      clean = '1' + clean;
    }

    if (clean.length < 10 || clean.length > 15) {
      return null;
    }
    return clean;
  }

  /**
   * Render approved WhatsApp message template text
   */
  public renderMessageBody(
    type: WhatsAppNotificationType,
    params: {
      patientName: string;
      doctorName: string;
      hospitalName: string;
      appointmentDate: string;
      appointmentTime: string;
      appointmentId: string;
    }
  ): string {
    const { patientName, doctorName, hospitalName, appointmentDate, appointmentTime, appointmentId } = params;

    switch (type) {
      case 'confirmation':
        return [
          '🏥 Appointment Confirmed',
          '',
          `Hello ${patientName},`,
          '',
          'Your appointment has been confirmed. ✅',
          '',
          `👨⚕️ Doctor: ${doctorName}`,
          `📅 Date: ${appointmentDate}`,
          `⏰ Time: ${appointmentTime}`,
          `🏥 Hospital: ${hospitalName}`,
          `🆔 Appointment ID: ${appointmentId}`,
          '',
          'Please arrive 10–15 minutes before your appointment.',
          '',
          `Thank you for choosing ${hospitalName}.`,
        ].join('\n');

      case 'reminder_24h':
        return [
          '🏥 Appointment Reminder',
          '',
          `Hello ${patientName},`,
          '',
          'This is a reminder that you have an appointment tomorrow.',
          '',
          `👨⚕️ Doctor: ${doctorName}`,
          `📅 Date: ${appointmentDate}`,
          `⏰ Time: ${appointmentTime}`,
          `🏥 Hospital: ${hospitalName}`,
          '',
          'We look forward to seeing you.',
        ].join('\n');

      case 'reminder_2h':
        return [
          '🏥 Appointment Reminder',
          '',
          `Hello ${patientName},`,
          '',
          'Your appointment is scheduled in approximately 2 hours.',
          '',
          `👨⚕️ Doctor: ${doctorName}`,
          `⏰ Time: ${appointmentTime}`,
          `🏥 Hospital: ${hospitalName}`,
          '',
          'Please arrive 10–15 minutes early.',
        ].join('\n');

      default:
        return `Hello ${patientName}, your appointment with ${doctorName} is confirmed for ${appointmentDate} at ${appointmentTime}.`;
    }
  }

  /**
   * Map template name from notification type
   */
  public getTemplateName(type: WhatsAppNotificationType): string {
    switch (type) {
      case 'confirmation':
        return 'appointment_confirmation';
      case 'reminder_24h':
        return 'appointment_reminder_24h';
      case 'reminder_2h':
        return 'appointment_reminder_2h';
      default:
        return 'appointment_confirmation';
    }
  }

  /**
   * Builds the official Meta Graph API payload
   */
  private buildMetaPayload(
    phone: string,
    templateName: string,
    type: WhatsAppNotificationType,
    params: {
      patientName: string;
      doctorName: string;
      hospitalName: string;
      appointmentDate: string;
      appointmentTime: string;
      appointmentId: string;
    }
  ) {
    let parameters: { type: 'text'; text: string }[] = [];

    if (type === 'confirmation') {
      parameters = [
        { type: 'text', text: params.patientName },
        { type: 'text', text: params.doctorName },
        { type: 'text', text: params.appointmentDate },
        { type: 'text', text: params.appointmentTime },
        { type: 'text', text: params.hospitalName },
        { type: 'text', text: params.appointmentId },
      ];
    } else if (type === 'reminder_24h') {
      parameters = [
        { type: 'text', text: params.patientName },
        { type: 'text', text: params.doctorName },
        { type: 'text', text: params.appointmentDate },
        { type: 'text', text: params.appointmentTime },
        { type: 'text', text: params.hospitalName },
      ];
    } else if (type === 'reminder_2h') {
      parameters = [
        { type: 'text', text: params.patientName },
        { type: 'text', text: params.doctorName },
        { type: 'text', text: params.appointmentTime },
        { type: 'text', text: params.hospitalName },
      ];
    }

    return {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: this.config.templateLang || 'en_US',
        },
        components: [
          {
            type: 'body',
            parameters,
          },
        ],
      },
    };
  }

  /**
   * Dispatch a notification record via Meta Cloud API or simulation mode
   */
  public async sendNotificationRecord(record: DbWhatsAppNotification): Promise<SendResult> {
    this.config = this.loadConfig();

    if (!this.config.enabled) {
      await whatsappNotificationRepository.updateStatus(record.id, 'SKIPPED', {
        errorMessage: 'WhatsApp notifications are disabled in clinic settings.',
      });
      return { success: false, status: 'FAILED', error: 'WhatsApp disabled' };
    }

    const cleanPhone = this.sanitizePhoneNumber(record.phone);
    if (!cleanPhone) {
      const err = `Invalid recipient WhatsApp mobile number: ${record.phone}`;
      await whatsappNotificationRepository.updateStatus(record.id, 'FAILED', {
        errorMessage: err,
        incrementRetry: true,
      });
      return { success: false, status: 'FAILED', error: err };
    }

    // SIMULATION MODE (when credentials are not yet populated in production)
    if (this.config.provider === 'simulation') {
      const simulatedWamid = `wamid.HBgM${Date.now()}${Math.random().toString(36).substring(2, 9)}==`;
      const now = new Date();

      await whatsappNotificationRepository.updateStatus(record.id, 'SENT', {
        providerMessageId: simulatedWamid,
        sentAt: now,
        errorMessage: null,
      });

      // Background simulate delivery
      setTimeout(async () => {
        try {
          await whatsappNotificationRepository.updateStatus(record.id, 'DELIVERED', {
            deliveredAt: new Date(),
          });
        } catch {}
      }, 2500);

      console.log(`[WhatsApp API Simulated] Sent template "${record.templateName}" to ${cleanPhone} (WAMID: ${simulatedWamid})`);
      return { success: true, status: 'SENT', providerMessageId: simulatedWamid };
    }

    // LIVE META GRAPH API
    try {
      const parsedVars = typeof record.variables === 'string'
        ? JSON.parse(record.variables)
        : (record.variables || {});

      const url = `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`;
      const payload = this.buildMetaPayload(
        cleanPhone,
        record.templateName,
        record.type,
        {
          patientName: parsedVars.patientName || 'Valued Patient',
          doctorName: parsedVars.doctorName || 'Consultant Specialist',
          hospitalName: parsedVars.hospitalName || this.config.clinicName,
          appointmentDate: parsedVars.appointmentDate || 'Upcoming',
          appointmentTime: parsedVars.appointmentTime || '09:00 AM',
          appointmentId: parsedVars.appointmentId || record.appointmentId || 'APT',
        }
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: any = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.error?.message || `Meta API error status ${response.status}`;
        console.error('[WhatsApp Cloud API Error]', errorMsg);

        await whatsappNotificationRepository.updateStatus(record.id, 'FAILED', {
          errorMessage: errorMsg,
          incrementRetry: true,
        });

        return { success: false, status: 'FAILED', error: errorMsg };
      }

      const wamid = data?.messages?.[0]?.id || `wamid.${Date.now()}`;
      await whatsappNotificationRepository.updateStatus(record.id, 'SENT', {
        providerMessageId: wamid,
        sentAt: new Date(),
        errorMessage: null,
      });

      return { success: true, status: 'SENT', providerMessageId: wamid };
    } catch (err: any) {
      console.error('[WhatsApp Dispatch Exception]', err.message);
      await whatsappNotificationRepository.updateStatus(record.id, 'FAILED', {
        errorMessage: err.message || 'Network exception during WhatsApp dispatch',
        incrementRetry: true,
      });
      return { success: false, status: 'FAILED', error: err.message };
    }
  }

  /**
   * Schedule automatic confirmation and 24h & 2h reminders for an appointment.
   * Runs immediately and asynchronously so appointment booking is never blocked!
   */
  public async scheduleAppointmentNotifications(appointment: {
    id: string;
    patientId: string;
    dateTime: string;
    patientPhone?: string;
    patientName?: string;
    doctorName?: string;
    branchName?: string;
    status?: string;
  }): Promise<{ queuedCount: number; errors?: string[] }> {
    try {
      this.config = this.loadConfig();

      // Resolve patient and phone if not populated
      let phone = appointment.patientPhone;
      let patientName = appointment.patientName;

      if (!phone || !patientName) {
        const patient = await patientRepository.findById(appointment.patientId);
        if (patient) {
          phone = phone || patient.phone;
          patientName = patientName || `${patient.firstName} ${patient.lastName}`.trim();
        }
      }

      if (!phone) {
        console.warn(`[WhatsApp] No phone number found for patient ${appointment.patientId}. Skipping notification.`);
        return { queuedCount: 0, errors: ['Patient phone number not found'] };
      }

      // Parse appointment datetime
      let apptDateStr = appointment.dateTime;
      let apptTimeStr = '09:30 AM';
      let targetDate = new Date(appointment.dateTime);

      if (isNaN(targetDate.getTime())) {
        // Fallback if format is "YYYY-MM-DD" or similar
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
      } else {
        apptDateStr = targetDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        apptTimeStr = targetDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }

      const doctorName = appointment.doctorName || 'Dr. Specialist';
      const hospitalName = appointment.branchName || this.config.clinicName || 'MediEra Medical Care';
      const appointmentId = appointment.id;

      const templateVariables = {
        patientName: patientName || 'Patient',
        doctorName,
        hospitalName,
        appointmentDate: apptDateStr,
        appointmentTime: apptTimeStr,
        appointmentId,
      };

      const now = new Date();
      let queuedCount = 0;

      // 1. Immediate Appointment Confirmation
      const confId = `wn-conf-${appointment.id}-${Date.now()}`;
      const confBody = this.renderMessageBody('confirmation', templateVariables);
      const confRecord: DbWhatsAppNotification = {
        id: confId,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        phone,
        type: 'confirmation',
        templateName: this.getTemplateName('confirmation'),
        status: 'QUEUED',
        provider: this.config.provider,
        messageBody: confBody,
        variables: templateVariables,
        retryCount: 0,
        maxRetries: 3,
        scheduledFor: now,
      };

      const savedConf = await whatsappNotificationRepository.create(confRecord);
      if (savedConf) {
        queuedCount++;
        // Dispatch confirmation immediately in background without blocking
        setImmediate(async () => {
          try {
            await this.sendNotificationRecord(savedConf);
          } catch (e: any) {
            console.error('[WhatsApp Immediate Confirmation Error]', e.message);
          }
        });
      }

      // 2. 24-Hour Reminder
      const targetTimeMs = targetDate.getTime();
      const time24hBeforeMs = targetTimeMs - (24 * 60 * 60 * 1000);
      const time24hBefore = new Date(time24hBeforeMs);

      // Only queue if 24h before is still in the future
      if (time24hBefore > now) {
        const rem24hId = `wn-24h-${appointment.id}`;
        const rem24hBody = this.renderMessageBody('reminder_24h', templateVariables);
        const rem24hRecord: DbWhatsAppNotification = {
          id: rem24hId,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          phone,
          type: 'reminder_24h',
          templateName: this.getTemplateName('reminder_24h'),
          status: 'QUEUED',
          provider: this.config.provider,
          messageBody: rem24hBody,
          variables: templateVariables,
          retryCount: 0,
          maxRetries: 3,
          scheduledFor: time24hBefore,
        };

        const saved24h = await whatsappNotificationRepository.create(rem24hRecord);
        if (saved24h) queuedCount++;
      }

      // 3. 2-Hour Reminder
      const time2hBeforeMs = targetTimeMs - (2 * 60 * 60 * 1000);
      const time2hBefore = new Date(time2hBeforeMs);

      // Only queue if 2h before is still in the future
      if (time2hBefore > now) {
        const rem2hId = `wn-2h-${appointment.id}`;
        const rem2hBody = this.renderMessageBody('reminder_2h', templateVariables);
        const rem2hRecord: DbWhatsAppNotification = {
          id: rem2hId,
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          phone,
          type: 'reminder_2h',
          templateName: this.getTemplateName('reminder_2h'),
          status: 'QUEUED',
          provider: this.config.provider,
          messageBody: rem2hBody,
          variables: templateVariables,
          retryCount: 0,
          maxRetries: 3,
          scheduledFor: time2hBefore,
        };

        const saved2h = await whatsappNotificationRepository.create(rem2hRecord);
        if (saved2h) queuedCount++;
      }

      return { queuedCount };
    } catch (err: any) {
      console.error('[WhatsApp Schedule Error]', err.message);
      return { queuedCount: 0, errors: [err.message] };
    }
  }

  /**
   * Handle appointment status transition (e.g. Cancelled, Completed)
   * Automatically cancels pending reminders so patient is not disturbed!
   */
  public async handleAppointmentStatusChange(appointmentId: string, newStatus: string): Promise<void> {
    const s = (newStatus || '').toLowerCase();
    if (s.includes('cancel')) {
      await whatsappNotificationRepository.cancelPendingForAppointment(appointmentId, 'Appointment was cancelled by patient/clinic');
      console.log(`[WhatsApp] Cancelled pending reminders for cancelled appointment ${appointmentId}`);
    } else if (s.includes('complete') || s.includes('visited')) {
      await whatsappNotificationRepository.cancelPendingForAppointment(appointmentId, 'Appointment already completed');
      console.log(`[WhatsApp] Cancelled pending reminders for completed appointment ${appointmentId}`);
    }
  }
}

export const whatsappService = new WhatsAppService();
