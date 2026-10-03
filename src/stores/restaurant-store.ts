"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { Restaurant } from "@/lib/types";

type RestaurantState = {
  restaurants: Restaurant[];
  current: Restaurant | null;
  loading: boolean;
  initialized: boolean;
  load: () => Promise<void>;
  setCurrent: (r: Restaurant | null) => void;
  setCurrentById: (id: string | null) => void;
};

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurants: [],
  current: null,
  loading: false,
  initialized: false,
  load: async () => {
    set({ loading: true });
    try {
      const { restaurants } = await api.listRestaurants();
      const prev = get().current;
      const next = prev
        ? restaurants.find((r) => r.id === prev.id) ?? restaurants[0] ?? null
        : restaurants[0] ?? null;
      set({ restaurants, current: next, loading: false, initialized: true });
    } catch {
      set({ loading: false, initialized: true });
    }
  },
  setCurrent: (r) => set({ current: r }),
  setCurrentById: (id) => {
    const r = get().restaurants.find((x) => x.id === id) ?? null;
    set({ current: r });
  },
}));
