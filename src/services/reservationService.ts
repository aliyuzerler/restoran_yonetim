/**
 * ReservationService — reservation CRUD + status management.
 */
import { api } from "@/lib/api";
import type { Reservation, ReservationStatus } from "@/lib/types";

export const reservationService = {
  /** List reservations for a restaurant, optionally filtered. */
  list: (
    restaurantId: string,
    filters?: { status?: string; date?: string }
  ) => api.listReservations(restaurantId, filters),

  /** Create a new reservation. */
  create: (data: Record<string, unknown>) => api.createReservation(data),

  /** Update a reservation. */
  update: (id: string, data: Record<string, unknown>) =>
    api.updateReservation(id, data),

  /** Change a reservation's status. */
  updateStatus: (id: string, status: ReservationStatus) =>
    api.updateReservation(id, { status }),

  /** Delete a reservation. */
  remove: (id: string) => api.deleteReservation(id),

  /** Submit a public reservation (from the public restaurant page). */
  publicCreate: (data: Record<string, unknown>) =>
    api.publicReservation(data),
};

export type { Reservation, ReservationStatus };
