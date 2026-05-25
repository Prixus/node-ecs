import { User } from '../models/user';

const store = new Map<string, User>();

export const userRepository = {
  findAll(): User[] {
    return Array.from(store.values());
  },

  findById(id: string): User | undefined {
    return store.get(id);
  },

  findByEmail(email: string): User | undefined {
    return Array.from(store.values()).find((u) => u.email === email);
  },

  save(user: User): User {
    store.set(user.id, user);
    return user;
  },

  delete(id: string): boolean {
    return store.delete(id);
  },
};
