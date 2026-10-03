"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { SafeUser } from "@/lib/types";

type AuthState = {
  user: SafeUser | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  setUser: (user: SafeUser | null) => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  init: async () => {
    set({ loading: true });
    try {
      const { user } = await api.me();
      set({ user, loading: false, initialized: true });
    } catch {
      set({ user: null, loading: false, initialized: true });
    }
  },
  setUser: (user) => set({ user }),
  signOut: async () => {
    await api.logout();
    set({ user: null });
  },
}));
