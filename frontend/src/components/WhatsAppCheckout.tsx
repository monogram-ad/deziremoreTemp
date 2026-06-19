"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/lib/orders";
import { useCart } from "@/hooks/useCart";
import { CartItem } from "@/store/cartStore";

interface WhatsAppCheckoutProps {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  address: string;
  isAuthenticated: boolean;
}

export default function WhatsAppCheckout({
  items,
  customerName,
  customerPhone,
  address,
  isAuthenticated,
}: WhatsAppCheckoutProps) {
  const router = useRouter();
  const { clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = async () => {
    setError(null);

    if (!isAuthenticated) {
      setError("Please log in to place an order.");
      return;
    }
    if (!customerName || !customerPhone || !address) {
      setError("Please fill in your name, phone, and address.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      // Price is intentionally NOT sent here — the backend always
      // resolves the authoritative price from the database for each
      // productId. Sending a client-supplied price would let anyone
      // place an order at whatever amount they want.
      const result = await createOrder({
        customerName,
        customerPhone,
        address,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      window.open(result.whatsappUrl, "_blank");
      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <p className="text-red-600 text-sm mb-3" role="alert">
          {error}
          {!isAuthenticated && (
            <>
              {" "}
              <a href="/login" className="underline">
                Log in
              </a>
            </>
          )}
        </p>
      )}

      <button onClick={placeOrder} disabled={loading} className="btn-primary w-full">
        {loading ? "Placing Order..." : "Order via WhatsApp"}
      </button>
    </div>
  );
}
