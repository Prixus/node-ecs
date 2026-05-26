import { Pool } from 'pg';
import { config } from '../config';

// Connection pool — shared across the whole process lifetime.
// Max 10 connections; idle connections are released after 30s.
export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  // RDS enforces SSL; for local dev (postgres in Docker) we turn it off.
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('[db] unexpected pool error', err);
});
