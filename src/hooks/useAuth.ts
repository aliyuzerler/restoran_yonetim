"use client";

/**
 * useAuth — authentication state + actions.
 * Wraps the auth store + authService with clean loading/error states.
 */
import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/authService";
import type { SafeUser } from "@/lib/types";

export function useAuth() {
  const { user, loading, initialized, init, setUser, signOut } = useAuthStore();

  useEffect(() => {
    if (!initialized) init();
  }, [init, initialized]);

  const login = useCallback(
    async (email: string, password: string): Promise<SafeUser> => {
      const { user } = await authService.login(email, password);
      setUser(user);
      return user;
    },
    [setUser]
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<SafeUser> => {
      const { user } = await authService.register(name, email, password);
      setUser(user);
      return user;
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    await signOut();
  }, [signOut]);

  return {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refresh: init,
  };
}
