import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  errorResponse,
  hashPassword,
  ResponseError,
  toSafeUser,
} from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }
    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      throw new ResponseError(409, "Bu e-posta zaten kayıtlı");
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: { name, email, passwordHash, role: "owner" },
    });

    await createSession(user.id);
    return Response.json({ user: toSafeUser(user) });
  } catch (e) {
    return errorResponse(e);
  }
}
