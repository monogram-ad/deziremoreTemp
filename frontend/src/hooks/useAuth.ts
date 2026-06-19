"use client";

import { useAuthStore } from "@/store/authStore";
import { logout as logoutRequest } from "@/lib/auth";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const setUser = useAuthStore((state) => state.setUser);
  const storeLogout = useAuthStore((state) => state.logout);

  // Auth is an httpOnly session cookie set by the backend — there is
  // no token for client JS to read or store. A previous version of
  // this hook checked a `token` field that never existed on the auth
  // store, so `isAuthenticated` was always false even right after a
  // successful login.
  const isAuthenticated = !!user;

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      // Clear local state regardless of whether the network call
      // succeeded — the user clicked logout, the UI should reflect
      // that immediately.
      storeLogout();
    }
  }

  return {
    user,
    loading,
    setUser,
    logout,
    isAuthenticated,
  };
}
