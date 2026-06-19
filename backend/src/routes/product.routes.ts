import { Router } from "express";
import { ProductService } from "../services/product.service";

const router = Router();

function parsePagination(req: import("express").Request) {
  return {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  };
}

router.get("/", async (req, res) => {
  const result = await ProductService.getAllProducts(parsePagination(req));
  return res.json(result);
});

router.get("/categories", async (_req, res) => {
  const result = await ProductService.getCategories();
  return res.json(result);
});

router.get("/category/:category", async (req, res) => {
  const result = await ProductService.getProductsByCategory(
    req.params.category,
    parsePagination(req)
  );
  return res.json(result);
});

// NOTE: mounted at /api/products/search. This is the canonical search
// endpoint — the standalone /api/search route has been removed to avoid
// two implementations of the same query drifting apart (see audit report).
router.get("/search", async (req, res) => {
  const query = String(req.query.q || "");
  const result = await ProductService.searchProducts(query, parsePagination(req));
  return res.json(result);
});

router.get("/:slug", async (req, res) => {
  const result = await ProductService.getProductBySlug(req.params.slug);

  if (!result.product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  return res.json(result);
});

export default router;
