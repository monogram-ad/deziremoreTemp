import fs from "fs";
import path from "path";
import crypto from "crypto";

import prisma from "../lib/prisma";
import { parseProductDesc } from "../utils/descParser";
import { ASSETS_ROOT } from "../config/paths";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const DESC_FILENAME = "desc.txt";

export interface SyncSummary {
  scannedCategories: number;
  scannedProducts: number;
  createdProducts: number;
  updatedProducts: number;
  unchangedProducts: number;
  deactivatedProducts: number;
  deactivatedCategories: number;
  skipped: { folder: string; reason: string }[];
  warnings: string[];
  durationMs: number;
}

let syncInFlight: Promise<SyncSummary> | null = null;

/** Scans ASSETS_ROOT and upserts Category/Product rows to match it.
 *  Safe to call repeatedly (idempotent) and safe to call concurrently
 *  (concurrent callers receive the same in-flight result rather than
 *  triggering overlapping scans). */
export async function syncAssetsToDatabase(): Promise<SyncSummary> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = runSync().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

async function runSync(): Promise<SyncSummary> {
  const startedAt = Date.now();

  const summary: SyncSummary = {
    scannedCategories: 0,
    scannedProducts: 0,
    createdProducts: 0,
    updatedProducts: 0,
    unchangedProducts: 0,
    deactivatedProducts: 0,
    deactivatedCategories: 0,
    skipped: [],
    warnings: [],
    durationMs: 0,
  };

  if (!fs.existsSync(ASSETS_ROOT)) {
    summary.warnings.push(
      `Assets directory not found at ${ASSETS_ROOT}. Nothing to sync.`
    );
    summary.durationMs = Date.now() - startedAt;
    return summary;
  }

  const seenCategorySlugs = new Set<string>();
  const seenProductSlugs = new Set<string>();

  const categoryFolders = listDirectories(ASSETS_ROOT);

  for (const categoryFolder of categoryFolders) {
    const categorySlug = slugify(categoryFolder);
    const categoryName = titleCase(categoryFolder);
    const categoryPath = path.join(ASSETS_ROOT, categoryFolder);

    seenCategorySlugs.add(categorySlug);
    summary.scannedCategories++;

    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      create: { slug: categorySlug, name: categoryName, isActive: true },
      update: { name: categoryName, isActive: true },
    });

    const productFolders = listDirectories(categoryPath);

    for (const productFolder of productFolders) {
      summary.scannedProducts++;

      const productPath = path.join(categoryPath, productFolder);
      const descPath = path.join(productPath, DESC_FILENAME);

      if (!fs.existsSync(descPath)) {
        summary.skipped.push({
          folder: `${categoryFolder}/${productFolder}`,
          reason: `Missing ${DESC_FILENAME}`,
        });
        continue;
      }

      const rawDesc = fs.readFileSync(descPath, "utf-8");
      const parsed = parseProductDesc(rawDesc);

      if (parsed.warnings.length) {
        for (const warning of parsed.warnings) {
          summary.warnings.push(
            `${categoryFolder}/${productFolder}: ${warning}`
          );
        }
      }

      if (parsed.price === null) {
        summary.skipped.push({
          folder: `${categoryFolder}/${productFolder}`,
          reason: "No valid Price found in desc.txt — refusing to publish a product with no price.",
        });
        continue;
      }

      const images = listImages(productPath);
      if (images.length === 0) {
        summary.skipped.push({
          folder: `${categoryFolder}/${productFolder}`,
          reason: "No product images found.",
        });
        continue;
      }

      let slug = slugify(productFolder);

      // Defend against two different folders independently producing the
      // same slug (slug is globally unique). The second one we encounter
      // in this pass gets a category-prefixed slug instead of clobbering
      // the first or crashing the whole sync.
      if (seenProductSlugs.has(slug)) {
        const disambiguated = `${categorySlug}-${slug}`;
        summary.warnings.push(
          `Slug collision for "${slug}" (${categoryFolder}/${productFolder}) — using "${disambiguated}" instead.`
        );
        slug = disambiguated;
      }
      seenProductSlugs.add(slug);

      const name = parsed.name || titleCase(productFolder);
      const assetPath = `/assets/${categoryFolder}/${productFolder}`;

      const contentHash = hashProduct(rawDesc, images);

      const existing = await prisma.product.findUnique({ where: { slug } });

      if (existing && existing.contentHash === contentHash && existing.isActive) {
        // Nothing changed since the last scan — just keep the heartbeat
        // fresh without touching anything else.
        await prisma.product.update({
          where: { slug },
          data: { lastSyncedAt: new Date() },
        });
        summary.unchangedProducts++;
        continue;
      }

      await prisma.product.upsert({
        where: { slug },
        create: {
          slug,
          name,
          description: parsed.description,
          price: parsed.price,
          mrp: parsed.mrp,
          fabric: parsed.fabric,
          color: parsed.color,
          sizes: parsed.sizes,
          images,
          assetPath,
          categoryId: category.id,
          isActive: true,
          contentHash,
          lastSyncedAt: new Date(),
        },
        update: {
          name,
          description: parsed.description,
          price: parsed.price,
          mrp: parsed.mrp,
          fabric: parsed.fabric,
          color: parsed.color,
          sizes: parsed.sizes,
          images,
          assetPath,
          categoryId: category.id,
          isActive: true,
          contentHash,
          lastSyncedAt: new Date(),
        },
      });

      if (existing) {
        summary.updatedProducts++;
      } else {
        summary.createdProducts++;
      }
    }
  }

  // Anything previously active but not seen in this pass has had its
  // folder removed/renamed — soft-deactivate rather than delete so order
  // history, cart rows, etc. never dangle on a hard FK violation.
  const deactivatedProducts = await prisma.product.updateMany({
    where: {
      isActive: true,
      slug: { notIn: Array.from(seenProductSlugs) },
    },
    data: { isActive: false },
  });
  summary.deactivatedProducts = deactivatedProducts.count;

  const deactivatedCategories = await prisma.category.updateMany({
    where: {
      isActive: true,
      slug: { notIn: Array.from(seenCategorySlugs) },
    },
    data: { isActive: false },
  });
  summary.deactivatedCategories = deactivatedCategories.count;

  // If a whole category folder disappeared, deactivate its products too
  // even though their own folders technically still match nothing (they
  // were already caught above by slug, this just guards against a
  // category being removed while a product row still says isActive for
  // some other reason, e.g. a partial previous failure).
  if (deactivatedCategories.count > 0) {
    await prisma.product.updateMany({
      where: {
        isActive: true,
        category: { isActive: false },
      },
      data: { isActive: false },
    });
  }

  summary.durationMs = Date.now() - startedAt;
  return summary;
}

function listDirectories(parent: string): string[] {
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

function listImages(productPath: string): string[] {
  return fs
    .readdirSync(productPath, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    )
    .map((entry) => entry.name)
    .sort((a, b) => {
      // Numeric-aware sort so 1.jpg, 2.jpg, ..., 10.jpg stays in the
      // intended order instead of lexical (1, 10, 2, ...).
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
}

function hashProduct(rawDesc: string, images: string[]): string {
  return crypto
    .createHash("sha256")
    .update(rawDesc)
    .update(images.join("|"))
    .digest("hex");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(input: string): string {
  return input
    .replace(/[-_]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
