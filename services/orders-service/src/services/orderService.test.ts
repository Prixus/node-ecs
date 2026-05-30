import { orderService, OrderNotFoundError, InvalidOrderError } from './orderService';
import { orderRepository } from '../repositories/orderRepository';

jest.mock('../repositories/orderRepository', () => ({
  orderRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    save: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

const mockRepo = orderRepository as jest.Mocked<typeof orderRepository>;

beforeEach(() => jest.clearAllMocks());

const sampleItem = { productId: 'p1', quantity: 2, unitPrice: 10 };

const makeOrder = (overrides = {}) => ({
  id: 'o1',
  userId: 'u1',
  items: [sampleItem],
  status: 'pending' as const,
  total: 20,
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('orderService', () => {
  it('creates an order and calculates total', async () => {
    const order = makeOrder();
    mockRepo.save.mockResolvedValue(order);

    const created = await orderService.create({ userId: 'u1', items: [sampleItem] });
    expect(created.id).toBeDefined();
    expect(created.total).toBe(20);
    expect(created.status).toBe('pending');
  });

  it('throws InvalidOrderError when items are empty', async () => {
    await expect(
      orderService.create({ userId: 'u1', items: [] }),
    ).rejects.toThrow(InvalidOrderError);
  });

  it('throws OrderNotFoundError for unknown id', async () => {
    mockRepo.findById.mockResolvedValue(undefined);

    await expect(orderService.getById('nonexistent')).rejects.toThrow(OrderNotFoundError);
  });

  it('cancels an order', async () => {
    const pending = makeOrder();
    const cancelled = makeOrder({ status: 'cancelled' as const });
    mockRepo.findById.mockResolvedValue(pending);
    mockRepo.updateStatus.mockResolvedValue(cancelled);

    const result = await orderService.cancel('o1');
    expect(result.status).toBe('cancelled');
  });

  it('throws when cancelling an already-cancelled order', async () => {
    mockRepo.findById.mockResolvedValue(makeOrder({ status: 'cancelled' as const }));

    await expect(orderService.cancel('o1')).rejects.toThrow(InvalidOrderError);
  });

  it('throws OrderNotFoundError when update returns undefined (race condition)', async () => {
    mockRepo.findById.mockResolvedValue(makeOrder());
    mockRepo.updateStatus.mockResolvedValue(undefined);

    await expect(orderService.cancel('o1')).rejects.toThrow(OrderNotFoundError);
  });
});
