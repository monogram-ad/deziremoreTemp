import path from "path";

/**
 * Repo layout is:
 *   <repoRoot>/
 *     backend/   (this package — src/ in dev, dist/ when built)
 *     frontend/
 *     assets/    <- source of truth for the product catalog
 *
 * This file lives at backend/src/config/paths.ts (or
 * backend/dist/config/paths.js once compiled), so three ".." reaches
 * <repoRoot> in both the dev (tsx, running from src/) and prod
 * (compiled to dist/) layouts. Every module that needs the assets
 * folder should import ASSETS_ROOT from here instead of recomputing
 * its own relative path — that duplication is what caused the asset
 * watcher and file scanner to silently disagree on the directory to
 * watch in the previous implementation.
 */
const REPO_ROOT = path.join(__dirname, "..", "..", "..");

export const ASSETS_ROOT = process.env.ASSETS_DIR || path.join(REPO_ROOT, "assets");
