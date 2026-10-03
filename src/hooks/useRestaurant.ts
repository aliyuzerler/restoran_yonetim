"use client";

/**
 * useRestaurant — restaurant list + current selection + dashboard stats.
 * Provides loading/error/empty states for restaurant data.
 */
import { useQuery } from "@tanstack/react-query";
import { useRestaurantStore } from "@/stores/restaurant-store";
import { restaurantService } from "@/services/restaurantService";

export function useRestaurants() {
  const { restaurants, current, loading, initialized, load, setCurrent } =
    useRestaurantStore();

  return {
    restaurants,
    current,
    loading,
    initialized,
    isEmpty: initialized && restaurants.length === 0,
    refetch: load,
    setCurrent,
  };
}

/** Dashboard statistics for the current restaurant (with real-time polling). */
export function useDashboardStats(restaurantId: string | undefined) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard", restaurantId],
    queryFn: () => restaurantService.dashboard(restaurantId!),
    enabled: !!restaurantId,
    refetchInterval: 15000, // real-time polling
    refetchOnWindowFocus: true,
  });

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    isEmpty: !isLoading && !isError && !!data && data.counts.reservations === 0,
    refetch,
  };
}

/** Analytics for the current restaurant. */
export function useAnalytics(restaurantId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["analytics", restaurantId],
    queryFn: () => restaurantService.analytics(restaurantId!),
    enabled: !!restaurantId,
  });

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    isEmpty: !isLoading && !isError && !!data && data.kpis.totalGuests === 0,
  };
}
