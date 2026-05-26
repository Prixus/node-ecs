import { PrismaClient } from '@prisma/client';
import { User } from '../models/user';

// Interface the service depends on — keeps the service decoupled from Prisma.
// To swap the ORM: write a new class implementing this interface and inject it.
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  save(data: { name: string; email: string }): Promise<User>;
  delete(id: string): Promise<boolean>;
}

function toUser(row: { id: string; name: string; email: string; createdAt: Date }): User {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(toUser);
  }

  async findById(id: string): Promise<User | undefined> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toUser(row) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? toUser(row) : undefined;
  }

  async save(data: { name: string; email: string }): Promise<User> {
    const row = await this.prisma.user.create({ data });
    return toUser(row);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      // Prisma throws P2025 when the record doesn't exist
      return false;
    }
  }
}
