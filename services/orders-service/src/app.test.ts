import request from 'supertest';
import { createApp } from './app';

const app = createApp();

describe('Health routes', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Orders routes', () => {
  it('GET /api/v1/orders returns array', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/v1/orders creates an order', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ userId: 'u1', items: [{ productId: 'p1', quantity: 1, unitPrice: 50 }] });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(50);
  });

  it('PATCH /api/v1/orders/:id/cancel cancels an order', async () => {
    const created = await request(app)
      .post('/api/v1/orders')
      .send({ userId: 'u1', items: [{ productId: 'p1', quantity: 1, unitPrice: 10 }] });
    const res = await request(app).patch(`/api/v1/orders/${created.body.id}/cancel`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');
  });
});
