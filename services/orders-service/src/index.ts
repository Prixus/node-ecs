import { createApp } from './app';
import { config } from './config';
import { PrismaClient } from '../generated/prisma-client';
import { PrismaOrderRepository } from './repositories/orderRepository';
import { OrderService } from './services/orderService';

process.env.DATABASE_URL = config.databaseUrl;

const prisma = new PrismaClient();
const orderRepository = new PrismaOrderRepository(prisma);
const orderService = new OrderService(orderRepository);
const app = createApp(orderService);

const server = app.listen(config.port, () => {
  console.log(`[${config.serviceName}] listening on port ${config.port} (${config.nodeEnv})`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received — shutting down gracefully`);
  server.close(() => {
    prisma
      .$disconnect()
      .then(() => {
        console.log('Server closed');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Error disconnecting Prisma on shutdown:', err);
        process.exit(1);
      });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
