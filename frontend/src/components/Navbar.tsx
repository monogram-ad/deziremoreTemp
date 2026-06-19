"use client";

import Link from "next/link";

import MobileMenu from "./MobileMenu";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";

export default function Navbar() {
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { categories } = useCategories();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <MobileMenu />

            <Link href="/" className="text-3xl font-heading text-primary">
              Deziremore
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/">Home</Link>
            <Link href="/search">Search</Link>

            {/* Reflects assets/ in real time — a new category folder
                shows up here automatically once the asset-sync picks
                it up, no code change or redeploy needed. */}
            {categories.map((category) => (
              <Link key={category} href={`/category/${category}`} className="capitalize">
                {category.replaceAll("-", " ")}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/wishlist">♥ {wishlistCount}</Link>
            <Link href="/cart">Cart ({totalItems})</Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/profile">{user?.name?.split(" ")[0] || "Account"}</Link>
                {user?.role === "ADMIN" && (
                  <Link href="/admin" className="text-primary">
                    Admin
                  </Link>
                )}
                <button onClick={logout} className="text-sm text-gray-500 underline">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
