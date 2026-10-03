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
