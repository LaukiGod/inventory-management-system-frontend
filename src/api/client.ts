// Use the environment variable for production, or fall back to /api for dev (which uses the Vite proxy)
const BASE = import.meta.env.VITE_API_URL || '/api'

function getToken(): string | null {
  return localStorage.getItem('access_token')
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  // Handle file downloads
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/vnd') || contentType.includes('text/csv')) {
    if (!res.ok) throw new Error('Export failed')
    return res.blob() as unknown as T
  }

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? 'Something went wrong')
  }

  return data as T
}

// ── Auth ──────────────────────────────────────────────────
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; refresh_token: string; user: User }>(
        '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // ── Users ─────────────────────────────────────────────
  users: {
    me: () => request<User>('/users/me'),
    list: () => request<User[]>('/users'),
    create: (body: { email: string; name: string; password: string; role: string }) =>
      request<User>('/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<{ name: string; role: string }>) =>
      request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    setActive: (id: string, is_active: boolean) =>
      request<User>(`/users/${id}/deactivate`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
    resetPassword: (id: string, new_password: string) =>
      request(`/users/${id}/reset-password`, { method: 'PATCH', body: JSON.stringify({ new_password }) }),
    changePassword: (new_password: string) =>
      request('/users/me/password', { method: 'PATCH', body: JSON.stringify({ new_password }) }),
  },

  // ── Categories ───────────────────────────────────────
  categories: {
    list: () => request<Category[]>('/categories'),
    create: (name: string) =>
      request<Category>('/categories', { method: 'POST', body: JSON.stringify({ name }) }),
    update: (id: string, name: string) =>
      request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),
    delete: (id: string) => request(`/categories/${id}`, { method: 'DELETE' }),
  },

  // ── Items ────────────────────────────────────────────
  items: {
    list: (params?: { search?: string; category_id?: string }) => {
      const q = new URLSearchParams()
      if (params?.search) q.set('search', params.search)
      if (params?.category_id) q.set('category_id', params.category_id)
      return request<StockItem[]>(`/items${q.toString() ? `?${q}` : ''}`)
    },
    get: (id: string) => request<StockItem>(`/items/${id}`),
    create: (form: FormData) =>
      request<StockItem>('/items', { method: 'POST', body: form }),
    update: (id: string, form: FormData) =>
      request<StockItem>(`/items/${id}`, { method: 'PATCH', body: form }),
    delete: (id: string) => request(`/items/${id}`, { method: 'DELETE' }),
  },

  // ── Logs ─────────────────────────────────────────────
  logs: {
    today: () => request<StockLog[]>('/logs?date=today'),
    range: (from: string, to: string, item_id?: string, staff_id?: string) => {
      const q = new URLSearchParams({ from, to })
      if (item_id) q.set('item_id', item_id)
      if (staff_id) q.set('staff_id', staff_id)
      return request<StockLog[]>(`/logs?${q}`)
    },
    add: (itemId: string, body: { type: 'RECEIVED' | 'CONSUMED'; quantity: number; note?: string }) =>
      request<{ message: string; new_qty: number }>(
        `/items/${itemId}/log`, { method: 'POST', body: JSON.stringify(body) }
      ),
  },

  // ── Dashboard ────────────────────────────────────────
  dashboard: {
    summary: () => request<{ total_items: number; low_stock_count: number; today_updates: number }>('/dashboard/summary'),
    lowStock: () => request<StockItem[]>('/dashboard/low-stock'),
    chart: (days = 7) => request<ChartPoint[]>(`/dashboard/chart?days=${days}`),
  },

  // ── Export ───────────────────────────────────────────
  export: {
    excel: (from: string, to: string) =>
      request<Blob>(`/export/excel?from=${from}&to=${to}`),
    csv: (from: string, to: string) =>
      request<Blob>(`/export/csv?from=${from}&to=${to}`),
  },

  // ── Upload ───────────────────────────────────────────
  upload: {
    image: (file: File) => {
      const form = new FormData()
      form.append('image', file)
      return request<{ url: string }>('/upload/image', { method: 'POST', body: form })
    },
  },
}

// ── Types ─────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'STAFF'
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface StockItem {
  id: string
  name: string
  image_url: string | null
  current_qty: number
  low_stock_threshold: number
  created_at: string
  category: { id: string; name: string } | null
  created_by_user?: { id: string; name: string } | null
}

export interface StockLog {
  id: string
  type: 'RECEIVED' | 'CONSUMED'
  quantity: number
  note: string | null
  created_at: string
  stock_item: { id: string; name: string; image_url?: string | null } | null
  user: { id: string; name: string } | null
}

export interface ChartPoint {
  date: string
  received: number
  consumed: number
}
