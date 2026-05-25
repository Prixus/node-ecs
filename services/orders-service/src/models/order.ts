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

export interface CreateOrderDto {
  userId: string;
  items: OrderItem[];
}
