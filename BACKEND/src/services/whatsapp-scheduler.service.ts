/**
 * WhatsApp Appointment Reminder Background Scheduler & Queue Worker
 * 
 * Periodically polls the database for due 24h & 2h reminders.
 * Idempotent execution: Ensures server restarts or multiple ticks never send duplicate messages.
 * Respects appointment status: Skips/cancels reminders for cancelled or completed appointments.
 */

import {
  whatsappNotificationRepository,
  DbWhatsAppNotification,
} from '../repositories/whatsapp-notification.repository';
import { whatsappService } from './whatsapp.service';

export class WhatsAppSchedulerService {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;
  private intervalMs: number = 60 * 1000; // Poll every 60 seconds

  /**
   * Start the periodic background scheduler
   */
  public start(intervalMs: number = 60 * 1000): void {
    if (this.timer) return;
    this.intervalMs = intervalMs;
    console.log(`[WhatsApp Scheduler] Started background job worker (Interval: ${this.intervalMs / 1000}s)`);

    // Initial check after short delay
    setTimeout(() => {
      this.tick();
    }, 5000);

    this.timer = setInterval(() => {
      this.tick();
    }, this.intervalMs);
  }

  /**
   * Stop the scheduler cleanly
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[WhatsApp Scheduler] Stopped background worker.');
    }
  }

  /**
   * Run a single polling cycle (can be called manually or by tests)
   */
  public async tick(): Promise<{ processedCount: number; sentCount: number; skippedCount: number; failedCount: number }> {
    if (this.isProcessing) {
      return { processedCount: 0, sentCount: 0, skippedCount: 0, failedCount: 0 };
    }

    this.isProcessing = true;
    let processedCount = 0;
    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    try {
      // Find due notifications (scheduled_for <= NOW() and status = 'QUEUED')
      const dueNotifications = await whatsappNotificationRepository.findPendingDue(50);

      for (const notif of dueNotifications) {
        processedCount++;

        // Verify appointment status
        const apptStatus = (notif.appointmentStatus || '').toLowerCase();
        if (apptStatus.includes('cancel')) {
          await whatsappNotificationRepository.updateStatus(notif.id, 'CANCELLED', {
            errorMessage: 'Appointment was cancelled prior to scheduled reminder delivery.',
          });
          skippedCount++;
          continue;
        }

        if (apptStatus.includes('complete') || apptStatus.includes('visited')) {
          await whatsappNotificationRepository.updateStatus(notif.id, 'SKIPPED', {
            errorMessage: 'Appointment was already completed.',
          });
          skippedCount++;
          continue;
        }

        // Send via WhatsApp service
        const result = await whatsappService.sendNotificationRecord(notif);
        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
        }
      }
    } catch (err: any) {
      console.error('[WhatsApp Scheduler Error]', err.message);
    } finally {
      this.isProcessing = false;
    }

    return { processedCount, sentCount, skippedCount, failedCount };
  }
}

export const whatsappSchedulerService = new WhatsAppSchedulerService();
