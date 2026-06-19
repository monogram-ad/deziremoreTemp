import { apiGet, apiPost, apiPut } from "./api";
import { LoginResponse, RegisterResponse, MeResponse, User } from "@/types/User";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export async function login(payload: LoginPayload) {
  return apiPost<LoginResponse>("/api/auth/login", payload);
}

export async function register(payload: RegisterPayload) {
  return apiPost<RegisterResponse>("/api/auth/register", payload);
}

export async function getCurrentUser() {
  return apiGet<MeResponse>("/api/auth/me");
}

export async function logout() {
  return apiPost<{ success: boolean; message: string }>("/api/auth/logout", {});
}

export async function updateProfile(data: { name?: string; phone?: string }) {
  return apiPut<{ success: boolean; user: User }>("/api/auth/me", data);
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiPut<{ success: boolean; message: string }>("/api/auth/me/password", data);
}
