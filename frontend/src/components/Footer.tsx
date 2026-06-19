"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

export default function Footer() {
  const { categories } = useCategories();

  return (
    <footer className="bg-darkGreen text-white mt-20">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-3xl font-heading mb-4">
              Deziremore
            </h3>

            <p className="text-sm opacity-80">
              Premium ethnic fashion crafted for
              elegance, celebrations, and timeless
              style.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Categories
            </h4>

            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <Link href={`/category/${category}`} className="capitalize">
                    {category.replaceAll("-", " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Account
            </h4>

            <ul className="space-y-2">
              <li>
                <Link href="/login">Login</Link>
              </li>

              <li>
                <Link href="/signup">Register</Link>
              </li>

              <li>
                <Link href="/wishlist">
                  Wishlist
                </Link>
              </li>

              <li>
                <Link href="/cart">Cart</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Contact
            </h4>

            <p>Email: support@deziremore.com</p>

            <p className="mt-2">
              WhatsApp Ordering Available
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 text-center text-sm">
          © {new Date().getFullYear()} Deziremore.
          All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}