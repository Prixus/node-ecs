import request from 'supertest';
import { createApp } from './app';

const app = createApp();

describe('Health routes', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /ready returns 200', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
  });
});

describe('Users routes', () => {
  it('GET /api/v1/users returns array', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/v1/users creates a user', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({ name: 'Alice', email: `alice+${Date.now()}@example.com` });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('POST /api/v1/users returns 400 when fields missing', async () => {
    const res = await request(app).post('/api/v1/users').send({ name: 'NoEmail' });
    expect(res.status).toBe(400);
  });
});
