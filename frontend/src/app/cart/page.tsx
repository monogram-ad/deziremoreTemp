"use client";

import Link from "next/link";
import { useCart } from "@/hooks/useCart";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  return (
    <div className="container-custom py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl font-heading">Shopping Cart</h1>

        {items.length > 0 && (
          <button onClick={clearCart} className="btn-outline">
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="luxury-card p-8">
          <p>Your cart is empty.</p>

          <Link href="/" className="btn-primary inline-block mt-4">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="luxury-card p-5 flex flex-col md:flex-row md:items-center gap-4"
              >
                <Link href={`/product/${item.slug}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                </Link>

                <div className="flex-1">
                  <Link href={`/product/${item.slug}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-gray-500 text-sm mt-1">₹{item.price} each</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-1 border rounded"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 border rounded"
                  >
                    +
                  </button>
                </div>

                <p className="font-medium w-20 text-right">
                  ₹{item.price * item.quantity}
                </p>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-gray-500 underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="luxury-card p-6 h-fit">
            <h2 className="text-2xl font-heading mb-4">Order Summary</h2>
            <div className="flex justify-between text-lg font-medium mb-6">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>
            <Link href="/checkout" className="btn-primary w-full text-center block">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
