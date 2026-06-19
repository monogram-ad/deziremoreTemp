"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/productLoader";

/**
 * Single source of truth for "what categories exist right now" on the
 * frontend. Previously the primary nav (Navbar/MobileMenu) hardcoded a
 * short list of category links while only the homepage's CategoryGrid
 * actually called the API — so a brand-new assets/<category>/ folder
 * was reachable by URL but invisible in navigation. Everything that
 * needs the category list should use this hook instead of hardcoding
 * one.
 */
export function useCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading };
}
