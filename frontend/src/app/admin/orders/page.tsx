"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { getAdminOrders, updateOrderStatus, PaginatedAdminOrders } from "@/lib/admin";
import { OrderStatus } from "@/types/Order";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

function AdminOrdersPage() {
  const [data, setData] = useState<PaginatedAdminOrders | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    getAdminOrders()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"));
  }

  useEffect(load, []);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading mb-8">Orders</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        {data?.orders.map((order) => (
          <div key={order.id} className="luxury-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-medium">#{order.id.slice(-8)}</p>
                <p className="text-sm text-gray-500">
                  {order.user?.name} ({order.user?.email}) ·{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <select
                value={order.status}
                disabled={updatingId === order.id}
                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                className="border rounded-lg p-2"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm space-y-1">
              {order.items.map((item) => (
                <p key={item.id}>
                  {item.product?.name || item.productId} × {item.quantity} — ₹{item.price}
                </p>
              ))}
            </div>

            <p className="font-medium mt-2">Total: ₹{order.totalAmount}</p>
            <p className="text-sm text-gray-500">{order.address}</p>
          </div>
        ))}

        {data && data.orders.length === 0 && (
          <p className="text-gray-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminOrdersPage />
    </AdminGuard>
  );
}
