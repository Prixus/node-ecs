import { createApp } from './app';
import { config } from './config';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[${config.serviceName}] listening on port ${config.port} (${config.nodeEnv})`);
});

if (config.nodeEnv === 'production') {
  process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => process.exit(0));
  });
}
