export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "ADMIN" | "CUSTOMER";
  createdAt?: string;
}

/**
 * Auth is session-cookie based (the backend sets an httpOnly cookie on
 * login/register) — there is no JWT in the response body for client
 * code to read or store. A `token` field here previously didn't match
 * what the API actually returns, which fed a downstream bug where
 * `isAuthenticated` could never become true (see hooks/useAuth.ts).
 */
export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  user: User;
}

export interface MeResponse {
  success: boolean;
  user: User | null;
}
