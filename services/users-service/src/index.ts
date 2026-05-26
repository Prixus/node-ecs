import { execSync } from 'child_process';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { UserRepository } from './repositories/userRepository';
import { UserService } from './services/userService';
import { createApp } from './app';

async function main(): Promise<void> {
  // 1. Set DATABASE_URL before Prisma is initialised.
  //    Constructed from individual env vars so ECS can inject DB_PASSWORD
  //    separately from Secrets Manager without it appearing in the URL at rest.
  process.env.DATABASE_URL = config.databaseUrl;

  // 2. Apply any pending migrations before accepting traffic.
  //    `migrate deploy` is idempotent — safe to run on every startup.
  console.log('[db] running migrations...');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'), // service root where prisma/ lives
  });

  // 3. Wire up the dependency chain
  const prisma = new PrismaClient();
  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const app = createApp(userService);

  // 4. Start HTTP server
  const server = app.listen(config.port, () => {
    console.log(`[${config.serviceName}] listening on port ${config.port} (${config.nodeEnv})`);
  });

  // 5. Graceful shutdown (production only — avoids breaking ts-node-dev restarts)
  if (config.nodeEnv === 'production') {
    const shutdown = (signal: string) => {
      console.log(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Server and DB connection closed');
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
