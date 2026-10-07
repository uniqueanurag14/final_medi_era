import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './BACKEND/src/routes/api.router';
import { dbAdapter } from './BACKEND/src/db/adapter';
import { MigrationEngine } from './DATABASE/engine/migration-engine';
import { getSmtpStatus, printSmtpStatus } from './BACKEND/src/services/smtp-status.service';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Body parser for JSON REST requests
  app.use(express.json());

  // Mount structured REST API routes FIRST
  app.use('/api', apiRouter);
  app.use('/api/v1', apiRouter);

  // Initialize and diagnose database
  const migrationEngine = new MigrationEngine();
  const dbHealth = await migrationEngine.checkHealth();
  migrationEngine.printDatabaseStatus(dbHealth);

  let migrationsStatusStr = 'UP TO DATE';
  if (dbHealth.connected) {
    try {
      const status = await migrationEngine.getStatus();
      if (status.pending > 0) {
        console.log(`[Migrations] Applying ${status.pending} pending migration(s)...`);
        await migrationEngine.migrate();
        await migrationEngine.bootstrapSuperAdmin();
        migrationsStatusStr = 'UP TO DATE';
      } else {
        migrationsStatusStr = 'UP TO DATE';
      }
    } catch (migErr: any) {
      migrationsStatusStr = `FAILED (${migErr.message})`;
      console.error('[Migrations Error]', migErr.message);
    }
  } else {
    migrationsStatusStr = 'NOT CONNECTED';
  }

  // Connect dbAdapter
  await dbAdapter.connect().catch((err) => {
    console.warn('[Database Notice]', err.message);
  });

  // Verify and diagnose SMTP
  const smtpStatus = await getSmtpStatus();
  printSmtpStatus(smtpStatus);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log('==================================================');
    console.log('SERVER STATUS');
    console.log('==================================================');
    console.log('Status      : RUNNING');
    console.log('Host        : 0.0.0.0');
    console.log(`Port        : ${PORT}`);
    console.log(`API         : http://localhost:${PORT}/api`);
    console.log(`Database    : ${dbHealth.connected ? 'CONNECTED' : 'DISCONNECTED'}`);
    console.log(`Migrations  : ${migrationsStatusStr}`);
    console.log(`SMTP        : ${smtpStatus.status}`);
    console.log('Application : READY');
    console.log('==================================================\n');
  });
}

startServer();
