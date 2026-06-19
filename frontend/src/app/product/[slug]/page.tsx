"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProductGallery from "@/components/ProductGallery";
import ProductDescription from "@/components/ProductDescription";
import ProductActions from "@/components/ProductActions";
import Breadcrumb from "@/components/Breadcrumb";

import { getProduct } from "@/lib/productLoader";
import { getProductImageUrl } from "@/lib/images";
import { Product } from "@/types/Product";

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getProduct(slug)
      .then((response) => {
        if (!cancelled) setProduct(response.product);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load product");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div className="container-custom py-16">Loading...</div>;
  }

  if (error || !product) {
    return (
      <div className="container-custom py-16">
        <p>{error || "Product not found."}</p>
      </div>
    );
  }

  const galleryImages = product.images.map((image) =>
    getProductImageUrl(product.assetPath, image)
  );

  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <div className="container-custom py-16">
      <Breadcrumb
        items={[
          { label: product.categoryName || product.category, href: `/category/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-10">
        <ProductGallery images={galleryImages} />

        <div>
          <p className="uppercase text-primary tracking-wider">
            {product.categoryName || product.category}
          </p>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-medium">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.mrp}
                </span>
                {discountPercent && (
                  <span className="text-sm text-green-600 font-medium">
                    {discountPercent}% off
                  </span>
                )}
              </>
            )}
          </div>

          <div className="mt-6">
            <ProductDescription
              title={product.name}
              description={product.description}
              fabric={product.fabric || undefined}
              color={product.color || undefined}
              sizes={product.sizes}
            />
          </div>

          <div className="mt-8">
            <ProductActions product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
