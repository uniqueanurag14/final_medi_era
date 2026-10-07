import { CommunicationChannel, CommunicationLog, PatientCommunicationPreferences } from '../types';
import { dbService } from './mockDatabase';

export interface ProviderSendResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<ProviderSendResult>;
  validateConnection(): Promise<boolean>;
}

export interface SmsProvider {
  send(phone: string, message: string): Promise<ProviderSendResult>;
}

export interface WhatsAppProvider {
  sendTemplate(phone: string, templateName: string, variables: Record<string, string>): Promise<ProviderSendResult>;
  sendMessage(phone: string, message: string): Promise<ProviderSendResult>;
}

export interface PushProvider {
  send(targetId: string, title: string, body: string, deepLink?: string): Promise<ProviderSendResult>;
}

// Development / Sandbox Mock Providers
export class MockEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<ProviderSendResult> {
    // Basic email format check
    if (!to || !to.includes('@')) {
      return { success: false, error: 'Invalid recipient email address' };
    }
    const msgId = `msg-eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const delivered = new Date(now.getTime() + 1500).toISOString();
    const read = new Date(now.getTime() + 45000).toISOString();
    return {
      success: true,
      providerMessageId: msgId,
      deliveredAt: delivered,
      readAt: read,
    };
  }

  async validateConnection(): Promise<boolean> {
    return true;
  }
}

export class MockSmsProvider implements SmsProvider {
  async send(phone: string, message: string): Promise<ProviderSendResult> {
    if (!phone || phone.length < 8) {
      return { success: false, error: 'Invalid phone number format' };
    }
    const msgId = `msg-sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const delivered = new Date(now.getTime() + 2000).toISOString();
    return {
      success: true,
      providerMessageId: msgId,
      deliveredAt: delivered,
      readAt: new Date(now.getTime() + 12000).toISOString(),
    };
  }
}

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendTemplate(phone: string, templateName: string, variables: Record<string, string>): Promise<ProviderSendResult> {
    if (!phone || phone.length < 8) {
      return { success: false, error: 'Invalid WhatsApp recipient phone' };
    }
    const msgId = `msg-wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    return {
      success: true,
      providerMessageId: msgId,
      deliveredAt: new Date(now.getTime() + 1000).toISOString(),
      readAt: new Date(now.getTime() + 8000).toISOString(),
    };
  }

  async sendMessage(phone: string, message: string): Promise<ProviderSendResult> {
    return this.sendTemplate(phone, 'custom_text', {});
  }
}

export class MockPushProvider implements PushProvider {
  async send(targetId: string, title: string, body: string, deepLink?: string): Promise<ProviderSendResult> {
    const msgId = `msg-push-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    return {
      success: true,
      providerMessageId: msgId,
      deliveredAt: new Date().toISOString(),
      readAt: new Date(Date.now() + 5000).toISOString(),
    };
  }
}

// Template Variable Interpolation
export class TemplateRenderer {
  public static render(template: string, data: Record<string, string | number | undefined>): string {
    if (!template) return '';
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
      const val = data[key];
      return val !== undefined && val !== null ? String(val) : match;
    });
  }

  public static extractVariables(template: string): string[] {
    const matches = template.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
    if (!matches) return [];
    const vars = new Set<string>();
    matches.forEach((m) => {
      const clean = m.replace(/\{\{\s*|\s*\}\}/g, '');
      vars.add(clean);
    });
    return Array.from(vars);
  }
}

// Central Communication Service
export class CommunicationService {
  private static emailProvider: EmailProvider = new MockEmailProvider();
  private static smsProvider: SmsProvider = new MockSmsProvider();
  private static whatsAppProvider: WhatsAppProvider = new MockWhatsAppProvider();
  private static pushProvider: PushProvider = new MockPushProvider();

  // Rate Limiting Cache: recipient -> timestamp[]
  private static sendTimestamps: Map<string, number[]> = new Map();
  private static MAX_MESSAGES_PER_MINUTE = 10;

  private static checkRateLimit(recipient: string): boolean {
    const now = Date.now();
    const timestamps = this.sendTimestamps.get(recipient) || [];
    const recent = timestamps.filter((t) => now - t < 60000);
    if (recent.length >= this.MAX_MESSAGES_PER_MINUTE) {
      return false; // Rate limited
    }
    recent.push(now);
    this.sendTimestamps.set(recipient, recent);
    return true;
  }

