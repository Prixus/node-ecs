import { Order } from '../models/order';

const store = new Map<string, Order>();

export const orderRepository = {
  findAll(): Order[] {
    return Array.from(store.values());
  },

  findById(id: string): Order | undefined {
    return store.get(id);
  },

  findByUserId(userId: string): Order[] {
    return Array.from(store.values()).filter((o) => o.userId === userId);
  },

  save(order: Order): Order {
    store.set(order.id, order);
    return order;
  },

  update(order: Order): Order {
    store.set(order.id, order);
    return order;
  },
};
