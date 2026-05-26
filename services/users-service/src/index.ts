import { createApp } from './app';
import { config } from './config';
import { runMigrations } from './db/migrate';
import { pool } from './db/client';

async function main(): Promise<void> {
  await runMigrations();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[${config.serviceName}] listening on port ${config.port} (${config.nodeEnv})`);
  });

  if (config.nodeEnv === 'production') {
    const shutdown = (signal: string) => {
      console.log(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await pool.end();
        console.log('Server and DB pool closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

main().catch((err) => {
  console.error('[startup] failed to start:', err);
  process.exit(1);
});
