import { pool } from '../db/client';
import { Order, OrderItem } from '../models/order';

// Maps a raw DB row to the Order interface
function toOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    items: row.items as OrderItem[],
    status: row.status as Order['status'],
    total: parseFloat(row.total as string),
    createdAt: (row.created_at as Date).toISOString(),
  };
}

export const orderRepository = {
  async findAll(): Promise<Order[]> {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows.map(toOrder);
  },

  async findById(id: string): Promise<Order | undefined> {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0] ? toOrder(result.rows[0]) : undefined;
  },

  async findByUserId(userId: string): Promise<Order[]> {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map(toOrder);
  },

  async save(data: { userId: string; items: OrderItem[]; total: number }): Promise<Order> {
    const result = await pool.query(
      `INSERT INTO orders (user_id, items, total)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.userId, JSON.stringify(data.items), data.total],
    );
    return toOrder(result.rows[0]);
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id],
    );
    return toOrder(result.rows[0]);
  },
};
