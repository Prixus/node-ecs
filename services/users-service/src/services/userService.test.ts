import { userService, UserNotFoundError, EmailConflictError } from './userService';
import { userRepository } from '../repositories/userRepository';

jest.mock('../repositories/userRepository', () => ({
  userRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockRepo = userRepository as jest.Mocked<typeof userRepository>;

beforeEach(() => jest.clearAllMocks());

const makeUser = (overrides = {}) => ({
  id: 'u1',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('userService', () => {
  it('creates a user and retrieves it', async () => {
    const user = makeUser();
    mockRepo.findByEmail.mockResolvedValue(undefined);
    mockRepo.save.mockResolvedValue(user);
    mockRepo.findById.mockResolvedValue(user);

    const created = await userService.create({ name: 'Alice', email: 'alice@example.com' });
    expect(created.id).toBeDefined();
    const found = await userService.getById('u1');
    expect(found).toMatchObject({ name: 'Alice' });
  });

  it('throws EmailConflictError on duplicate email', async () => {
    mockRepo.findByEmail.mockResolvedValue(makeUser());

    await expect(
      userService.create({ name: 'Bob2', email: 'alice@example.com' }),
    ).rejects.toThrow(EmailConflictError);
  });

  it('throws UserNotFoundError for unknown id', async () => {
    mockRepo.findById.mockResolvedValue(undefined);

    await expect(userService.getById('nonexistent')).rejects.toThrow(UserNotFoundError);
  });

  it('deletes a user', async () => {
    mockRepo.delete.mockResolvedValue(true);

    await userService.delete('u1');
    expect(mockRepo.delete).toHaveBeenCalledWith('u1');
  });

  it('throws UserNotFoundError when deleting non-existent user', async () => {
    mockRepo.delete.mockResolvedValue(false);

    await expect(userService.delete('nonexistent')).rejects.toThrow(UserNotFoundError);
  });
});
