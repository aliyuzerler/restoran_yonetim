import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import { randomBytes } from "crypto";

const SESSION_COOKIE = "rms_session";
const SESSION_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string) {
  const token = createToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  );
  const session = await db.session.create({
    data: { token, userId, expiresAt },
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return session;
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } }).catch(() => {});
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new ResponseError(401, "Yetkisiz erişim");
  }
  return user;
}

// ---------------------------------------------------------------------------
// Row-Level Security equivalent (application-level tenant isolation)
// ---------------------------------------------------------------------------

/**
 * Returns the IDs of all restaurants the given user can access.
 * A user can access a restaurant if:
 *   - they own it (Restaurant.ownerId === userId), OR
 *   - they have a RestaurantMember row for it.
 *
 * This is the application-level equivalent of a Supabase RLS policy:
 *   USING (owner_id = auth.uid() OR id IN (
 *     SELECT restaurant_id FROM restaurant_members WHERE user_id = auth.uid()
 *   ))
 *
 * Every query that touches restaurant-scoped data MUST filter by these IDs.
 */
export async function getAccessibleRestaurantIds(userId: string): Promise<string[]> {
  const [owned, memberships] = await Promise.all([
    db.restaurant.findMany({
      where: { ownerId: userId },
      select: { id: true },
    }),
    db.restaurantMember.findMany({
      where: { userId },
      select: { restaurantId: true },
    }),
  ]);
  return Array.from(
    new Set([
      ...owned.map((r) => r.id),
      ...memberships.map((m) => m.restaurantId),
    ])
  );
}

/**
 * Returns restaurants the user can access (owned + member), with their role
 * for each (owner takes precedence over membership role).
 */
export async function getAccessibleRestaurants(userId: string) {
  const ids = await getAccessibleRestaurantIds(userId);
  if (ids.length === 0) return [];
  const restaurants = await db.restaurant.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: "desc" },
  });
  const memberships = await db.restaurantMember.findMany({
    where: { userId, restaurantId: { in: ids } },
    select: { restaurantId: true, role: true },
  });
  const roleMap = new Map(memberships.map((m) => [m.restaurantId, m.role]));
  return restaurants.map((r) => ({
    ...r,
    userRole: r.ownerId === userId ? "owner" : roleMap.get(r.id) ?? "staff",
  }));
}

/**
 * Ensures the user can access the given restaurant and returns it.
 * Throws 404 if not accessible (avoid leaking existence).
 */
export async function requireAccessibleRestaurant(
  userId: string,
  restaurantId: string
) {
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
  });
  if (!restaurant) throw new ResponseError(404, "Restoran bulunamadı");

  // Owner?
  if (restaurant.ownerId === userId) return restaurant;

  // Member?
  const membership = await db.restaurantMember.findUnique({
    where: {
      restaurantId_userId: { restaurantId, userId },
    },
  });
  if (!membership) {
    // Don't reveal existence — return 404 like ownership
    throw new ResponseError(404, "Restoran bulunamadı");
  }
  return restaurant;
}

/**
 * Returns the user's role for a restaurant (owner | manager | staff), or null
 * if they have no access.
 */
export async function getRoleForRestaurant(
  userId: string,
  restaurantId: string
): Promise<"owner" | "manager" | "staff" | null> {
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
    select: { ownerId: true },
  });
  if (!restaurant) return null;
  if (restaurant.ownerId === userId) return "owner";
  const membership = await db.restaurantMember.findUnique({
    where: {
      restaurantId_userId: { restaurantId, userId },
    },
    select: { role: true },
  });
  return (membership?.role as "owner" | "manager" | "staff" | null) ?? null;
}

export class ResponseError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ResponseError) {
    return Response.json(
      { error: error.message },
      { status: error.status }
    );
  }
  console.error("API error:", error);
  return Response.json(
    { error: "Sunucu hatası oluştu" },
    { status: 500 }
  );
}

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function toSafeUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
}): SafeUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
