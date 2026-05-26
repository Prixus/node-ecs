export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
}

// DTO is now derived from the Zod schema (single source of truth)
export type { CreateOrderDto } from '../schemas/orderSchemas';
