import { userService, UserNotFoundError, EmailConflictError } from './userService';
import { userRepository } from '../repositories/userRepository';

// Mock the repository so tests don't need a real DB connection
jest.mock('../repositories/userRepository');
const mockRepo = jest.mocked(userRepository);

const baseUser = {
  id: 'uuid-1',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date().toISOString(),
};

beforeEach(() => jest.clearAllMocks());

describe('userService', () => {
  it('creates a user', async () => {
    mockRepo.findByEmail.mockResolvedValue(undefined);
    mockRepo.save.mockResolvedValue(baseUser);

    const user = await userService.create({ name: 'Alice', email: 'alice@example.com' });
    expect(user.id).toBe('uuid-1');
    expect(mockRepo.save).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com' });
  });

  it('throws EmailConflictError on duplicate email', async () => {
    mockRepo.findByEmail.mockResolvedValue(baseUser);

    await expect(
      userService.create({ name: 'Bob', email: 'alice@example.com' }),
    ).rejects.toThrow(EmailConflictError);
  });

  it('throws UserNotFoundError for unknown id', async () => {
    mockRepo.findById.mockResolvedValue(undefined);

    await expect(userService.getById('nonexistent')).rejects.toThrow(UserNotFoundError);
  });

  it('deletes a user', async () => {
    mockRepo.delete.mockResolvedValue(true);

    await expect(userService.delete('uuid-1')).resolves.toBeUndefined();
  });

  it('throws UserNotFoundError when deleting unknown id', async () => {
    mockRepo.delete.mockResolvedValue(false);

    await expect(userService.delete('nonexistent')).rejects.toThrow(UserNotFoundError);
  });
});
