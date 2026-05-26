import { PrismaClient, OrderStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Order, OrderItem } from '../models/order';

// Interface the service depends on — keeps the service decoupled from Prisma.
// To swap the ORM: write a new class implementing this interface and inject it.
export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | undefined>;
  findByUserId(userId: string): Promise<Order[]>;
  save(data: { userId: string; items: OrderItem[]; total: number }): Promise<Order>;
  updateStatus(id: string, status: Order['status']): Promise<Order>;
}

function toOrder(row: {
  id: string;
  userId: string;
  items: unknown;
  status: OrderStatus;
  total: Decimal;
  createdAt: Date;
}): Order {
  return {
    id: row.id,
    userId: row.userId,
    items: row.items as OrderItem[],
    status: row.status,
    total: row.total.toNumber(),
    createdAt: row.createdAt.toISOString(),
  };
}

export class OrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toOrder);
  }

  async findById(id: string): Promise<Order | undefined> {
    const row = await this.prisma.order.findUnique({ where: { id } });
    return row ? toOrder(row) : undefined;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toOrder);
  }

  async save(data: { userId: string; items: OrderItem[]; total: number }): Promise<Order> {
    const row = await this.prisma.order.create({
      data: {
        userId: data.userId,
        items: data.items,
        total: data.total,
      },
    });
    return toOrder(row);
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const row = await this.prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });
    return toOrder(row);
  }
}
