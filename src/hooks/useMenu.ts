"use client";

/**
 * useMenu — categories + menu items with loading/error/empty states.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "@/services/menuService";
import type { Category } from "@/lib/types";

const CAT_QK = ["categories"];
const ITEM_QK = ["menu-items"];

// ---- Categories ----

export function useCategories(restaurantId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...CAT_QK, restaurantId],
    queryFn: () => menuService.listCategories(restaurantId!),
    enabled: !!restaurantId,
  });

  const categories = data?.categories ?? [];
  return {
    categories,
    isLoading,
    isError,
    error: error as Error | null,
    isEmpty: !isLoading && !isError && categories.length === 0,
    refetch,
  };
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuService.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: CAT_QK }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      menuService.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CAT_QK }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuService.deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAT_QK });
      qc.invalidateQueries({ queryKey: ITEM_QK });
    },
  });
}

export function useReorderCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      restaurantId,
      orderedIds,
    }: {
      restaurantId: string;
      orderedIds: string[];
    }) => menuService.reorderCategories(restaurantId, orderedIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: CAT_QK }),
  });
}

// ---- Menu Items ----

export function useMenuItems(restaurantId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...ITEM_QK, restaurantId],
    queryFn: () => menuService.listItems(restaurantId!),
    enabled: !!restaurantId,
  });

  const items = data?.items ?? [];
  return {
    items,
    isLoading,
    isError,
    error: error as Error | null,
    isEmpty: !isLoading && !isError && items.length === 0,
    refetch,
  };
}

export function useCreateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuService.createItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEM_QK }),
  });
}

export function useUpdateMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      menuService.updateItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEM_QK }),
  });
}

export function useToggleItemAvailable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      menuService.toggleAvailable(id, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEM_QK }),
  });
}

export function useToggleItemFeatured() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) =>
      menuService.toggleFeatured(id, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEM_QK }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: menuService.deleteItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ITEM_QK }),
  });
}
