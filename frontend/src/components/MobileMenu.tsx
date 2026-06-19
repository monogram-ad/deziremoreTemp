"use client";

import Link from "next/link";
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { categories } = useCategories();
  const { isAuthenticated, logout } = useAuth();

  const close = () => setOpen(false);

  return (
    <>
      <button className="md:hidden" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={close} />

          <div className="fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-xl p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-heading">Menu</h2>
              <button onClick={close}>✕</button>
            </div>

            <nav className="flex flex-col gap-5">
              <Link href="/" onClick={close}>
                Home
              </Link>

              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/category/${category}`}
                  onClick={close}
                  className="capitalize"
                >
                  {category.replaceAll("-", " ")}
                </Link>
              ))}

              <Link href="/wishlist" onClick={close}>
                Wishlist
              </Link>

              <Link href="/cart" onClick={close}>
                Cart
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={close}>
                    My Profile
                  </Link>
                  <Link href="/orders" onClick={close}>
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      close();
                    }}
                    className="text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={close}>
                  Login
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
