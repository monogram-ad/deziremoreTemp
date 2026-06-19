"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WISHLIST_STORAGE_KEY } from "@/lib/constants";
import { CartProductSnapshot } from "./cartStore";

export interface WishlistItem extends CartProductSnapshot {
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];

  addItem: (product: CartProductSnapshot) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: CartProductSnapshot) => void;
  clearWishlist: () => void;
  isWishlisted: (productId: string) => boolean;
}

/**
 * This is the ONE wishlist store in the app. Previously WishlistButton
 * kept its own separate `useState` instead of using this store at all,
 * so the heart icon on a product page, the navbar wishlist count, and
 * the /wishlist page could all disagree with each other. Everything
 * that reads or writes wishlist state should go through this store.
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) return state;
          return {
            items: [...state.items, { ...product, addedAt: new Date().toISOString() }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      toggleItem: (product) => {
        const isInWishlist = get().items.some((item) => item.id === product.id);
        if (isInWishlist) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      clearWishlist: () => set({ items: [] }),

      isWishlisted: (productId) => get().items.some((item) => item.id === productId),
    }),
    { name: WISHLIST_STORAGE_KEY }
  )
);
