export const API_BASE_URL = 'https://www.omapi.ciprabemananjara.mg';
export const API_TOKEN_KEY = 'omapi_api_token';
export const API_USER_KEY = 'omapi_api_user';

export interface ApiAuthUser {
  id: number | string;
  name: string;
  email: string;
  role: 'Admin' | 'Éditeur';
  status?: 'Actif' | 'Inactif';
  avatar?: string | null;
}

export function getApiToken(): string | null {
  return sessionStorage.getItem(API_TOKEN_KEY);
}

export function saveApiSession(token: string, user: ApiAuthUser): void {
  // Keep the bearer token tab-scoped; localStorage only carries non-secret display metadata.
  sessionStorage.setItem(API_TOKEN_KEY, token);
  sessionStorage.setItem(API_USER_KEY, JSON.stringify(user));
  localStorage.setItem('omapi_user_id', String(user.id));
  localStorage.setItem('omapi_user_name', user.name);
  localStorage.setItem('omapi_user_email', user.email);
  localStorage.setItem('omapi_user_role', user.role);
}

export function clearApiSession(): void {
  sessionStorage.removeItem(API_TOKEN_KEY);
  sessionStorage.removeItem(API_USER_KEY);
  localStorage.removeItem('omapi_user_id');
  localStorage.removeItem('omapi_user_name');
  localStorage.removeItem('omapi_user_email');
  localStorage.removeItem('omapi_user_role');
}

export async function apiRequest(
  path: string,
  init: RequestInit = {},
  token: string | null = getApiToken(),
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const method = String(init.method || 'GET').toUpperCase();
  const isApiWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const isLogMaintenance = path.startsWith('/api/admin/activity-logs') || path.startsWith('/api/admin/notification-reads');
  const isAuthenticatedAdminWrite = path.startsWith('/api/admin/') || path === '/api/auth/profile';
  if (response.ok && isApiWrite && isAuthenticatedAdminWrite && !isLogMaintenance && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('omapi-api-activity-written'));
  }
  return response;
}
