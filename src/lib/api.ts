import type {
  AnalyticsData,
  Category,
  DashboardStats,
  MenuItem,
  Reservation,
  Restaurant,
  SafeUser,
  Table,
} from "./types";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "error" in data && String((data as Record<string, unknown>).error)) ||
      "İstek başarısız oldu";
    throw new Error(msg);
  }
  return data as T;
}

// ---- Auth ----
export const api = {
  me: () => request<{ user: SafeUser | null }>("/api/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: SafeUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ user: SafeUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  logout: () =>
    request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  forgotPassword: (email: string) =>
    request<{ ok: boolean; devToken?: string; devNote?: string }>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    ),
  verifyResetToken: (token: string) =>
    request<{ valid: boolean; email?: string }>(
      `/api/auth/reset-password?token=${encodeURIComponent(token)}`
    ),
  resetPassword: (token: string, password: string) =>
    request<{ ok: boolean }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  seed: () =>
    request<{ ok: boolean; restaurant: { slug: string } }>("/api/seed", {
      method: "POST",
    }),

  // ---- Restaurants ----
  listRestaurants: () =>
    request<{ restaurants: (Restaurant & { _count: { menuItems: number; tables: number; reservations: number } })[] }>(
      "/api/restaurants"
    ),
  createRestaurant: (data: Partial<Restaurant>) =>
    request<{ restaurant: Restaurant }>("/api/restaurants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getRestaurant: (id: string) =>
    request<{ restaurant: Restaurant }>(`/api/restaurants/${id}`),
  updateRestaurant: (id: string, data: Partial<Restaurant>) =>
    request<{ restaurant: Restaurant }>(`/api/restaurants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteRestaurant: (id: string) =>
    request<{ ok: boolean }>(`/api/restaurants/${id}`, {
      method: "DELETE",
    }),

  // ---- Categories ----
  listCategories: (restaurantId: string) =>
    request<{ categories: Category[] }>(
      `/api/categories?restaurantId=${restaurantId}`
    ),
  createCategory: (data: { restaurantId: string; name: string; description?: string; sortOrder?: number }) =>
    request<{ category: Category }>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<Category>) =>
    request<{ category: Category }>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<{ ok: boolean }>(`/api/categories/${id}`, { method: "DELETE" }),

  // ---- Menu Items ----
  listMenuItems: (restaurantId: string) =>
    request<{ items: MenuItem[] }>(
      `/api/menu-items?restaurantId=${restaurantId}`
    ),
  createMenuItem: (data: Record<string, unknown>) =>
    request<{ item: MenuItem }>("/api/menu-items", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateMenuItem: (id: string, data: Record<string, unknown>) =>
    request<{ item: MenuItem }>(`/api/menu-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteMenuItem: (id: string) =>
    request<{ ok: boolean }>(`/api/menu-items/${id}`, { method: "DELETE" }),

  // ---- Tables ----
  listTables: (restaurantId: string) =>
    request<{ tables: Table[] }>(`/api/tables?restaurantId=${restaurantId}`),
  createTable: (data: Record<string, unknown>) =>
    request<{ table: Table }>("/api/tables", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTable: (id: string, data: Record<string, unknown>) =>
    request<{ table: Table }>(`/api/tables/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTable: (id: string) =>
    request<{ ok: boolean }>(`/api/tables/${id}`, { method: "DELETE" }),

  // ---- Reservations ----
  listReservations: (restaurantId: string, filters?: { status?: string; date?: string }) => {
    const params = new URLSearchParams({ restaurantId });
    if (filters?.status) params.set("status", filters.status);
    if (filters?.date) params.set("date", filters.date);
    return request<{ reservations: Reservation[] }>(
      `/api/reservations?${params.toString()}`
    );
  },
  createReservation: (data: Record<string, unknown>) =>
    request<{ reservation: Reservation }>("/api/reservations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateReservation: (id: string, data: Record<string, unknown>) =>
    request<{ reservation: Reservation }>(`/api/reservations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteReservation: (id: string) =>
    request<{ ok: boolean }>(`/api/reservations/${id}`, { method: "DELETE" }),

  // ---- Dashboard ----
  dashboard: (restaurantId: string) =>
    request<DashboardStats>(`/api/dashboard?restaurantId=${restaurantId}`),

  // ---- Analytics ----
  analytics: (restaurantId: string) =>
    request<AnalyticsData>(`/api/analytics?restaurantId=${restaurantId}`),

  // ---- Public ----
  publicRestaurant: (slug: string) =>
    request<{ restaurant: Restaurant & { categories: Category[]; menuItems: MenuItem[]; tables: Table[] } }>(
      `/api/public/restaurants/${slug}`
    ),
  publicReservation: (data: Record<string, unknown>) =>
    request<{ reservation: Reservation }>("/api/public/reservations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
