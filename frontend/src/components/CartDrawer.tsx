"use client";

import Link from "next/link";
import { CartItem } from "@/store/cartStore";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
}

/**
 * Not currently wired into the app — the cart icon in Navbar links
 * straight to /cart instead of opening a slide-out. Left here, fixed
 * up to match the real CartItem shape, in case a mini-cart drawer is
 * wanted later. See "Dead code" in the audit report.
 */
export default function CartDrawer({ open, onClose, items }: CartDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="text-2xl font-heading">Your Cart</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
          {items.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="border rounded-xl p-4 flex gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Qty {item.quantity} · ₹{item.price}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t p-5 bg-white">
          <Link href="/cart" className="btn-primary block text-center">
            View Cart
          </Link>
        </div>
      </div>
    </>
  );
}
