import { pool } from './client';

// Runs at startup. Uses IF NOT EXISTS so it's safe to call on every deploy.
export async function runMigrations(): Promise<void> {
  console.log('[db] running migrations...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      name        TEXT        NOT NULL,
      email       TEXT        NOT NULL UNIQUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  console.log('[db] migrations complete');
}
