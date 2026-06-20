import { ApiError, type AnalysisRecord, type AuthResponse } from './types';

/**
 * ───────────────────────────────────────────────────────────────────────
 *  ASSUMPTIONS ABOUT YOUR BACKEND — read this before wiring up the real API
 * ───────────────────────────────────────────────────────────────────────
 * The blueprint you gave me only nails down POST /api/analysis and the
 * AnalysisRecord shape. It doesn't specify the auth routes, so I picked the
 * common Express/Mongoose convention below. Everything that talks to the
 * network lives in this one file — if your real routes differ, you only
 * need to change the paths/shapes in this file, nothing else.
 *
 *   POST   {BASE_URL}/auth/register   { name, email, password } -> AuthResponse
 *   POST   {BASE_URL}/auth/login      { email, password }       -> AuthResponse
 *   POST   {BASE_URL}/analysis        { targetUrl }              -> AnalysisRecord   (Bearer token required)
 *   GET    {BASE_URL}/analysis/:id    -> AnalysisRecord           (Bearer token required, optional — used to
 *                                                                  restore the results page on refresh)
 *
 * Auth is assumed to be a JWT returned in the response body, sent back as
 * `Authorization: Bearer <token>`. If your backend uses an http-only
 * session cookie instead, swap the Authorization header below for
 * `credentials: 'include'` and drop the token plumbing in auth store.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://ai-trust-assistant.onrender.com';

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(
      'Could not reach the server. Check that the backend is running and the address is correct.',
      0
    );
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (payload && (payload.message || payload.error)) ||
      `The server returned an unexpected error (${res.status}).`;
    throw new ApiError(message, res.status);
  }

  return payload as T;
}

export const api = {
  register(name: string, email: string, password: string) {
    return request<AuthResponse>('/auth/register', { method: 'POST', body: { name, email, password } });
  },

  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
  },

  analyze(targetUrl: string, token: string) {
    return request<AnalysisRecord>('/analysis', { method: 'POST', body: { targetUrl }, token });
  },

  getAnalysis(id: string, token: string) {
    return request<AnalysisRecord>(`/analysis/${id}`, { token });
  }
};
