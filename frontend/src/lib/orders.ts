import { apiGet, apiPost } from "./api";
import { OrdersResponse, OrderResponse, CreateOrderResponse } from "@/types/Order";

export async function getMyOrders() {
  return apiGet<OrdersResponse>("/api/orders");
}

export async function getOrder(id: string) {
  return apiGet<OrderResponse>(`/api/orders/${id}`);
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  address: string;
  items: { productId: string; quantity: number }[];
}

export async function createOrder(payload: CreateOrderPayload) {
  return apiPost<CreateOrderResponse>("/api/orders/create", payload);
}
