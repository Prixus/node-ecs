import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { OrderService } from './services/orderService';
import { createHealthRouter } from './routes/health';
import { createOrdersRouter } from './routes/orders';

export function createApp(service: OrderService): Application {
  const app = express();

  app.use(helmet());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/', createHealthRouter());
  app.use('/api/v1/orders', createOrdersRouter(service));

  return app;
}
