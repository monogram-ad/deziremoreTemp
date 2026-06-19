"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    setUser,
    setLoading,
  } = useAuthStore();

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await getCurrentUser();
        setUser(response.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [setUser, setLoading]);

  return <>{children}</>;
}