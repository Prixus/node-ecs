import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'name is required').max(100),
  email: z.string().email('invalid email format'),
});

// Infer the DTO type from the schema — single source of truth
export type CreateUserDto = z.infer<typeof createUserSchema>;
