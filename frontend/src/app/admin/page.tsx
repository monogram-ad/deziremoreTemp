"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import { getAdminStats, triggerRescan, AdminStats, RescanSummary } from "@/lib/admin";

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [rescanning, setRescanning] = useState(false);
  const [rescanResult, setRescanResult] = useState<RescanSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.stats))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load stats"));
  }, []);

  async function handleRescan() {
    setRescanning(true);
    setError(null);
    try {
      const res = await triggerRescan();
      setRescanResult(res.summary);
      const updated = await getAdminStats();
      setStats(updated.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rescan failed");
    } finally {
      setRescanning(false);
    }
  }

  const cards = [
    { label: "Products", value: stats?.productCount, href: null },
    { label: "Orders", value: stats?.orderCount, href: "/admin/orders" },
    { label: "Pending Orders", value: stats?.pendingOrders, href: "/admin/orders?status=PENDING" },
    { label: "Users", value: stats?.userCount, href: "/admin/users" },
    { label: "Leads", value: stats?.leadCount, href: "/admin/leads" },
  ];

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading mb-8">Admin Dashboard</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {cards.map((card) => {
          const content = (
            <div className="luxury-card p-6 text-center">
              <p className="text-3xl font-heading">{card.value ?? "—"}</p>
              <p className="text-gray-500 mt-2">{card.label}</p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      <div className="luxury-card p-6">
        <h2 className="text-2xl font-heading mb-2">Asset Sync</h2>
        <p className="text-gray-500 mb-4">
          The catalog stays in sync with the assets/ folder automatically — new folders are
          picked up within a couple of seconds of being added. Use this if you need to force an
          immediate rescan (e.g. right after deploying new asset folders to the server).
        </p>

        <button onClick={handleRescan} disabled={rescanning} className="btn-primary">
          {rescanning ? "Scanning..." : "Rescan Assets Now"}
        </button>

        {rescanResult && (
          <div className="mt-6 text-sm space-y-1">
            <p>Scanned {rescanResult.scannedProducts} product folder(s) in {rescanResult.scannedCategories} categories.</p>
            <p>Created: {rescanResult.createdProducts} · Updated: {rescanResult.updatedProducts} · Unchanged: {rescanResult.unchangedProducts}</p>
            <p>Deactivated: {rescanResult.deactivatedProducts} product(s), {rescanResult.deactivatedCategories} category(ies).</p>
            {rescanResult.skipped.length > 0 && (
              <div className="mt-3">
                <p className="font-medium">Skipped folders:</p>
                <ul className="list-disc pl-5">
                  {rescanResult.skipped.map((s) => (
                    <li key={s.folder}>
                      {s.folder} — {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
