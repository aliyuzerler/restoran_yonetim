/**
 * RestaurantService — restaurant CRUD + member management.
 */
import { api } from "@/lib/api";
import type { Restaurant, RestaurantRole } from "@/lib/types";

export const restaurantService = {
  /** List all restaurants the current user can access (owned + member). */
  list: () => api.listRestaurants(),

  /** Get a single restaurant by ID. */
  get: (id: string) => api.getRestaurant(id),

  /** Create a new restaurant. */
  create: (data: Partial<Restaurant>) => api.createRestaurant(data),

  /** Update a restaurant. */
  update: (id: string, data: Partial<Restaurant>) =>
    api.updateRestaurant(id, data),

  /** Delete a restaurant. */
  remove: (id: string) => api.deleteRestaurant(id),

  /** List team members of a restaurant. */
  listMembers: (restaurantId: string) => api.listMembers(restaurantId),

  /** Add a team member by email. */
  addMember: (restaurantId: string, email: string, role: RestaurantRole) =>
    api.addMember(restaurantId, email, role),

  /** Update a member's role. */
  updateMember: (restaurantId: string, memberId: string, role: RestaurantRole) =>
    api.updateMember(restaurantId, memberId, role),

  /** Remove a team member. */
  removeMember: (restaurantId: string, memberId: string) =>
    api.removeMember(restaurantId, memberId),

  /** Get dashboard statistics for a restaurant. */
  dashboard: (restaurantId: string) => api.dashboard(restaurantId),

  /** Get analytics for a restaurant. */
  analytics: (restaurantId: string) => api.analytics(restaurantId),
};
