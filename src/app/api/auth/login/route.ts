import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  errorResponse,
  ResponseError,
  toSafeUser,
  verifyPassword,
} from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }
    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      throw new ResponseError(401, "E-posta veya şifre hatalı");
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new ResponseError(401, "E-posta veya şifre hatalı");
    }

    await createSession(user.id);
    return Response.json({ user: toSafeUser(user) });
  } catch (e) {
    return errorResponse(e);
  }
}
