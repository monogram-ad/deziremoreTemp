"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProductGrid from "@/components/ProductGrid";
import { getCategoryProducts } from "@/lib/productLoader";
import { Product } from "@/types/Product";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getCategoryProducts(slug)
      .then((response) => {
        if (!cancelled) setProducts(response.products || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const heading = products[0]?.categoryName || slug.replace(/-/g, " ");

  if (loading) {
    return <div className="container-custom py-16">Loading...</div>;
  }

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading capitalize mb-10">{heading}</h1>

      {error ? <p className="text-red-600">{error}</p> : <ProductGrid products={products} />}
    </div>
  );
}
