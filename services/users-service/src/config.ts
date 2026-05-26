import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  serviceName: process.env.SERVICE_NAME ?? 'users-service',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME ?? 'users_db',
    user: process.env.DB_USER ?? 'dbadmin',
    password: process.env.DB_PASSWORD ?? 'localpassword',
  },
};
