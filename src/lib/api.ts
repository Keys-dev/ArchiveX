// API client for communicating with the ArchiveX backend

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Token management
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('auth_token');
}

// Helper for authenticated requests
async function authFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge any additional headers from options
  if (options.headers) {
    const optsHeaders = options.headers as Record<string, string>;
    Object.assign(headers, optsHeaders);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response;
}

// --- Auth API ---

export interface ApiUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Registration failed' }));
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

export async function logout(): Promise<void> {
  clearToken();
}

export async function getCurrentUser(): Promise<ApiUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/items`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      clearToken();
      return null;
    }

    // We don't have a /api/auth/me endpoint, so we store user info in localStorage
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    clearToken();
    return null;
  }
}

export function setCurrentUser(user: ApiUser): void {
  localStorage.setItem('auth_user', JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem('auth_user');
}

// --- Items API ---

export interface ApiItem {
  id: string;
  userId: string;
  name: string;
  type: string;
  location: string;
  category: string | null;
  notes: string | null;
  dateAdded: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDto {
  name: string;
  type: string;
  location: string;
  category?: string;
  notes?: string;
  dateAdded?: string;
}

export interface UpdateItemDto {
  name?: string;
  type?: string;
  location?: string;
  category?: string;
  notes?: string;
  dateAdded?: string;
}

export interface ItemsQuery {
  search?: string;
  searchType?: 'all' | 'name' | 'location';
  type?: string;
  category?: string;
  sort?: string;
}

export async function getItems(query?: ItemsQuery): Promise<ApiItem[]> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  const endpoint = params.toString() ? `/items?${params}` : '/items';
  const response = await authFetch(endpoint);
  return response.json();
}

export async function getItem(id: string): Promise<ApiItem> {
  const response = await authFetch(`/items/${id}`);
  return response.json();
}

export async function createItem(data: CreateItemDto): Promise<ApiItem> {
  const response = await authFetch('/items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateItem(id: string, data: UpdateItemDto): Promise<ApiItem> {
  const response = await authFetch(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteItem(id: string): Promise<void> {
  await authFetch(`/items/${id}`, {
    method: 'DELETE',
  });
}
