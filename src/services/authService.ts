/**
 * AuthService — authentication operations.
 * Wraps the REST API (src/lib/api.ts) which is backed by Prisma + bcrypt
 * sessions. When Supabase is configured, this layer can be swapped to use
 * the Supabase client directly without changing call sites.
 */
import { api } from "@/lib/api";
import type { SafeUser } from "@/lib/types";

export const authService = {
  /** Get the current authenticated user (or null). */
  me: () => api.me(),

  /** Login with email + password. Returns user + sets session cookie. */
  login: (email: string, password: string) => api.login(email, password),

  /** Register a new user. Returns user + sets session cookie. */
  register: (name: string, email: string, password: string) =>
    api.register(name, email, password),

  /** Logout — clears session cookie. */
  logout: () => api.logout(),

  /** Request a password reset email. */
  forgotPassword: (email: string) => api.forgotPassword(email),

  /** Verify a reset token is valid. */
  verifyResetToken: (token: string) => api.verifyResetToken(token),

  /** Reset password with a valid token. */
  resetPassword: (token: string, password: string) =>
    api.resetPassword(token, password),
};

export type { SafeUser };
