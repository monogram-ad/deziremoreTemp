export const APP_NAME = "Deziremore";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
  "919999999999";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export const LEAD_POPUP_STORAGE_KEY =
  "deziremore_lead";

export const CART_STORAGE_KEY =
  "deziremore_cart";

export const WISHLIST_STORAGE_KEY =
  "deziremore_wishlist";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;