"use client";

import { useState } from "react";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import { Product } from "@/types/Product";

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center border rounded-xl">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-lg"
        >
          −
        </button>
        <span className="px-3">{quantity}</span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => setQuantity((q) => q + 1)}
          className="px-3 py-2 text-lg"
        >
          +
        </button>
      </div>

      <AddToCartButton product={product} quantity={quantity} />
      <WishlistButton product={product} />
    </div>
  );
}
