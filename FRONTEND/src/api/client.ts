import { ApiResponse } from '../types/index.ts';

let inMemoryAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (inMemoryAccessToken) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  let res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // sends HTTP-only refresh cookie
  });

  // Handle Token Expiry & Refresh
  if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          inMemoryAccessToken = refreshData.data.accessToken;
          onRefreshed(inMemoryAccessToken);
        } else {
          inMemoryAccessToken = null;
          onRefreshed(null);
        }
      } catch {
        inMemoryAccessToken = null;
        onRefreshed(null);
      } finally {
        isRefreshing = false;
      }
    } else {
      // Wait for refresh
      await new Promise<void>((resolve) => {
        refreshSubscribers.push(() => resolve());
      });
    }

    // Retry original request if token was renewed
    if (inMemoryAccessToken) {
      headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
      res = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = {
      success: false,
      error: { code: 'HTTP_ERROR', message: `Server error (${res.status} ${res.statusText})` },
    };
  }

  return data;
}
