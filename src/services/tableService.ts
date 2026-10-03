/**
 * TableService — table CRUD + status management.
 */
import { api } from "@/lib/api";
import type { Table, TableStatus } from "@/lib/types";

export const tableService = {
  /** List tables for a restaurant. */
  list: (restaurantId: string) => api.listTables(restaurantId),

  /** Create a table. */
  create: (data: Record<string, unknown>) => api.createTable(data),

  /** Update a table. */
  update: (id: string, data: Record<string, unknown>) =>
    api.updateTable(id, data),

  /** Change a table's status. */
  updateStatus: (id: string, status: TableStatus) =>
    api.updateTable(id, { status }),

  /** Delete a table. */
  remove: (id: string) => api.deleteTable(id),
};

export type { Table, TableStatus };
