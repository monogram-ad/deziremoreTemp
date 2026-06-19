"use client";

import { useState } from "react";

import SearchBar from "@/components/SearchBar";
import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/EmptyState";
import { searchProducts } from "@/lib/productLoader";
import { Product } from "@/types/Product";

export default function SearchPage() {
  const [results, setResults] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setError(null);
    try {
      const response = await searchProducts(query);
      setResults(response.products || []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
  };

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading mb-8">Search Products</h1>

      <SearchBar onSearch={handleSearch} />

      <div className="mt-10">
        {error && <p className="text-red-600">{error}</p>}

        {searched && !error && results.length === 0 ? (
          <EmptyState
            title="No results found"
            description="Try a different search term, or browse our categories."
            buttonText="Browse Categories"
            buttonLink="/"
          />
        ) : (
          <ProductGrid products={results} />
        )}
      </div>
    </div>
  );
}
