"use client";

import { create } from "zustand";
import type { MenuItem } from "@/lib/types";

export type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  notes: string;
};

type CartState = {
  items: CartItem[];
  restaurantSlug: string | null;
  add: (item: MenuItem, notes?: string) => void;
  remove: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clear: () => void;
  setRestaurant: (slug: string) => void;
  total: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>()(
    (set, get) => ({
      items: [],
      restaurantSlug: null,
      add: (item, notes = "") => {
        const existing = get().items.find((i) => i.menuItemId === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.menuItemId === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                quantity: 1,
                notes,
              },
            ],
          });
        }
      },
      remove: (menuItemId) =>
        set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) }),
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.menuItemId !== menuItemId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },
      updateNotes: (menuItemId, notes) =>
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, notes } : i
          ),
        }),
      clear: () => set({ items: [] }),
      setRestaurant: (slug) => {
        // Clear cart if switching restaurants
        if (get().restaurantSlug && get().restaurantSlug !== slug) {
          set({ items: [], restaurantSlug: slug });
        } else {
          set({ restaurantSlug: slug });
        }
      },
      total: () =>
        get().items.reduce((s, i) => s + i.price * i.quantity, 0),
      count: () => get().items.reduce((s, i) => s + i.quantity, 0),
    })
);
