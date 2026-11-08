import * as SecureStore from "expo-secure-store";

export type MobileUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  status: string;
  createdAt: string;
};

type AuthResponse = { user: MobileUser; accessToken: string; refreshToken: string };
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
const ACCESS_KEY = "nexchat.access";
const REFRESH_KEY = "nexchat.refresh";

async function request<T>(path: string, body?: unknown, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Could not connect to NEXCHAT API");
  return data as T;
}

async function save(data: AuthResponse) {
  await SecureStore.setItemAsync(ACCESS_KEY, data.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
}

export async function mobileLogin(identifier: string, password: string) {
  const data = await request<AuthResponse>("/auth/login", { identifier, password });
  await save(data);
  return data.user;
}

export async function mobileRegister(input: { username: string; displayName: string; email: string; password: string }) {
  const data = await request<AuthResponse>("/auth/register", input);
  await save(data);
  return data.user;
}

export async function mobileRestoreSession() {
  const access = await SecureStore.getItemAsync(ACCESS_KEY);
  if (access) {
    try {
      const result = await request<{ user: MobileUser }>("/auth/me", undefined, access);
      return result.user;
    } catch {
      // Continue with refresh token rotation.
    }
  }
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  if (!refresh) return null;
  try {
    const data = await request<AuthResponse>("/auth/refresh", { refreshToken: refresh });
    await save(data);
    return data.user;
  } catch {
    await mobileLogout();
    return null;
  }
}

export async function mobileLogout() {
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  try {
    if (refresh) await request("/auth/logout", { refreshToken: refresh });
  } finally {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  }
}
