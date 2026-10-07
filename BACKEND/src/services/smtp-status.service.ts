/**
 * SMTP Status & Verification Service
 * Safely verifies Nodemailer connectivity without logging credentials.
 */

import nodemailer from 'nodemailer';

export interface SmtpStatus {
  provider: string;
  enabled: boolean;
  host: string;
  port: number;
  status: 'CONNECTED' | 'NOT CONFIGURED' | 'DISABLED' | 'FAILED';
  error?: string;
}

export async function getSmtpStatus(): Promise<SmtpStatus> {
  const enabledRaw = process.env.ENABLE_EMAIL_NOTIFICATIONS || process.env.NOTIFICATION_EMAIL_ENABLED;
  const enabled = enabledRaw !== undefined ? enabledRaw.toLowerCase() === 'true' : true;
  const host = (process.env.SMTP_HOST || '').trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASSWORD || '').trim();
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!enabled) {
    return {
      provider: 'Nodemailer',
      enabled: false,
      host: host || 'NOT CONFIGURED',
      port,
      status: 'DISABLED',
    };
  }

  if (!host) {
    return {
      provider: 'Nodemailer',
      enabled: true,
      host: 'NOT CONFIGURED',
      port,
      status: 'NOT CONFIGURED',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
      connectionTimeout: 3000,
      greetingTimeout: 3000,
      socketTimeout: 4000,
    });

    await transporter.verify();
    return {
      provider: 'Nodemailer',
      enabled: true,
      host,
      port,
      status: 'CONNECTED',
    };
  } catch (err: any) {
    const safeError = err.message ? err.message.replace(pass, '******') : 'Connection failed';
    return {
      provider: 'Nodemailer',
      enabled: true,
      host,
      port,
      status: 'FAILED',
      error: safeError,
    };
  }
}

export function printSmtpStatus(status: SmtpStatus): void {
  console.log('==================================================');
  console.log('SMTP');
  console.log('==================================================');
  console.log(`Provider : ${status.provider}`);
  console.log(`Enabled  : ${status.enabled ? 'YES' : 'NO'}`);
  console.log(`Host     : ${status.host}`);
  console.log(`Port     : ${status.port}`);
  console.log(`Status   : ${status.status}`);
  if (status.error && status.status === 'FAILED') {
    console.log(`Error    : ${status.error}`);
  }
  console.log('==================================================\n');
}
