import { OrderService, OrderNotFoundError, InvalidOrderError } from './orderService';
import { IOrderRepository } from '../repositories/orderRepository';
import { Order } from '../models/order';

const sampleItem = { productId: 'p1', quantity: 2, unitPrice: 10 };

const baseOrder: Order = {
  id: 'uuid-1',
  userId: 'u1',
  items: [sampleItem],
  status: 'pending',
  total: 20,
  createdAt: new Date().toISOString(),
};

// Mock the repository interface — no ORM, no DB, no pg pool needed
const mockRepo: jest.Mocked<IOrderRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  save: jest.fn(),
  updateStatus: jest.fn(),
};

const service = new OrderService(mockRepo);

beforeEach(() => jest.clearAllMocks());

describe('OrderService', () => {
  it('creates an order and calculates total', async () => {
    mockRepo.save.mockResolvedValue(baseOrder);

    const order = await service.create({ userId: 'u1', items: [sampleItem] });
    expect(order.total).toBe(20);
    expect(order.status).toBe('pending');
    expect(mockRepo.save).toHaveBeenCalledWith({ userId: 'u1', items: [sampleItem], total: 20 });
  });

  it('throws InvalidOrderError when items are empty', async () => {
    await expect(service.create({ userId: 'u1', items: [] })).rejects.toThrow(InvalidOrderError);
  });

  it('throws OrderNotFoundError for unknown id', async () => {
    mockRepo.findById.mockResolvedValue(undefined);

    await expect(service.getById('nonexistent')).rejects.toThrow(OrderNotFoundError);
  });

  it('cancels an order', async () => {
    mockRepo.findById.mockResolvedValue(baseOrder);
    mockRepo.updateStatus.mockResolvedValue({ ...baseOrder, status: 'cancelled' });

    const cancelled = await service.cancel('uuid-1');
    expect(cancelled.status).toBe('cancelled');
  });

  it('throws when cancelling an already-cancelled order', async () => {
    mockRepo.findById.mockResolvedValue({ ...baseOrder, status: 'cancelled' });

    await expect(service.cancel('uuid-1')).rejects.toThrow(InvalidOrderError);
  });
});
