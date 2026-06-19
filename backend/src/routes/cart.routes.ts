import { Router } from "express";
import { z } from "zod";

import prisma from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const addItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
});

const productIdSchema = z.object({
  productId: z.string().min(1),
});

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    return res.json({ success: true, cart });
  })
);

router.post(
  "/add",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid item" });
    }
    const { productId, quantity } = parsed.data;

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const userId = req.user!.id;

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return res.json({ success: true, message: "Added to cart" });
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

    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: parsed.data.productId },
    });

    return res.json({ success: true, message: "Removed from cart" });
  })
);

router.post(
  "/clear",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      return res.json({ success: true });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return res.json({ success: true, message: "Cart cleared" });
  })
);

export default router;
