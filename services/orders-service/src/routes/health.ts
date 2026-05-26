import { Router, Request, Response } from 'express';
import { config } from '../config';
import { pool } from '../db/client';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: config.serviceName,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready', error: 'database unavailable' });
  }
});

export default router;
