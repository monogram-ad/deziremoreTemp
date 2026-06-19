"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getMyOrders } from "@/lib/orders";
import { Order } from "@/types/Order";
import { getProductThumbnail } from "@/lib/images";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    getMyOrders()
      .then((res) => setOrders(res.orders))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="luxury-card p-8 text-center">
          <h1 className="text-3xl font-heading mb-4">Please Login</h1>
          <Link href="/login" className="btn-primary inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading mb-8">My Orders</h1>

      {loading && <p className="text-gray-500">Loading orders...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="luxury-card p-8 text-center">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link href="/" className="btn-primary inline-block">
            Start Shopping
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="luxury-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <p className="text-sm text-gray-500">Order #{order.id.slice(-8)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  STATUS_STYLES[order.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={getProductThumbnail(item.product)}
                    alt={item.product.name}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-medium">₹{item.quantity * item.price}</p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-medium">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
