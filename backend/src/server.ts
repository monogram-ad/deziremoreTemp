// Load + validate environment variables before anything else touches
// process.env (Prisma's datasource URL, JWT secret, etc. all depend on
// this having run first).
import { env } from "./config/env";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import orderRoutes from "./routes/order.routes";
import leadRoutes from "./routes/lead.routes";
import adminRoutes from "./routes/admin.routes";

import { errorHandler } from "./middleware/errorHandler";
import { syncAssetsToDatabase } from "./services/assetSync.service";
import { startAssetsWatcher, stopAssetsWatcher } from "./utils/assetsWatcher";
import { ASSETS_ROOT } from "./config/paths";

// `app` must exist before anything calls app.use()/app.get() — a
// previous version of this file referenced `app` above its declaration,
// which is a ReferenceError in JS and crashed the server on boot.
const app = express();

app.use(
  helmet({
    // Product photos are requested cross-origin from the Next.js
    // frontend's own origin (different host/port). Helmet's default
    // Cross-Origin-Resource-Policy of "same-origin" would silently
    // block every <img> tag from loading them.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(morgan(env.isProduction ? "combined" : "dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Product images live on disk under assets/<category>/<product>/<file>
// and are served as-is. The asset-sync service is what keeps the
// database in sync with this folder; this is just the file server.
app.use("/assets", express.static(ASSETS_ROOT));

app.get("/", (_req, res) => {
  res.json({ success: true, app: "Deziremore Backend", version: "1.0.0" });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, status: "healthy", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Must be registered last — Express only treats a 4-arg middleware as
// an error handler, and only errors thrown/forwarded after this point
// in the stack reach it.
app.use(errorHandler);

async function start() {
  console.log(`[startup] Scanning ${ASSETS_ROOT} for products...`);
  const summary = await syncAssetsToDatabase();
  console.log(
    `[startup] Initial sync: ${summary.createdProducts} created, ` +
      `${summary.updatedProducts} updated, ${summary.unchangedProducts} unchanged, ` +
      `${summary.deactivatedProducts} deactivated, ${summary.skipped.length} skipped.`
  );
  if (summary.warnings.length) {
    console.warn(`[startup] ${summary.warnings.length} warning(s):`, summary.warnings);
  }

  // Picks up new/changed/removed asset folders for the rest of the
  // process lifetime without needing a restart.
  startAssetsWatcher();

  const server = app.listen(env.port, () => {
    console.log(`🚀 Deziremore backend running on port ${env.port}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[shutdown] ${signal} received, closing gracefully...`);
    await stopAssetsWatcher();
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((error) => {
  console.error("[startup] Failed to start server:", error);
  process.exit(1);
});
