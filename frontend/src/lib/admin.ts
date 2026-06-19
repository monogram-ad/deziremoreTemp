import { apiGet, apiPost, apiPatch } from "./api";
import { Order, OrderStatus } from "@/types/Order";
import { User } from "@/types/User";

export interface AdminStats {
  productCount: number;
  orderCount: number;
  userCount: number;
  leadCount: number;
  pendingOrders: number;
}

export async function getAdminStats() {
  return apiGet<{ success: boolean; stats: AdminStats }>("/api/admin/stats");
}

export interface RescanSummary {
  scannedCategories: number;
  scannedProducts: number;
  createdProducts: number;
  updatedProducts: number;
  unchangedProducts: number;
  deactivatedProducts: number;
  deactivatedCategories: number;
  skipped: { folder: string; reason: string }[];
  warnings: string[];
  durationMs: number;
}

export async function triggerRescan() {
  return apiPost<{ success: boolean; summary: RescanSummary }>(
    "/api/admin/assets/rescan",
    {}
  );
}

export interface PaginatedAdminOrders {
  success: boolean;
  orders: (Order & { user: { id: string; name: string; email: string } })[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAdminOrders(params?: { page?: number; status?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return apiGet<PaginatedAdminOrders>(`/api/admin/orders${qs ? `?${qs}` : ""}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return apiPatch<{ success: boolean; order: Order }>(`/api/admin/orders/${id}/status`, {
    status,
  });
}

export interface AdminUser extends User {
  _count: { orders: number };
}

export interface PaginatedAdminUsers {
  success: boolean;
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAdminUsers(params?: { page?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiGet<PaginatedAdminUsers>(`/api/admin/users${qs ? `?${qs}` : ""}`);
}

export async function updateUserRole(id: string, role: "ADMIN" | "CUSTOMER") {
  return apiPatch<{ success: boolean; user: User }>(`/api/admin/users/${id}/role`, { role });
}

export interface AdminLead {
  id: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export interface PaginatedAdminLeads {
  success: boolean;
  leads: AdminLead[];
  total: number;
  page: number;
  totalPages: number;
}

export async function getAdminLeads(params?: { page?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiGet<PaginatedAdminLeads>(`/api/admin/leads${qs ? `?${qs}` : ""}`);
}
