import { pool } from '../db/client';
import { User } from '../models/user';

// Maps a raw DB row to the User interface
function toUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export const userRepository = {
  async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows.map(toUser);
  },

  async findById(id: string): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? toUser(result.rows[0]) : undefined;
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? toUser(result.rows[0]) : undefined;
  },

  async save(data: { name: string; email: string }): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [data.name, data.email],
    );
    return toUser(result.rows[0]);
  },

  async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
