# Asset sync — where the logic actually lives

This folder previously held three empty placeholder files
(`scanAssets.ts`, `importProducts.ts`, `syncProducts.ts`) — none of
them had any implementation. The real, working asset-to-database sync
system lives in the backend instead:

- `backend/src/utils/descParser.ts` — parses each product's `desc.txt`
  into structured fields (Name, Price, MRP, Fabric, Color, Sizes,
  Description).
- `backend/src/services/assetSync.service.ts` — walks `assets/`,
  upserts Category/Product rows in Postgres, and soft-deactivates
  anything whose folder disappeared.
- `backend/src/utils/assetsWatcher.ts` — watches `assets/` with
  chokidar and re-runs the sync (debounced) whenever something
  changes, so a new folder shows up on the storefront automatically.

You don't need to run anything in this folder manually. The sync runs:
1. Once on every backend startup.
2. Automatically whenever a file/folder under `assets/` changes.
3. On demand from the admin dashboard's "Rescan Assets Now" button
   (calls `POST /api/admin/assets/rescan`).
4. As part of `npm run seed` (`backend/prisma/seed.ts`), useful for a
   fresh local setup.

See the audit report for the full rationale.
