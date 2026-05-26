import request from 'supertest';
import { createApp } from './app';
import { orderRepository } from './repositories/orderRepository';

// Mock the repository so tests don't need a real DB connection
jest.mock('./repositories/orderRepository');
const mockRepo = jest.mocked(orderRepository);

const app = createApp();

const sampleItem = { productId: 'p1', quantity: 1, unitPrice: 50 };
const baseOrder = {
  id: 'uuid-1',
  userId: 'u1',
  items: [sampleItem],
  status: 'pending' as const,
  total: 50,
  createdAt: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

describe('Health routes', () => {
  it('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Orders routes', () => {
  it('GET /api/v1/orders returns array', async () => {
    mockRepo.findAll.mockResolvedValue([]);

    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/v1/orders creates an order', async () => {
    mockRepo.save.mockResolvedValue(baseOrder);

    const res = await request(app)
      .post('/api/v1/orders')
      .send({ userId: 'u1', items: [sampleItem] });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(50);
  });

  it('PATCH /api/v1/orders/:id/cancel cancels an order', async () => {
    mockRepo.findById.mockResolvedValue(baseOrder);
    mockRepo.updateStatus.mockResolvedValue({ ...baseOrder, status: 'cancelled' });

    const res = await request(app).patch('/api/v1/orders/uuid-1/cancel');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');
  });
});
