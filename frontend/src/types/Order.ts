import { ProductCore } from "./Product";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  product: ProductCore;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface OrderResponse {
  success: boolean;
  order: Order;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  whatsappUrl: string;
}
