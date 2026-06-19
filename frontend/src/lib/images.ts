import { API_URL } from "./constants";

/**
 * Product photos are served by the Express backend's /assets static
 * route, not by Next.js. `assetPath` (e.g. "/assets/sarees/red-silk-saree")
 * is a path on the BACKEND's origin — building it as a bare relative
 * URL (just `${assetPath}/${file}`) resolves against the Next.js
 * frontend's own origin instead and 404s. Always go through this
 * helper instead of concatenating assetPath by hand.
 */
export function getProductImageUrl(assetPath: string, filename: string): string {
  return `${API_URL}${assetPath}/${filename}`;
}

export function getProductThumbnail(product: { assetPath: string; images: string[] }): string {
  const [first] = product.images;
  return first ? getProductImageUrl(product.assetPath, first) : "/placeholder-product.svg";
}
