import { pool } from './client';

// Runs at startup. Uses IF NOT EXISTS so it's safe to call on every deploy.
export async function runMigrations(): Promise<void> {
  console.log('[db] running migrations...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID        NOT NULL,
      items       JSONB       NOT NULL DEFAULT '[]',
      status      TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'confirmed', 'cancelled')),
      total       NUMERIC(10,2) NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  console.log('[db] migrations complete');
}
