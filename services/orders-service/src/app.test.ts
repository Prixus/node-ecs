import request from 'supertest';
import { createApp } from './app';
import { OrderService } from './services/orderService';
import { IOrderRepository } from './repositories/orderRepository';
import { Order } from './models/order';

const sampleItem = { productId: 'p1', quantity: 1, unitPrice: 50 };

const baseOrder: Order = {
  id: 'uuid-1',
  userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  items: [sampleItem],
  status: 'pending',
  total: 50,
  createdAt: new Date().toISOString(),
};

const mockRepo: jest.Mocked<IOrderRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(),
};

const app = createApp(new OrderService(mockRepo));

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
      .send({ userId: baseOrder.userId, items: [sampleItem] });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(50);
  });

  it('POST /api/v1/orders returns 400 with field errors when userId is missing', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ items: [sampleItem] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details.userId).toBeDefined();
  });

  it('POST /api/v1/orders returns 400 when items array is empty', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ userId: baseOrder.userId, items: [] });
    expect(res.status).toBe(400);
    expect(res.body.details.items).toBeDefined();
  });

  it('PATCH /api/v1/orders/:id/cancel cancels an order', async () => {
    mockRepo.findById.mockResolvedValue(baseOrder);
    mockRepo.updateStatus.mockResolvedValue({ ...baseOrder, status: 'cancelled' });

    const res = await request(app).patch('/api/v1/orders/uuid-1/cancel');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');
  });
});
