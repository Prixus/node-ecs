import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  serviceName: process.env.SERVICE_NAME ?? 'orders-service',
  usersServiceUrl: process.env.USERS_SERVICE_URL ?? 'http://users-service:3000',
};
