"use client";

/**
 * useTables — table list with loading/error/empty states + CRUD mutations.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tableService } from "@/services/tableService";
import type { TableStatus } from "@/lib/types";

const QK = ["tables"];

export function useTables(restaurantId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...QK, restaurantId],
    queryFn: () => tableService.list(restaurantId!),
    enabled: !!restaurantId,
  });

  const tables = data?.tables ?? [];
  return {
    tables,
    isLoading,
    isError,
    error: error as Error | null,
    isEmpty: !isLoading && !isError && tables.length === 0,
    refetch,
  };
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tableService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      tableService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTableStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tableService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tableService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
