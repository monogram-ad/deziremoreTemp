/**
 * Centralised environment validation. Importing this module is what
 * actually loads `.env` (via dotenv) — every other module should pull
 * configuration from `env` below rather than reading `process.env`
 * directly, so there is exactly one place that decides what's required
 * and what's allowed to fall back to a dev default.
 */
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

function required(name: string, devFallback?: string): string {
  const value = process.env[name];
  if (value) return value;

  if (isProduction) {
    // Fail fast and loud on boot rather than limping along with a
    // hardcoded secret or silently pointing at the wrong database.
    throw new Error(
      `Missing required environment variable "${name}" in production.`
    );
  }

  if (devFallback !== undefined) {
    console.warn(
      `[env] "${name}" not set — using development fallback. Do not deploy this configuration.`
    );
    return devFallback;
  }

  throw new Error(`Missing required environment variable "${name}".`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction,
  port: Number(process.env.PORT) || 5000,

  databaseUrl: required("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/deziremore"),
  jwtSecret: required("JWT_SECRET", "dev-only-insecure-secret-do-not-use-in-production"),

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "919999999999",
};
