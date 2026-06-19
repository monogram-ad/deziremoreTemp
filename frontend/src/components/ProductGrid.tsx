import ProductCard from "./ProductCard";
import { Product } from "@/types/Product";
import { getProductThumbnail } from "@/lib/images";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products?.length) {
    return (
      <div className="luxury-card p-8 text-center">
        No products available.
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          slug={product.slug}
          name={product.name}
          image={getProductThumbnail(product)}
          price={product.price}
          category={product.categoryName || product.category}
        />
      ))}
    </div>
  );
}
