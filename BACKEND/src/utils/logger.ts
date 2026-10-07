import { Request } from 'express';

const SENSITIVE_KEYS = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'token',
  'token_hash',
  'resetToken',
  'secret',
  'jwt_secret',
  'smtp_password',
  'db_password',
  'newPassword',
  'confirmPassword',
  'currentPassword',
]);

function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key) || key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      cleaned[key] = sanitize(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export const logger = {
  info(action: string, meta: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} [${action}]`, JSON.stringify(sanitize(meta)));
  },

  warn(action: string, meta: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} [${action}]`, JSON.stringify(sanitize(meta)));
  },

  error(action: string, error: any, meta: Record<string, any> = {}) {
    const timestamp = new Date().toISOString();
    const safeError = {
      message: error?.message || String(error),
      category: error?.name || 'GeneralError',
      code: error?.code,
    };
    console.error(`[ERROR] ${timestamp} [${action}]`, JSON.stringify({ error: safeError, ...sanitize(meta) }));
  },

  http(req: Request, statusCode: number, durationMs: number, action = 'HTTP_REQUEST') {
    const timestamp = new Date().toISOString();
    const userId = (req as any).user?.id || 'anonymous';
    const logData = {
      timestamp,
      method: req.method,
      endpoint: req.originalUrl || req.url,
      statusCode,
      durationMs,
      userId,
      ip: req.ip || req.socket.remoteAddress,
      action,
    };
    console.log(`[HTTP] ${req.method} ${req.originalUrl || req.url} ${statusCode} (${durationMs}ms) - User:${userId}`);
  },
};