  public static async dispatchMessage(options: {
    patientId?: string;
    patientName?: string;
    leadId?: string;
    leadName?: string;
    recipient: string;
    channel: CommunicationChannel;
    templateName: string;
    eventTrigger?: string;
    subject?: string;
    content: string;
    isPromotional?: boolean;
  }): Promise<CommunicationLog> {
    const nowIso = new Date().toISOString();

    // Check Consent & Opt-Out if promotional and patientId exists
    if (options.patientId && options.isPromotional) {
      const prefs = dbService.getPatientPreferences(options.patientId);
      if (prefs && (!prefs.promotionalAllowed || !prefs.marketingAllowed)) {
        const suppressedLog: CommunicationLog = {
          id: `com-log-${Date.now()}`,
          patientId: options.patientId,
          patientName: options.patientName,
          recipient: options.recipient,
          channel: options.channel,
          templateName: options.templateName,
          eventTrigger: options.eventTrigger,
          subject: options.subject,
          content: options.content,
          status: 'Cancelled',
          failureReason: 'Patient has opted out of promotional communications.',
          sentAt: nowIso,
        };
        dbService.addCommunicationLog(suppressedLog);
        return suppressedLog;
      }
    }

    // Rate limit safety
    if (!this.checkRateLimit(options.recipient)) {
      const rateLimitedLog: CommunicationLog = {
        id: `com-log-${Date.now()}`,
        patientId: options.patientId,
        patientName: options.patientName,
        recipient: options.recipient,
        channel: options.channel,
        templateName: options.templateName,
        eventTrigger: options.eventTrigger,
        subject: options.subject,
        content: options.content,
        status: 'Failed',
        failureReason: 'Rate limit exceeded: maximum messages per minute reached.',
        sentAt: nowIso,
      };
      dbService.addCommunicationLog(rateLimitedLog);
      return rateLimitedLog;
    }

    let result: ProviderSendResult = { success: false, error: 'Unknown channel' };

    try {
      if (options.channel === 'Email') {
        result = await this.emailProvider.send(options.recipient, options.subject || 'Apex Clinic Notification', options.content);
      } else if (options.channel === 'SMS') {
        result = await this.smsProvider.send(options.recipient, options.content);
      } else if (options.channel === 'WhatsApp') {
        result = await this.whatsAppProvider.sendMessage(options.recipient, options.content);
      } else if (options.channel === 'Push Notification') {
        result = await this.pushProvider.send(options.recipient, options.subject || 'Clinic Update', options.content);
      }
    } catch (err: any) {
      result = { success: false, error: err?.message || 'Provider execution failure' };
    }

    const log: CommunicationLog = {
      id: `com-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientId: options.patientId,
      patientName: options.patientName,
      leadId: options.leadId,
      leadName: options.leadName,
      recipient: options.recipient,
      channel: options.channel,
      templateName: options.templateName,
      eventTrigger: options.eventTrigger,
      subject: options.subject,
      content: options.content,
      status: result.success ? (result.readAt ? 'Read' : result.deliveredAt ? 'Delivered' : 'Sent') : 'Failed',
      providerMessageId: result.providerMessageId,
      failureReason: result.error,
      sentAt: nowIso,
      deliveredAt: result.deliveredAt,
      readAt: result.readAt,
    };

    dbService.addCommunicationLog(log);
    return log;
  }

  public static async dispatchDirectMessage(params: {
    patientId?: string;
    recipientName?: string;
    recipientContact: string;
    channel: CommunicationChannel;
    content: string;
    subject?: string;
    templateName?: string;
  }): Promise<CommunicationLog> {
    return this.dispatchMessage({
      patientId: params.patientId,
      patientName: params.recipientName,
      recipient: params.recipientContact,
      channel: params.channel,
      templateName: params.templateName || 'Direct Outreach',
      subject: params.subject,
      content: params.content,
    });
  }

  public static async send(options: {
    to?: string;
    recipient?: string;
    channel?: CommunicationChannel | string;
    subject?: string;
    message?: string;
    content?: string;
    patientId?: string;
    patientName?: string;
    leadId?: string;
    leadName?: string;
    templateId?: string;
    templateSubject?: string;
    templateBody?: string;
    templateName?: string;
    variables?: Record<string, any>;
  }): Promise<CommunicationLog & { renderedBody?: string }> {
    const rawChannel = options.channel || 'WhatsApp';
    const channel: CommunicationChannel =
      rawChannel === 'whatsapp' ? 'WhatsApp' :
      rawChannel === 'sms' ? 'SMS' :
      rawChannel === 'email' ? 'Email' :
      (rawChannel as CommunicationChannel);

    let finalContent = options.message || options.content || options.templateBody || '';
    if (options.variables) {
      Object.entries(options.variables).forEach(([key, val]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        finalContent = finalContent.replace(regex, String(val ?? ''));
      });
    }

    const log = await this.dispatchMessage({
      patientId: options.patientId,
      patientName: options.patientName,
      leadId: options.leadId,
      leadName: options.leadName,
      recipient: options.to || options.recipient || '',
      channel,
      templateName: options.templateName || (options.templateId ? `Template-${options.templateId}` : 'Direct Message'),
      content: finalContent,
      subject: options.templateSubject || options.subject,
    });

    (log as any).renderedBody = finalContent;
    return log as CommunicationLog & { renderedBody?: string };
  }

  // --- Two-way Simulator Engine for Staff Testing ---
  public static async simulateIncomingReply(params: {
    patientPhone: string;
    patientName: string;
    channel: CommunicationChannel;
    replyText: string;
  }): Promise<{ intent: string; responseMessage: string; eventTriggered: string }> {
    const text = params.replyText.trim().toUpperCase();
    let intent = 'UNKNOWN';
    let responseMessage = 'Thank you for reaching out to Apex Clinic. A care coordinator will connect with you shortly.';
    let eventTriggered = 'communication.reply_received';

    if (text === 'CONFIRM' || text === '1' || text === 'YES') {
      intent = 'CONFIRM_APPOINTMENT';
      responseMessage = `Thank you, ${params.patientName}. Your appointment has been officially confirmed. Please arrive 10 minutes prior to your slot.`;
      eventTriggered = 'appointment.confirmed_by_patient';
      
      // Auto-update any pending appointment for this patient
      const appointments = dbService.getAppointments();
      const pendingApt = appointments.find(a => (a.patientPhone === params.patientPhone || a.patientName.includes(params.patientName)) && a.status === 'Pending');
      if (pendingApt) {
        dbService.updateAppointmentStatus(pendingApt.id, 'Confirmed');
      }
    } else if (text === 'CANCEL' || text === '2' || text === 'NO') {
      intent = 'CANCEL_APPOINTMENT';
      responseMessage = `We have received your cancellation request, ${params.patientName}. Our desk coordinator will reach out to reschedule at your convenience.`;
      eventTriggered = 'appointment.cancelled_by_patient';

      const appointments = dbService.getAppointments();
      const confirmedApt = appointments.find(a => (a.patientPhone === params.patientPhone || a.patientName.includes(params.patientName)) && a.status !== 'Cancelled');
      if (confirmedApt) {
        dbService.updateAppointmentStatus(confirmedApt.id, 'Cancelled');
      }
    } else if (text === 'RESCHEDULE' || text === '3') {
      intent = 'RESCHEDULE_REQUEST';
      responseMessage = `We understand you wish to reschedule. Please visit our online booking portal or reply with your preferred day and time.`;
      eventTriggered = 'appointment.reschedule_requested';
    }

    // Log the incoming message
    const incomingLog: CommunicationLog = {
      id: `com-in-${Date.now()}`,
      patientName: params.patientName,
      recipient: params.patientPhone,
      channel: params.channel,
      templateName: 'Incoming Simulated Reply',
      eventTrigger: eventTriggered,
      subject: `Inbound: ${intent}`,
      content: params.replyText,
      status: 'Read',
      sentAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      readAt: new Date().toISOString(),
    };
    dbService.addCommunicationLog(incomingLog);

    // Dispatch automated acknowledgement
    await this.dispatchMessage({
      patientName: params.patientName,
      recipient: params.patientPhone,
      channel: params.channel,
      templateName: 'Automated Bot Reply',
      eventTrigger: eventTriggered,
      content: responseMessage,
    });

    return { intent, responseMessage, eventTriggered };
  }
}

export const communicationService = CommunicationService;
