"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading mb-8">Wishlist</h1>

      {items.length === 0 ? (
        <div className="luxury-card p-8">
          <p>Your wishlist is empty.</p>
          <Link href="/" className="btn-primary inline-block mt-4">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="luxury-card p-5 flex items-center gap-4"
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
                <p className="text-sm text-gray-500 mt-1">₹{item.price}</p>
                <p className="text-xs text-gray-400">
                  Added on {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    addItem(item);
                    removeItem(item.id);
                  }}
                  className="btn-outline"
                >
                  Move to Cart
                </button>

                <button onClick={() => removeItem(item.id)} className="text-sm text-gray-500 underline">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
