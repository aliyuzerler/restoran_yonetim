"use client";

/**
 * useReservations — reservation list with loading/error/empty states.
 * Includes real-time polling for new online reservations.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationService } from "@/services/reservationService";
import type { ReservationStatus } from "@/lib/types";

const QK = ["reservations"];

export function useReservations(
  restaurantId: string | undefined,
  filters?: { status?: string; date?: string }
) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [...QK, restaurantId, filters],
    queryFn: () => reservationService.list(restaurantId!, filters),
    enabled: !!restaurantId,
    refetchInterval: 10000, // real-time polling every 10s
    refetchOnWindowFocus: true,
  });

  const reservations = data?.reservations ?? [];

  return {
    reservations,
    isLoading,
    isError,
    error: error as Error | null,
    isEmpty: !isLoading && !isError && reservations.length === 0,
    refetch,
  };
}

/** Create a new reservation. */
export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      reservationService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Update a reservation. */
export function useUpdateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => reservationService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Change reservation status (quick action). */
export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      reservationService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Delete a reservation. */
export function useDeleteReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Submit a public reservation (from public restaurant page). */
export function usePublicReservation() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      reservationService.publicCreate(data),
  });
}
