"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Product } from "@/types/Product";
import { getProductThumbnail } from "@/lib/images";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
}

export default function AddToCartButton({
  product,
  quantity = 1,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: getProductThumbnail(product),
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button onClick={handleClick} className="btn-primary">
      {added ? "Added ✓" : "Add To Cart"}
    </button>
  );
}
