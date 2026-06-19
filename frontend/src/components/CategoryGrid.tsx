"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";

export default function CategoryGrid() {
  const { categories } = useCategories();

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-heading">Shop By Category</h2>
          <p className="text-gray-600 mt-4">Explore our premium collections</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className="group luxury-card overflow-hidden"
            >
              <div className="h-80 flex items-center justify-center bg-gray-100">
                <span className="text-3xl font-heading capitalize">
                  {category.replaceAll("-", " ")}
                </span>
              </div>

              <div className="p-6 text-center">
                <h3 className="text-3xl font-heading capitalize">
                  {category.replaceAll("-", " ")}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
