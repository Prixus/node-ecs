import { Router, Request, Response } from 'express';
import { config } from '../config';

export function createHealthRouter(): Router {
  const router = Router();

  // Liveness — is the process alive and HTTP server responding?
  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '3.0.0',
    });
  });

  // Readiness — is this task ready to receive traffic?
  // Intentionally does NOT check DB — database health is monitored
  // via CloudWatch alarms on RDS metrics (CPUUtilization, DatabaseConnections, etc.)
  router.get('/ready', (_req: Request, res: Response) => {
    res.json({ status: 'ready' });
  });

  return router;
}
