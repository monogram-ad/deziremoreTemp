import path from "path";
import chokidar, { FSWatcher } from "chokidar";

import { syncAssetsToDatabase } from "../services/assetSync.service";
import { ASSETS_ROOT } from "../config/paths";

const DEBOUNCE_MS = 800;

let watcher: FSWatcher | null = null;
let debounceTimer: NodeJS.Timeout | null = null;

function scheduleSync(reason: string) {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    console.log(`[AssetsWatcher] Change detected (${reason}) — syncing...`);

    syncAssetsToDatabase()
      .then((summary) => {
        console.log(
          `[AssetsWatcher] Sync complete in ${summary.durationMs}ms — ` +
            `created: ${summary.createdProducts}, updated: ${summary.updatedProducts}, ` +
            `deactivated: ${summary.deactivatedProducts}, skipped: ${summary.skipped.length}`
        );
        if (summary.warnings.length) {
          console.warn(
            `[AssetsWatcher] ${summary.warnings.length} warning(s):`,
            summary.warnings
          );
        }
      })
      .catch((error) => {
        console.error("[AssetsWatcher] Sync failed:", error);
      });
  }, DEBOUNCE_MS);
}

/** Watches the assets/ tree and re-syncs the database whenever a folder
 *  is added, edited, or removed. Adding a brand-new category/product
 *  folder under assets/ is picked up automatically — no restart, no
 *  manual admin action required. Debounced so copying in a batch of
 *  images for one product triggers a single sync, not one per file. */
export function startAssetsWatcher() {
  if (watcher) return; // already running

  watcher = chokidar.watch(ASSETS_ROOT, {
    ignoreInitial: true, // the initial catalog load is handled separately
    ignored: (filePath) => path.basename(filePath).startsWith("."),
    depth: 3, // category/product/file is the deepest we expect
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  watcher
    .on("add", (filePath) => scheduleSync(`added ${path.relative(ASSETS_ROOT, filePath)}`))
    .on("change", (filePath) => scheduleSync(`changed ${path.relative(ASSETS_ROOT, filePath)}`))
    .on("unlink", (filePath) => scheduleSync(`removed ${path.relative(ASSETS_ROOT, filePath)}`))
    .on("addDir", (dirPath) => scheduleSync(`new folder ${path.relative(ASSETS_ROOT, dirPath)}`))
    .on("unlinkDir", (dirPath) => scheduleSync(`removed folder ${path.relative(ASSETS_ROOT, dirPath)}`))
    .on("error", (error) => console.error("[AssetsWatcher] Watcher error:", error));

  console.log(`[AssetsWatcher] Watching ${ASSETS_ROOT} for changes...`);
}

export async function stopAssetsWatcher() {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (watcher) {
    await watcher.close();
    watcher = null;
  }
}
