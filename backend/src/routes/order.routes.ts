import { Router } from "express";
import { z } from "zod";
import type { Product } from "@prisma/client";

import prisma from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";

const router = Router();

const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(7),
  address: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

router.post(
  "/create",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || "Invalid order",
      });
    }

    const { customerName, customerPhone, address, items } = parsed.data;

    // Price is ALWAYS resolved server-side from the database — the
    // previous implementation trusted a client-supplied `item.price`,
    // which lets anyone place an order at any price they want. Never
    // trust a price that came from the browser.
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    const productById = new Map<string, Product>(products.map((p: Product) => [p.id, p]));

    const missing = items.find((i: { productId: string; quantity: number }) => !productById.has(i.productId));
    if (missing) {
      return res.status(400).json({
        success: false,
        message: `Product ${missing.productId} is no longer available.`,
      });
    }

    let totalAmount = 0;
    const orderItemsData = items.map((item) => {
      const product = productById.get(item.productId)!;
      totalAmount += product.price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        customerName,
        customerPhone,
        address,
        totalAmount,
        items: { create: orderItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    const whatsappMessage = `
Hello Deziremore,

I would like to confirm my order.

Order ID: ${order.id}

Name: ${customerName}
Phone: ${customerPhone}

Items:
${order.items
  .map(
    (i: { product: Product; quantity: number; price: number }) =>
      `- ${i.product.name} x${i.quantity} (₹${i.price})`
  )
  .join("\n")}

Total: ₹${totalAmount}

Address:
${address}
`;

    const whatsappUrl =
      `https://wa.me/${env.whatsappNumber}?text=` +
      encodeURIComponent(whatsappMessage);

    return res.status(201).json({ success: true, order, whatsappUrl });
  })
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, orders });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    // Scoped to the requesting user — without this an authenticated
    // user could view ANY other customer's order (name, phone, address)
    // just by guessing/sharing an order id.
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.json({ success: true, order });
  })
);

export default router;
