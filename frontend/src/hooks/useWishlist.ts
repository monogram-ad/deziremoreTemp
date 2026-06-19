"use client";

import { useWishlistStore } from "@/store/wishlistStore";

export function useWishlist() {
  const items = useWishlistStore((state) => state.items);
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted);

  return {
    items,
    addItem,
    removeItem,
    toggleItem,
    clearWishlist,
    isWishlisted,
    totalItems: items.length,
  };
}
