import { Prisma } from '../../generated/prisma-client';
import { prisma } from '../prisma';
import { User } from '../models/user';

const toUser = (u: { id: string; name: string; email: string; createdAt: Date }): User => ({
  id: u.id,
  name: u.name,
  email: u.email,
  createdAt: u.createdAt.toISOString(),
});

export const userRepository = {
  async findAll(): Promise<User[]> {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toUser);
  },

  async findById(id: string): Promise<User | undefined> {
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? toUser(row) : undefined;
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const row = await prisma.user.findUnique({ where: { email } });
    return row ? toUser(row) : undefined;
  },

  async save(user: User): Promise<User> {
    const row = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: new Date(user.createdAt),
      },
    });
    return toUser(row);
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return false;
      }
      throw err;
    }
  },
};
