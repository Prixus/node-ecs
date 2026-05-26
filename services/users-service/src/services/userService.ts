import { User, CreateUserDto } from '../models/user';
import { IUserRepository } from '../repositories/userRepository';

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

export class UserService {
  constructor(private readonly repo: IUserRepository) {}

  async getAll(): Promise<User[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.repo.findByEmail(dto.email)) {
      throw new EmailConflictError(dto.email);
    }
    return this.repo.save({ name: dto.name, email: dto.email });
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new UserNotFoundError(id);
  }
}
