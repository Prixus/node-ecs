import { randomUUID } from 'crypto';
import { Order, CreateOrderDto } from '../models/order';
import { IOrderRepository, orderRepository } from '../repositories/orderRepository';

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

export class OrderService {
  constructor(private readonly repo: IOrderRepository) {}

  async getAll(): Promise<Order[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Order> {
    const order = await this.repo.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    return order;
  }

  async getByUserId(userId: string): Promise<Order[]> {
    return this.repo.findByUserId(userId);
  }

  async create(dto: CreateOrderDto): Promise<Order> {
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
    return this.repo.save(order);
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.repo.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    if (order.status === 'cancelled') {
      throw new InvalidOrderError('Order is already cancelled');
    }
    const updated = await this.repo.updateStatus(id, 'cancelled');
    if (!updated) throw new OrderNotFoundError(id);
    return updated;
  }
}

export const orderService = new OrderService(orderRepository);
