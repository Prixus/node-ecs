import { orderService, OrderNotFoundError, InvalidOrderError } from './orderService';

const sampleItem = { productId: 'p1', quantity: 2, unitPrice: 10 };

describe('orderService', () => {
  it('creates an order and calculates total', () => {
    const order = orderService.create({ userId: 'u1', items: [sampleItem] });
    expect(order.id).toBeDefined();
    expect(order.total).toBe(20);
    expect(order.status).toBe('pending');
  });

  it('throws InvalidOrderError when items are empty', () => {
    expect(() => orderService.create({ userId: 'u1', items: [] })).toThrow(InvalidOrderError);
  });

  it('throws OrderNotFoundError for unknown id', () => {
    expect(() => orderService.getById('nonexistent')).toThrow(OrderNotFoundError);
  });

  it('cancels an order', () => {
    const order = orderService.create({ userId: 'u2', items: [sampleItem] });
    const cancelled = orderService.cancel(order.id);
    expect(cancelled.status).toBe('cancelled');
  });

  it('throws when cancelling an already-cancelled order', () => {
    const order = orderService.create({ userId: 'u3', items: [sampleItem] });
    orderService.cancel(order.id);
    expect(() => orderService.cancel(order.id)).toThrow(InvalidOrderError);
  });
});
