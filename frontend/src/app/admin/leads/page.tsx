"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { getAdminLeads, PaginatedAdminLeads } from "@/lib/admin";

function AdminLeadsPage() {
  const [data, setData] = useState<PaginatedAdminLeads | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminLeads()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leads"));
  }, []);

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading mb-8">Leads</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="luxury-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {data?.leads.map((lead) => (
              <tr key={lead.id} className="border-t">
                <td className="p-4">{lead.email || "—"}</td>
                <td className="p-4">{lead.phone || "—"}</td>
                <td className="p-4">{new Date(lead.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.leads.length === 0 && (
          <p className="p-4 text-gray-500">No leads collected yet.</p>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminLeadsPage />
    </AdminGuard>
  );
}
