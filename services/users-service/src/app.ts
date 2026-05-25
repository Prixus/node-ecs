import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRouter from './routes/health';
import usersRouter from './routes/users';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/', healthRouter);
  app.use('/api/v1/users', usersRouter);

  return app;
}
