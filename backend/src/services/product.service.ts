import type { Category } from "@prisma/client";
import prisma from "../lib/prisma";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

function clampLimit(limit?: number) {
  if (!limit || Number.isNaN(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

function clampPage(page?: number) {
  if (!page || Number.isNaN(page) || page <= 0) return 1;
  return page;
}

export class ProductService {
  /** All products are read from the database, which the asset-sync job
   *  keeps in lockstep with assets/ on disk — see assetSync.service.ts.
   *  We never touch the filesystem on a request path. */

  static async getAllProducts(options: { page?: number; limit?: number } = {}) {
    const page = clampPage(options.page);
    const limit = clampLimit(options.limit);

    const where = { isActive: true };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      products: products.map(serializeProduct),
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { category: true },
    });

    return {
      success: !!product,
      product: product ? serializeProduct(product) : null,
    };
  }

  static async getCategories() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      count: categories.length,
      categories: categories.map((c: Category) => c.slug),
    };
  }

  static async getProductsByCategory(
    categorySlug: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const page = clampPage(options.page);
    const limit = clampLimit(options.limit);

    const where = {
      isActive: true,
      category: { slug: categorySlug, isActive: true },
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      products: products.map(serializeProduct),
    };
  }

  static async searchProducts(
    query: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const page = clampPage(options.page);
    const limit = clampLimit(options.limit);

    if (!query.trim()) {
      return { success: true, count: 0, total: 0, page, totalPages: 1, products: [] };
    }

    const where = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
        { fabric: { contains: query, mode: "insensitive" as const } },
        { color: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      products: products.map(serializeProduct),
    };
  }
}

function serializeProduct(product: any) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.price,
    mrp: product.mrp,
    fabric: product.fabric,
    color: product.color,
    sizes: product.sizes,
    images: product.images,
    assetPath: product.assetPath,
    category: product.category?.slug ?? null,
    categoryName: product.category?.name ?? null,
  };
}
