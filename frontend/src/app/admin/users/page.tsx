"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import { getAdminUsers, updateUserRole, PaginatedAdminUsers } from "@/lib/admin";

function AdminUsersPage() {
  const [data, setData] = useState<PaginatedAdminUsers | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function load() {
    getAdminUsers()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"));
  }

  useEffect(load, []);

  async function handleRoleToggle(userId: string, currentRole: string) {
    setUpdatingId(userId);
    setError(null);
    try {
      await updateUserRole(userId, currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="container-custom py-16">
      <h1 className="text-5xl font-heading mb-8">Users</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="luxury-card overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Role</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user._count.orders}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleRoleToggle(user.id, user.role)}
                    disabled={updatingId === user.id}
                    className="text-sm underline"
                  >
                    {user.role === "ADMIN" ? "Demote to Customer" : "Promote to Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AdminGuard>
      <AdminUsersPage />
    </AdminGuard>
  );
}
