export const COOKIE_NAME =
  "token";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite:
    "lax" as const,
  secure:
    process.env.NODE_ENV ===
    "production",
  maxAge:
    7 *
    24 *
    60 *
    60 *
    1000,
};