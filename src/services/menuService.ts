/**
 * MenuService — category + menu item CRUD + drag/drop reordering.
 */
import { api } from "@/lib/api";
import type { Category, MenuItem } from "@/lib/types";

export const menuService = {
  // ---- Categories ----
  /** List categories for a restaurant. */
  listCategories: (restaurantId: string) => api.listCategories(restaurantId),

  /** Create a category. */
  createCategory: (data: {
    restaurantId: string;
    name: string;
    description?: string;
    sortOrder?: number;
  }) => api.createCategory(data),

  /** Update a category. */
  updateCategory: (id: string, data: Partial<Category>) =>
    api.updateCategory(id, data),

  /** Delete a category. */
  deleteCategory: (id: string) => api.deleteCategory(id),

  /** Reorder categories (drag/drop). */
  reorderCategories: (restaurantId: string, orderedIds: string[]) =>
    api.reorderCategories(restaurantId, orderedIds),

  // ---- Menu Items ----
  /** List menu items for a restaurant. */
  listItems: (restaurantId: string) => api.listMenuItems(restaurantId),

  /** Create a menu item. */
  createItem: (data: Record<string, unknown>) => api.createMenuItem(data),

  /** Update a menu item. */
  updateItem: (id: string, data: Record<string, unknown>) =>
    api.updateMenuItem(id, data),

  /** Toggle item availability (Aktif/Pasif). */
  toggleAvailable: (id: string, isAvailable: boolean) =>
    api.updateMenuItem(id, { isAvailable }),

  /** Toggle item featured. */
  toggleFeatured: (id: string, isFeatured: boolean) =>
    api.updateMenuItem(id, { isFeatured }),

  /** Delete a menu item. */
  deleteItem: (id: string) => api.deleteMenuItem(id),
};

export type { Category, MenuItem };
