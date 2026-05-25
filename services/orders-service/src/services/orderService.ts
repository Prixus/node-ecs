import { randomUUID } from 'crypto';
import { Order, CreateOrderDto } from '../models/order';
import { orderRepository } from '../repositories/orderRepository';

export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Order ${id} not found`);
    this.name = 'OrderNotFoundError';
  }
}

export class InvalidOrderError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'InvalidOrderError';
  }
}

export const orderService = {
  getAll(): Order[] {
    return orderRepository.findAll();
  },

  getById(id: string): Order {
    const order = orderRepository.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    return order;
  },

  getByUserId(userId: string): Order[] {
    return orderRepository.findByUserId(userId);
  },

  create(dto: CreateOrderDto): Order {
    if (!dto.items || dto.items.length === 0) {
      throw new InvalidOrderError('Order must have at least one item');
    }
    const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const order: Order = {
      id: randomUUID(),
      userId: dto.userId,
      items: dto.items,
      status: 'pending',
      total,
      createdAt: new Date().toISOString(),
    };
    return orderRepository.save(order);
  },

  cancel(id: string): Order {
    const order = orderRepository.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    if (order.status === 'cancelled') {
      throw new InvalidOrderError('Order is already cancelled');
    }
    return orderRepository.update({ ...order, status: 'cancelled' });
  },
};
