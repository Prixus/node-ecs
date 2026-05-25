import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '3.0.0',
  });
});

router.get('/ready', (_req: Request, res: Response) => {
  res.json({ status: 'ready' });
});

export default router;
