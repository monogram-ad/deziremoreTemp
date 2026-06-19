/**
 * Single source of truth for the Product shape across the frontend.
 * Previously this interface existed twice (here, and again — with a
 * different, narrower shape — in lib/productLoader.ts), and most
 * fields were marked optional because the backend didn't actually
 * populate them yet. Now that desc.txt is parsed and synced into the
 * database (see backend/src/services/assetSync.service.ts), these
 * fields are always present for any product the API returns.
 *
 * ProductCore is every field that's a real column on the Product
 * table — present no matter how the product was fetched, including
 * when nested inside an order/cart/wishlist item. `category` /
 * `categoryName` are added by ProductService's serializer for the
 * catalog-browsing endpoints (list/search/by-slug/by-category) and
 * are NOT present on a product nested inside an order item (the
 * backend returns the raw row there) — that distinction is real, so
 * the type reflects it instead of pretending those fields always
 * exist.
 */
export interface ProductCore {
  id: string;
  slug: string;

  name: string;
  description: string;

  price: number;
  mrp: number | null;

  fabric: string | null;
  color: string | null;
  sizes: string[];

  images: string[];
  assetPath: string;
}

export interface Product extends ProductCore {
  category: string;
  categoryName: string | null;
}

export interface ProductResponse {
  success: boolean;
  product: Product | null;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  products: Product[];
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  categories: string[];
}
