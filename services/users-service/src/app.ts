import express, { Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { UserService } from './services/userService';
import { createHealthRouter } from './routes/health';
import { createUsersRouter } from './routes/users';

export function createApp(service: UserService): Application {
  const app = express();

  app.use(helmet());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/', createHealthRouter());
  app.use('/api/v1/users', createUsersRouter(service));

  return app;
}
