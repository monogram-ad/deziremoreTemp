"use client";

import Link from "next/link";

interface ProductCardProps {
  slug: string;
  name: string;
  image: string;
  price?: number;
  category?: string;
}

export default function ProductCard({
  slug,
  name,
  image,
  price,
  category,
}: ProductCardProps) {
  return (
    <Link
      href={`/product/${slug}`}
      className="group luxury-card overflow-hidden block"
    >
      <div className="overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-80 object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        {category && (
          <p className="text-xs uppercase tracking-wider text-primary">
            {category}
          </p>
        )}

        <h3 className="text-xl font-semibold mt-2">
          {name}
        </h3>

        {price !== undefined && (
          <p className="mt-2 text-primary font-semibold">
            ₹{price.toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </Link>
  );
}