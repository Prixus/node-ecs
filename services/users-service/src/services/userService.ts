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
  async getAll(): Promise<User[]> {
    return userRepository.findAll();
  },

  async getById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  },

  async create(dto: CreateUserDto): Promise<User> {
    if (await userRepository.findByEmail(dto.email)) {
      throw new EmailConflictError(dto.email);
    }
    return userRepository.save({ name: dto.name, email: dto.email });
  },

  async delete(id: string): Promise<void> {
    const deleted = await userRepository.delete(id);
    if (!deleted) throw new UserNotFoundError(id);
  },
};
