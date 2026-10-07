/**
 * WhatsApp Controller
 * 
 * REST API Endpoints and Meta Cloud API Webhook Handlers for:
 * - Notification history & audit logs
 * - Delivery status metrics (sent, delivered, read, failed, queued)
 * - Manual trigger & retry
 * - Meta Graph API Webhook verification & incoming status events
 */

import { Request, Response } from 'express';
import { whatsappNotificationRepository } from '../repositories/whatsapp-notification.repository';
import { whatsappService } from '../services/whatsapp.service';
import { whatsappSchedulerService } from '../services/whatsapp-scheduler.service';

export class WhatsAppController {
  /**
   * GET /api/whatsapp/notifications
   * Paginated list of WhatsApp notifications
   */
  public async getNotifications(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const offset = (page - 1) * limit;

      const { data, total } = await whatsappNotificationRepository.findAll(limit, offset);

      return res.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/whatsapp/stats
   * Summary metrics on notification delivery
   */
  public async getStats(req: Request, res: Response) {
    try {
      const stats = await whatsappNotificationRepository.getDeliveryStats();
      return res.json({ success: true, data: stats });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/whatsapp/config
   * Safe public configuration of WhatsApp service (no secrets exposed)
   */
  public async getConfig(req: Request, res: Response) {
    try {
      const config = whatsappService.getConfig();
      return res.json({ success: true, data: config });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/whatsapp/scheduler/tick
   * Trigger an immediate run of the reminder scheduler
   */
  public async runSchedulerTick(req: Request, res: Response) {
    try {
      const result = await whatsappSchedulerService.tick();
      return res.json({
        success: true,
        message: 'WhatsApp scheduler cycle completed',
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/whatsapp/notifications/:id/retry
   * Manually retry a failed notification
   */
  public async retryNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = await whatsappNotificationRepository.findById(id);

      if (!record) {
        return res.status(404).json({ success: false, error: 'Notification record not found' });
      }

      const sendResult = await whatsappService.sendNotificationRecord(record);
      return res.json({ success: sendResult.success, data: sendResult });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/whatsapp/test-send
   * Test sending an appointment confirmation or reminder to a test number
   */
  public async sendTestNotification(req: Request, res: Response) {
    try {
      const { phone, type, patientName, doctorName, appointmentDate, appointmentTime, hospitalName } = req.body;

      if (!phone) {
        return res.status(400).json({ success: false, error: 'Recipient phone number is required' });
      }

      const notifType = type === 'reminder_24h' || type === 'reminder_2h' ? type : 'confirmation';
      const templateVariables = {
        patientName: patientName || 'Test Patient',
        doctorName: doctorName || 'Dr. Specialist',
        hospitalName: hospitalName || 'MediEra Medical Care',
        appointmentDate: appointmentDate || new Date().toLocaleDateString('en-IN'),
        appointmentTime: appointmentTime || '10:00 AM',
        appointmentId: `TEST-${Date.now().toString().slice(-4)}`,
      };

      const messageBody = whatsappService.renderMessageBody(notifType, templateVariables);
      const testRecord = {
        id: `wn-test-${Date.now()}`,
        phone,
        type: notifType,
        templateName: whatsappService.getTemplateName(notifType),
        status: 'QUEUED' as const,
        provider: 'meta',
        messageBody,
        variables: templateVariables,
        retryCount: 0,
        maxRetries: 3,
        scheduledFor: new Date(),
      };

      const saved = await whatsappNotificationRepository.create(testRecord);
      const result = await whatsappService.sendNotificationRecord(saved || testRecord);

      return res.json({
        success: result.success,
        message: result.success ? 'WhatsApp test notification sent successfully' : 'Failed to send WhatsApp test message',
        data: result,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/whatsapp/webhook
   * Meta Webhook verification handshake
   */
  public webhookVerify(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'nearera_wa_webhook_verify_2026';

    if (mode === 'subscribe' && token === expectedToken) {
      console.log('[WhatsApp Webhook Verified]');
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verification token mismatch' });
  }

  /**
   * POST /api/whatsapp/webhook
   * Meta Cloud API Webhook event listener (delivery, read receipts)
   */
  public async webhookReceive(req: Request, res: Response) {
    try {
      const body = req.body;

      if (body?.object === 'whatsapp_business_account') {
        const entries = body.entry || [];
        for (const entry of entries) {
          const changes = entry.changes || [];
          for (const change of changes) {
            const value = change.value;
            const statuses = value?.statuses || [];

            for (const st of statuses) {
              const wamid = st.id;
              const statusRaw = (st.status || '').toUpperCase();
              const timestamp = st.timestamp ? new Date(parseInt(st.timestamp, 10) * 1000) : new Date();

              if (statusRaw === 'DELIVERED' || statusRaw === 'READ' || statusRaw === 'SENT' || statusRaw === 'FAILED') {
                await whatsappNotificationRepository.updateStatusByProviderMessageId(
                  wamid,
                  statusRaw as any,
                  timestamp
                );
                console.log(`[WhatsApp Webhook Status] ${wamid} -> ${statusRaw}`);
              }
            }
          }
        }
      }

      return res.status(200).json({ status: 'EVENT_RECEIVED' });
    } catch (err: any) {
      console.error('[WhatsApp Webhook Error]', err.message);
      return res.status(200).json({ status: 'ERROR_RECORDED' }); // Always return 200 to Meta to prevent retry storm
    }
  }
}

export const whatsappController = new WhatsAppController();
