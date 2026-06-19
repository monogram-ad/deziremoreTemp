import { Router } from "express";
import { z } from "zod";

import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { leadRateLimiter } from "../middleware/rateLimiter";

const router = Router();

const leadSchema = z
  .object({
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(7).max(20).optional().or(z.literal("")),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Email or phone is required",
  });

// Public: anyone can drop their contact details in the homepage popup.
// Listing leads is admin-only — see GET /api/admin/leads.
router.post(
  "/",
  leadRateLimiter,
  asyncHandler(async (req, res) => {
    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || "Invalid submission",
      });
    }

    const lead = await prisma.lead.create({
      data: {
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
      },
    });

    return res.status(201).json({ success: true, lead });
  })
);

export default router;
