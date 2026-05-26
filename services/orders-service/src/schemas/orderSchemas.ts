import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive('quantity must be a positive integer'),
  unitPrice: z.number().positive('unitPrice must be positive'),
});

export const createOrderSchema = z.object({
  userId: z.string().uuid('userId must be a valid UUID'),
  items: z.array(orderItemSchema).min(1, 'order must have at least one item'),
});

// Infer the DTO type from the schema — single source of truth
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
