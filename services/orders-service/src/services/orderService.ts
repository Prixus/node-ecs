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
  async getAll(): Promise<Order[]> {
    return orderRepository.findAll();
  },

  async getById(id: string): Promise<Order> {
    const order = await orderRepository.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    return order;
  },

  async getByUserId(userId: string): Promise<Order[]> {
    return orderRepository.findByUserId(userId);
  },

  async create(dto: CreateOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new InvalidOrderError('Order must have at least one item');
    }
    const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return orderRepository.save({ userId: dto.userId, items: dto.items, total });
  },

  async cancel(id: string): Promise<Order> {
    const order = await orderRepository.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    if (order.status === 'cancelled') {
      throw new InvalidOrderError('Order is already cancelled');
    }
    return orderRepository.updateStatus(id, 'cancelled');
  },
};
