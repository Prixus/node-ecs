import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';
const sslMode = nodeEnv === 'production' ? '?sslmode=no-verify' : '';

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv,
  serviceName: process.env.SERVICE_NAME ?? 'users-service',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  // Constructed from individual env vars so ECS can inject DB_PASSWORD
  // separately via Secrets Manager without exposing it in the task definition.
  databaseUrl:
    process.env.DATABASE_URL ??
    `postgresql://${process.env.DB_USER ?? 'dbadmin'}:${encodeURIComponent(
      process.env.DB_PASSWORD ?? 'localpassword',
    )}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${
      process.env.DB_NAME ?? 'platform'
    }${sslMode}`,
};
