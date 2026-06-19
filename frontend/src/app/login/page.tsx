"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const result = await login({ email, password });

      // Update the store directly instead of waiting for AuthProvider's
      // one-time mount effect to re-run (it won't, on a client-side
      // navigation) — without this the rest of the app would keep
      // treating the user as logged out until a hard refresh.
      setUser(result.user);

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <form
        onSubmit={handleLogin}
        className="luxury-card p-8 w-full max-w-md"
      >
        <h1 className="text-4xl font-heading mb-6 text-center">
          Login
        </h1>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border rounded-xl p-3"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-xl p-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-6"
        >
          {loading
            ? "Signing In..."
            : "Login"}
        </button>
      </form>
    </div>
  );
}
