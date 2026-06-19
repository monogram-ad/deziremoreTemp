"use client";

import { useWishlist } from "@/hooks/useWishlist";
import { Product } from "@/types/Product";
import { getProductThumbnail } from "@/lib/images";

interface WishlistButtonProps {
  product: Product;
}

export default function WishlistButton({ product }: WishlistButtonProps) {
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  function handleClick() {
    toggleItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: getProductThumbnail(product),
    });
  }

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-3 rounded-xl border transition ${
        wishlisted
          ? "bg-primary text-white border-primary"
          : "bg-white border-gray-300"
      }`}
    >
      {wishlisted ? "♥ Wishlisted" : "♡ Add to Wishlist"}
    </button>
  );
}
