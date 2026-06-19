import { Router } from "express";
import { z } from "zod";

import prisma from "../lib/prisma";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth.middleware";
import { syncAssetsToDatabase } from "../services/assetSync.service";

const router = Router();

// Every route in this file is admin-only.
router.use(requireAuth, requireAdmin);

function pagination(req: import("express").Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

// ---------------------------------------------------------------------
// Dashboard summary
// ---------------------------------------------------------------------

router.get("/stats", async (_req, res) => {
  const [productCount, orderCount, userCount, leadCount, pendingOrders] =
    await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.lead.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

  return res.json({
    success: true,
    stats: { productCount, orderCount, userCount, leadCount, pendingOrders },
  });
});

// ---------------------------------------------------------------------
// Asset rescan/sync — the explicit "Asset rescan/sync" admin requirement.
// The watcher already syncs automatically, but this lets an admin force
// an immediate rescan (e.g. right after deploying new asset folders to
// a server where the watcher missed an event, or to confirm a sync ran).
// ---------------------------------------------------------------------

router.post("/assets/rescan", async (_req, res) => {
  try {
    const summary = await syncAssetsToDatabase();
    return res.json({ success: true, summary });
  } catch (error) {
    console.error("[admin] Manual rescan failed:", error);
    return res.status(500).json({ success: false, message: "Rescan failed" });
  }
});

// ---------------------------------------------------------------------
// Order management
// ---------------------------------------------------------------------

router.get("/orders", async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const status = req.query.status as string | undefined;

  const where = status ? { status: status as any } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return res.json({
    success: true,
    count: orders.length,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    orders,
  });
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

router.patch("/orders/:id/status", async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    return res.json({ success: true, order });
  } catch {
    return res.status(404).json({ success: false, message: "Order not found" });
  }
});

// ---------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------

router.get("/users", async (req, res) => {
  const { page, limit, skip } = pagination(req);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  return res.json({
    success: true,
    count: users.length,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    users,
  });
});

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "CUSTOMER"]),
});

router.patch("/users/:id/role", async (req: AuthRequest, res) => {
  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  // Guard against locking everyone out by demoting the last admin.
  if (parsed.data.role === "CUSTOMER" && req.params.id === req.user!.id) {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot demote the only remaining admin.",
      });
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: parsed.data.role },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.json({ success: true, user });
  } catch {
    return res.status(404).json({ success: false, message: "User not found" });
  }
});

// ---------------------------------------------------------------------
// Leads (collected via the homepage popup, see lead.routes.ts for the
// public POST endpoint — listing them is admin-only).
// ---------------------------------------------------------------------

router.get("/leads", async (req, res) => {
  const { page, limit, skip } = pagination(req);

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.lead.count(),
  ]);

  return res.json({
    success: true,
    count: leads.length,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    leads,
  });
});

export default router;
