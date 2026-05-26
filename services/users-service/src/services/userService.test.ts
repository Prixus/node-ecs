import { UserService, UserNotFoundError, EmailConflictError } from './userService';
import { IUserRepository } from '../repositories/userRepository';
import { User } from '../models/user';

const baseUser: User = {
  id: 'uuid-1',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date().toISOString(),
};

// Mock the repository interface — no ORM, no DB, no pg pool needed
const mockRepo: jest.Mocked<IUserRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const service = new UserService(mockRepo);

beforeEach(() => jest.clearAllMocks());

describe('UserService', () => {
  it('creates a user', async () => {
    mockRepo.findByEmail.mockResolvedValue(undefined);
    mockRepo.save.mockResolvedValue(baseUser);

    const user = await service.create({ name: 'Alice', email: 'alice@example.com' });
    expect(user.id).toBe('uuid-1');
    expect(mockRepo.save).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com' });
  });

  it('throws EmailConflictError on duplicate email', async () => {
    mockRepo.findByEmail.mockResolvedValue(baseUser);

    await expect(
      service.create({ name: 'Bob', email: 'alice@example.com' }),
    ).rejects.toThrow(EmailConflictError);
  });

  it('throws UserNotFoundError for unknown id', async () => {
    mockRepo.findById.mockResolvedValue(undefined);

    await expect(service.getById('nonexistent')).rejects.toThrow(UserNotFoundError);
  });

  it('deletes a user', async () => {
    mockRepo.delete.mockResolvedValue(true);

    await expect(service.delete('uuid-1')).resolves.toBeUndefined();
  });

  it('throws UserNotFoundError when deleting unknown id', async () => {
    mockRepo.delete.mockResolvedValue(false);

    await expect(service.delete('nonexistent')).rejects.toThrow(UserNotFoundError);
  });
});
