"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/lib/constants";

export interface CartProductSnapshot {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

export interface CartItem extends CartProductSnapshot {
  quantity: number;
}

interface CartState {
  items: CartItem[];

  addItem: (product: CartProductSnapshot, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

/**
 * Cart is keyed by productId (matching the backend's Product.id) rather
 * than slug — slugs identify a product for routing, but the cart/order
 * APIs operate on productId, and using a different key here than the
 * rest of the system was a source of bugs (see audit report). A price
 * snapshot is stored at add-time purely for display in the cart UI;
 * checkout always re-resolves the authoritative price server-side
 * before charging anything (see backend order.routes.ts).
 *
 * Persisted to localStorage so the cart survives a page refresh —
 * previously it didn't persist at all.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, { ...product, quantity }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.id !== productId)
              : state.items.map((item) =>
                  item.id === productId ? { ...item, quantity } : item
                ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    { name: CART_STORAGE_KEY }
  )
);
