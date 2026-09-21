import { ApiResponse } from '@/types/api';

const DEFAULT_BASE_URL = 'https://learn.smktelkom-mlg.sch.id/coworking';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('custom_api_base_url');
    if (savedUrl) return savedUrl.replace(/\/+$/, '');
  }
  return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

export function getMakerKey(): string {
  if (typeof window !== 'undefined') {
    const savedKey = localStorage.getItem('custom_maker_key');
    if (savedKey !== null) return savedKey;
  }
  return process.env.NEXT_PUBLIC_MAKER_KEY || '';
}

export function isExplicitDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('ssb_explicit_demo_mode') === 'true';
}

export function setExplicitDemoMode(val: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ssb_explicit_demo_mode', val ? 'true' : 'false');
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || null;
}

export function setAuthToken(token: string, remember: boolean = true): void {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem('auth_token', token);
  } else {
    sessionStorage.setItem('auth_token', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
}

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  timeoutMs?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const makerKey = getMakerKey();
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Official Maker Key header
  if (makerKey) {
    headers['x-maker-key'] = makerKey;
    headers['x-app-key'] = makerKey;
  }

  // Official JWT Auth header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const timeoutMs = options.timeoutMs || 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message || data?.error || `Request gagal dengan status ${response.status} (${response.statusText})`;
      return {
        status: false,
        statusCode: response.status,
        message: errorMessage,
        error: data?.error || response.statusText,
        data: (data?.data ?? null) as T,
      };
    }

    return {
      status: true,
      statusCode: response.status,
      message: data?.message || 'Berhasil',
      data: (data?.data ?? data) as T,
      timestamp: data?.timestamp,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as Error;
    const isAbort = error.name === 'AbortError';
    const message = isAbort
      ? 'Koneksi ke server API timeout (waktu habis).'
      : `Gagal terhubung ke API server: ${error.message || 'Network Error'}`;

    return {
      status: false,
      statusCode: isAbort ? 408 : 503,
      message,
      error: error.message,
      data: null as unknown as T,
    };
  }
}
