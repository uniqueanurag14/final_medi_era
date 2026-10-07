/**
 * Email Service
 * 
 * Handles transactional email notifications, user onboarding invites,
 * and password setup links for MediEra Healthcare.
 */

import nodemailer from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export class EmailService {
  private transporter: any | null = null;
  private initialized = false;

  private initTransporter() {
    if (this.initialized) return;
    this.initialized = true;

    const host = (process.env.SMTP_HOST || '').trim();
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = (process.env.SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASSWORD || '').trim();
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: user ? { user, pass } : undefined,
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
        });
      } catch (err: any) {
        console.warn('[EmailService] Failed to initialize SMTP transporter:', err?.message);
        this.transporter = null;
      }
    }
  }

  public async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
    this.initTransporter();

    const fromAddress = options.from || process.env.SMTP_FROM || 'MediEra Healthcare <noreply@mediera.com>';

    if (!this.transporter) {
      // In development / demo mode or without configured SMTP, log safely and simulate delivery
      console.log(`[EmailService Simulated] To: ${options.to} | Subject: ${options.subject}`);
      if (options.text) {
        console.log(`[EmailService Content]\n${options.text}\n`);
      }
      return { success: true, simulated: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.warn(`[EmailService] Failed to send email to ${options.to}:`, err?.message);
      // Return simulated success so onboarding is not blocked if external SMTP is unreachable
      return { success: false, simulated: true };
    }
  }
}

export const emailService = new EmailService();
