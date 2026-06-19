"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Client-side gate for /admin/*. This stops the admin UI from
 * rendering for non-admins, but it is NOT the security boundary —
 * every /api/admin/* route independently enforces requireAuth +
 * requireAdmin server-side regardless of what the client does. A
 * determined user could disable JS and still get nothing back from
 * the API. Belt-and-suspenders, not a substitute for the real check.
 */
export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="container-custom py-16">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="container-custom py-16">
        <div className="luxury-card p-8 text-center max-w-md mx-auto">
          <h1 className="text-3xl font-heading mb-4">Admin Access Required</h1>
          <p className="text-gray-500 mb-6">
            You need an admin account to view this page.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
