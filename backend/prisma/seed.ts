import "../src/config/env";
import bcrypt from "bcrypt";
import prisma from "../src/lib/prisma";
import { syncAssetsToDatabase } from "../src/services/assetSync.service";

/**
 * Bootstraps a fresh database:
 *  1. Creates the first admin user (there is no other way to get an
 *     admin into the system — every other path to ADMIN requires an
 *     existing admin to grant it via /api/admin/users/:id/role).
 *  2. Runs the asset sync once so the catalog is populated immediately,
 *     instead of waiting for the server to boot.
 *
 * Run with: npm run seed
 * Configure the admin account via ADMIN_EMAIL / ADMIN_PASSWORD /
 * ADMIN_NAME env vars; sensible local-dev defaults are used otherwise.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@deziremore.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Deziremore Admin";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`[seed] Promoted existing user ${email} to ADMIN.`);
    } else {
      console.log(`[seed] Admin user ${email} already exists.`);
    }
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { name, email, passwordHash, role: "ADMIN" },
    });
    console.log(`[seed] Created admin user: ${email}`);
    if (!process.env.ADMIN_PASSWORD) {
      console.warn(
        `[seed] Using the default password — set ADMIN_PASSWORD and re-run before deploying anywhere real.`
      );
    }
  }

  console.log("[seed] Running initial asset sync...");
  const summary = await syncAssetsToDatabase();
  console.log(
    `[seed] Synced ${summary.createdProducts} new product(s), ${summary.scannedCategories} categories scanned.`
  );
}

main()
  .catch((error) => {
    console.error("[seed] Failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
