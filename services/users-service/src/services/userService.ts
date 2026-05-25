import { randomUUID } from 'crypto';
import { User, CreateUserDto } from '../models/user';
import { userRepository } from '../repositories/userRepository';

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User ${id} not found`);
    this.name = 'UserNotFoundError';
  }
}

export class EmailConflictError extends Error {
  constructor(email: string) {
    super(`Email ${email} is already in use`);
    this.name = 'EmailConflictError';
  }
}

export const userService = {
  getAll(): User[] {
    return userRepository.findAll();
  },

  getById(id: string): User {
    const user = userRepository.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  },

  create(dto: CreateUserDto): User {
    if (userRepository.findByEmail(dto.email)) {
      throw new EmailConflictError(dto.email);
    }
    const user: User = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      createdAt: new Date().toISOString(),
    };
    return userRepository.save(user);
  },

  delete(id: string): void {
    const deleted = userRepository.delete(id);
    if (!deleted) throw new UserNotFoundError(id);
  },
};
