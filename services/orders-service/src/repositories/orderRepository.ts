import { Prisma, PrismaClient } from '../../generated/prisma-client';
import { prisma } from '../prisma';
import { Order, OrderItem, OrderStatus } from '../models/order';

const toOrder = (o: {
  id: string;
  userId: string;
  items: unknown;
  status: string;
  total: number;
  createdAt: Date;
}): Order => ({
  id: o.id,
  userId: o.userId,
  items: o.items as OrderItem[],
  status: o.status as Order['status'],
  total: o.total,
  createdAt: o.createdAt.toISOString(),
});

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | undefined>;
  findByUserId(userId: string): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | undefined>;
}

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(): Promise<Order[]> {
    const rows = await this.db.order.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toOrder);
  }

  async findById(id: string): Promise<Order | undefined> {
    const row = await this.db.order.findUnique({ where: { id } });
    return row ? toOrder(row) : undefined;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const rows = await this.db.order.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
    return rows.map(toOrder);
  }

  async save(order: Order): Promise<Order> {
    const row = await this.db.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        items: order.items as unknown as Prisma.InputJsonValue,
        status: order.status,
        total: order.total,
        createdAt: new Date(order.createdAt),
      },
    });
    return toOrder(row);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    try {
      const row = await this.db.order.update({
        where: { id },
        data: { status },
      });
      return toOrder(row);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return undefined;
      }
      throw err;
    }
  }
}

export const orderRepository: IOrderRepository = new PrismaOrderRepository(prisma);
