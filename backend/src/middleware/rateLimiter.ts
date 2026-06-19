import rateLimit from "express-rate-limit";

/** Login/register: a handful of attempts per IP per window, to slow
 *  down credential-stuffing / brute-force attempts without locking out
 *  a real user who mistypes their password a couple of times. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later." },
});

/** Lead capture: generous, but enough to stop a script from flooding
 *  the leads table from a single IP. */
export const leadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many submissions. Please try again later." },
});
