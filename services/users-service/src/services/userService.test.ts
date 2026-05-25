import { userService, UserNotFoundError, EmailConflictError } from './userService';

describe('userService', () => {
  it('creates a user and retrieves it', () => {
    const user = userService.create({ name: 'Alice', email: `alice+${Date.now()}@example.com` });
    expect(user.id).toBeDefined();
    expect(userService.getById(user.id)).toMatchObject({ name: 'Alice' });
  });

  it('throws EmailConflictError on duplicate email', () => {
    const email = `dup+${Date.now()}@example.com`;
    userService.create({ name: 'Bob', email });
    expect(() => userService.create({ name: 'Bob2', email })).toThrow(EmailConflictError);
  });

  it('throws UserNotFoundError for unknown id', () => {
    expect(() => userService.getById('nonexistent')).toThrow(UserNotFoundError);
  });

  it('deletes a user', () => {
    const user = userService.create({ name: 'Carol', email: `carol+${Date.now()}@example.com` });
    userService.delete(user.id);
    expect(() => userService.getById(user.id)).toThrow(UserNotFoundError);
  });
});
