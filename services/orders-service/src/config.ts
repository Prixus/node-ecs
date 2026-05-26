import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  serviceName: process.env.SERVICE_NAME ?? 'orders-service',
  usersServiceUrl: process.env.USERS_SERVICE_URL ?? 'http://users-service:3000',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME ?? 'orders_db',
    user: process.env.DB_USER ?? 'dbadmin',
    password: process.env.DB_PASSWORD ?? 'localpassword',
  },
};
