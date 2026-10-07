export * from './database.config.ts';

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-clinic-crm-key-2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-jwt-clinic-crm-key-2026',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
  },
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  app: {
    name: 'MediEra',
    url: process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  security: {
    corsOrigin: process.env.FRONTEND_URL || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-clinic-crm-key-2026',
    jwtExpiresIn: '24h',
  },
  passwordReset: {
    tokenExpiresInHours: 24,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM_EMAIL || 'noreply@mediera.local',
  },
  email: {
    enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM_EMAIL || 'noreply@mediera.local',
    fromName: process.env.SMTP_FROM_NAME || 'MediEra Healthcare',
  },
};

export default config;
