export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  status: string;
  createdAt: string;
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:4000";
const ACCESS_KEY = "nexchat.access";
const REFRESH_KEY = "nexchat.refresh";

export function saveSession(data: AuthResponse) {
  sessionStorage.setItem(ACCESS_KEY, data.accessToken);
  sessionStorage.setItem(REFRESH_KEY, data.refreshToken);
}

export function clearSession() {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_KEY);
}

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
  if (!response.ok) throw new Error(data.message || "Could not connect to NEXCHAT");
  return data as T;
}

export async function registerAccount(input: { username: string; displayName: string; email: string; password: string }) {
  const data = await request<AuthResponse>("/auth/register", input);
  saveSession(data);
  return data.user;
}

export async function loginAccount(identifier: string, password: string) {
  const data = await request<AuthResponse>("/auth/login", { identifier, password });
  saveSession(data);
  return data.user;
}

export async function restoreSession() {
  const accessToken = getAccessToken();
  if (accessToken) {
    try {
      const data = await request<{ user: AuthUser }>("/auth/me", undefined, accessToken);
      return data.user;
    } catch {
      // Try rotating the refresh token below.
    }
  }

  const refreshToken = sessionStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    const data = await request<AuthResponse>("/auth/refresh", { refreshToken });
    saveSession(data);
    return data.user;
  } catch {
    clearSession();
    return null;
  }
}

export async function logoutAccount() {
  const refreshToken = sessionStorage.getItem(REFRESH_KEY);
  try {
    if (refreshToken) await request("/auth/logout", { refreshToken });
  } finally {
    clearSession();
  }
}
