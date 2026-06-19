import { Router } from "express";
import { z } from "zod";

import prisma from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const productIdSchema = z.object({
  productId: z.string().min(1),
});

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    return res.json({ success: true, wishlist });
  })
);

router.post(
  "/add",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = productIdSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }
    const { productId } = parsed.data;

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const userId = req.user!.id;

    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });
    }

    return res.json({ success: true, message: "Added to wishlist" });
  })
);

router.post(
  "/remove",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = productIdSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId: parsed.data.productId },
    });

    return res.json({ success: true, message: "Removed from wishlist" });
  })
);

router.post(
  "/clear",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user!.id } });
    if (!wishlist) {
      return res.json({ success: true });
    }

    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });

    return res.json({ success: true, message: "Wishlist cleared" });
  })
);

export default router;
