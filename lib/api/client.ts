const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAccessTokenCookie(token: string, maxAgeSeconds = 900) {
  if (typeof document === 'undefined') return;
  document.cookie = `access_token=${encodeURIComponent(token)};path=/;max-age=${maxAgeSeconds};SameSite=Lax`;
}

export function clearAccessTokenCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=;path=/;max-age=0';
}

async function tryRefresh(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('auth_refresh');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessTokenCookie(data.accessToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, { ...options, headers });
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = getAccessToken();
  let res = await request<T>(path, options, token);

  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      res = await request<T>(path, options, newToken);
    }
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (Array.isArray(data?.message) ? data.message[0] : data?.message) ?? 'Error en la solicitud';
    throw new ApiError(res.status, message);
  }

  return data as T;
}
