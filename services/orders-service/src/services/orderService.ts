import { Order, CreateOrderDto } from '../models/order';
import { IOrderRepository } from '../repositories/orderRepository';

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
    const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return this.repo.save({ userId: dto.userId, items: dto.items, total });
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.repo.findById(id);
    if (!order) throw new OrderNotFoundError(id);
    if (order.status === 'cancelled') {
      throw new InvalidOrderError('Order is already cancelled');
    }
    return this.repo.updateStatus(id, 'cancelled');
  }
}
