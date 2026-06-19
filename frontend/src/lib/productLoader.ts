import { apiGet } from "./api";
import {
  ProductResponse,
  ProductsResponse,
  CategoriesResponse,
} from "@/types/Product";

export type { Product } from "@/types/Product";

export async function getProducts(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  return apiGet<ProductsResponse>(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function getProduct(slug: string) {
  return apiGet<ProductResponse>(`/api/products/${slug}`);
}

export async function getCategories() {
  return apiGet<CategoriesResponse>("/api/products/categories");
}

export async function getCategoryProducts(
  category: string,
  params?: { page?: number; limit?: number }
) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  return apiGet<ProductsResponse>(
    `/api/products/category/${category}${qs ? `?${qs}` : ""}`
  );
}

export async function searchProducts(query: string) {
  return apiGet<ProductsResponse>(
    `/api/products/search?q=${encodeURIComponent(query)}`
  );
}
