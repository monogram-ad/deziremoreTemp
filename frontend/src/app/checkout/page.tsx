"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import WhatsAppCheckout from "@/components/WhatsAppCheckout";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container-custom py-16">
        <div className="luxury-card p-8 text-center max-w-md mx-auto">
          <h1 className="text-3xl font-heading mb-4">Please Login to Checkout</h1>
          <p className="text-gray-500 mb-6">Your cart is saved — log in to continue.</p>
          <Link href="/login" className="btn-primary inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-16">
        <div className="luxury-card p-8 text-center max-w-md mx-auto">
          <h1 className="text-3xl font-heading mb-4">Your Cart Is Empty</h1>
          <Link href="/" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="luxury-card p-6">
          <h2 className="text-3xl font-heading mb-5">Delivery Details</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-xl p-3"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full border rounded-xl p-3"
            />

            <textarea
              placeholder="Full Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={5}
              className="w-full border rounded-xl p-3"
            />
          </div>
        </div>

        <div className="luxury-card p-6">
          <h2 className="text-3xl font-heading mb-5">Order Summary</h2>

          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-lg font-medium border-t pt-4 mb-6">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>

          <WhatsAppCheckout
            items={items}
            customerName={customerName}
            customerPhone={customerPhone}
            address={address}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}
