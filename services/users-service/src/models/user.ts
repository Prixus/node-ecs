export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// DTO is now derived from the Zod schema (single source of truth)
export type { CreateUserDto } from '../schemas/userSchemas';
