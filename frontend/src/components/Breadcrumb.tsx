"use client";

import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({
  items,
}: BreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
      <Link
        href="/"
        className="hover:text-primary"
      >
        Home
      </Link>

      {items.map(
        (item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            <span>/</span>

            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800">
                {item.label}
              </span>
            )}
          </div>
        )
      )}
    </nav>
  );
}