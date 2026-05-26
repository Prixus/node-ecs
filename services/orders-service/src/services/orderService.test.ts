import { orderService, OrderNotFoundError, InvalidOrderError } from './orderService';
import { orderRepository } from '../repositories/orderRepository';

// Mock the repository so tests don't need a real DB connection
jest.mock('../repositories/orderRepository');
const mockRepo = jest.mocked(orderRepository);

const sampleItem = { productId: 'p1', quantity: 2, unitPrice: 10 };
const baseOrder = {
  id: 'uuid-1',
  userId: 'u1',
  items: [sampleItem],
  status: 'pending' as const,
  total: 20,
  createdAt: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

describe('orderService', () => {
  it('creates an order and calculates total', async () => {
    mockRepo.save.mockResolvedValue(baseOrder);

    const order = await orderService.create({ userId: 'u1', items: [sampleItem] });
    expect(order.id).toBeDefined();
    expect(order.total).toBe(20);
    expect(order.status).toBe('pending');
    expect(mockRepo.save).toHaveBeenCalledWith({
      userId: 'u1',
      items: [sampleItem],
      total: 20,
    });
  });

  it('throws InvalidOrderError when items are empty', async () => {
    await expect(orderService.create({ userId: 'u1', items: [] })).rejects.toThrow(
      InvalidOrderError,
    );
  });

  it('throws OrderNotFoundError for unknown id', async () => {
    mockRepo.findById.mockResolvedValue(undefined);

    await expect(orderService.getById('nonexistent')).rejects.toThrow(OrderNotFoundError);
  });

  it('cancels an order', async () => {
    mockRepo.findById.mockResolvedValue(baseOrder);
    mockRepo.updateStatus.mockResolvedValue({ ...baseOrder, status: 'cancelled' });

    const cancelled = await orderService.cancel('uuid-1');
    expect(cancelled.status).toBe('cancelled');
  });

  it('throws when cancelling an already-cancelled order', async () => {
    mockRepo.findById.mockResolvedValue({ ...baseOrder, status: 'cancelled' });

    await expect(orderService.cancel('uuid-1')).rejects.toThrow(InvalidOrderError);
  });
});
