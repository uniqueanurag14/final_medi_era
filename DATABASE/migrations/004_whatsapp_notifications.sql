-- Migration: 004_whatsapp_notifications.sql
-- Description: Automated WhatsApp Appointment Confirmation and Reminder System (24h & 2h reminders, delivery tracking, idempotency)

CREATE TABLE IF NOT EXISTS whatsapp_notifications (
  id VARCHAR(64) PRIMARY KEY,
  appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id VARCHAR(64) REFERENCES patients(id) ON DELETE SET NULL,
  phone VARCHAR(32) NOT NULL,
  type VARCHAR(64) NOT NULL, -- 'confirmation', 'reminder_24h', 'reminder_2h'
  template_name VARCHAR(64) NOT NULL, -- 'appointment_confirmation', 'appointment_reminder_24h', 'appointment_reminder_2h'
  status VARCHAR(32) DEFAULT 'QUEUED' NOT NULL, -- 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED', 'SKIPPED'
  provider VARCHAR(32) DEFAULT 'meta' NOT NULL,
  provider_message_id VARCHAR(128),
  message_body TEXT NOT NULL,
  variables JSON,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  max_retries INTEGER DEFAULT 3 NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT uq_whatsapp_appt_type UNIQUE (appointment_id, type)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_notif_status ON whatsapp_notifications(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notif_scheduled ON whatsapp_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notif_provider_msg ON whatsapp_notifications(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notif_appt ON whatsapp_notifications(appointment_id);
