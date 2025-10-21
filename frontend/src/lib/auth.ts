const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setUser(user: any) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    // ignore
  }
}

export function getUser(): any {
  try {
    const v = localStorage.getItem(USER_KEY);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
}

export default { setToken, getToken, clearAuth, setUser, getUser };

// Convenience auth calls that integrate with the API helper
import { request } from './api';

type AuthResponse = {
  token?: string;
  user?: Record<string, unknown> | null;
  [k: string]: unknown;
};

function isAuthResponse(v: unknown): v is AuthResponse {
  if (!v || typeof v !== 'object') return false;
  return 'token' in (v as Record<string, unknown>) || 'user' in (v as Record<string, unknown>);
}

export async function login(email: string, password: string) {
  const res = await request<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } });
  if (isAuthResponse(res) && res.token) {
    setToken(res.token);
    setUser(res.user ?? null);
  }
  return res;
}

export async function register(name: string, email: string, password: string) {
  const res = await request<AuthResponse>('/api/auth/register', { method: 'POST', body: { name, email, password } });
  if (isAuthResponse(res) && res.token) {
    setToken(res.token);
    setUser(res.user ?? null);
  }
  return res;
}

export function logout() {
  clearAuth();
}
