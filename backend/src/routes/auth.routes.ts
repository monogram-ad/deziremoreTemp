import { Router } from "express";
import { z } from "zod";

import { AuthService } from "../services/auth.service";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import { COOKIE_NAME, COOKIE_OPTIONS } from "../constants/cookies";
import { authRateLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(7).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/register",
  authRateLimiter,
  async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || "Invalid input",
      });
    }

    try {
      const result = await AuthService.register(parsed.data);

      res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);

      return res.status(201).json({ success: true, user: result.user });
    } catch (error) {
      // Known, user-facing failures (duplicate email/phone) come back as
      // a friendly 400. Anything else (e.g. a transient DB error) is
      // logged and reported generically rather than leaking internals.
      if (error instanceof Error && /already exists/.test(error.message)) {
        return res.status(409).json({ success: false, message: error.message });
      }
      console.error("[auth] register failed:", error);
      return res.status(500).json({ success: false, message: "Registration failed" });
    }
  }
);

router.post(
  "/login",
  authRateLimiter,
  async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    try {
      const result = await AuthService.login(parsed.data.email, parsed.data.password);

      res.cookie(COOKIE_NAME, result.token, COOKIE_OPTIONS);

      return res.json({ success: true, user: result.user });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  }
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await AuthService.getUser(req.user!.id);
    return res.json({ success: true, user });
  })
);

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(7).optional(),
});

router.put(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    try {
      const user = await AuthService.updateProfile(req.user!.id, parsed.data);
      return res.json({ success: true, user });
    } catch (error) {
      return res.status(409).json({
        success: false,
        message: error instanceof Error ? error.message : "Update failed",
      });
    }
  })
);

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

router.put(
  "/me/password",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || "Invalid input",
      });
    }

    try {
      await AuthService.changePassword(
        req.user!.id,
        parsed.data.currentPassword,
        parsed.data.newPassword
      );
      return res.json({ success: true, message: "Password updated" });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Could not update password",
      });
    }
  })
);

router.post("/logout", (_req, res) => {
  // Pass the same attributes used when setting the cookie — some
  // browsers will not clear a cookie whose sameSite/secure attributes
  // don't match what's passed to clearCookie.
  res.clearCookie(COOKIE_NAME, {
    httpOnly: COOKIE_OPTIONS.httpOnly,
    sameSite: COOKIE_OPTIONS.sameSite,
    secure: COOKIE_OPTIONS.secure,
  });

  return res.json({ success: true, message: "Logged out successfully" });
});

export default router;
