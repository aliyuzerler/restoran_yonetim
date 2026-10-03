import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { errorResponse, hashPassword, ResponseError } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1, "Token gerekli"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }
    const { token, password } = parsed.data;

    const reset = await db.passwordReset.findUnique({
      where: { token },
    });
    if (!reset) {
      throw new ResponseError(400, "Geçersiz veya süresi dolmuş bağlantı");
    }
    if (reset.usedAt) {
      throw new ResponseError(400, "Bu sıfırlama bağlantısı zaten kullanıldı");
    }
    if (reset.expiresAt < new Date()) {
      throw new ResponseError(400, "Bu sıfırlama bağlantısının süresi dolmuş");
    }

    const user = await db.user.findUnique({ where: { email: reset.email } });
    if (!user) {
      throw new ResponseError(400, "Kullanıcı bulunamadı");
    }

    const passwordHash = await hashPassword(password);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    // Mark token as used + invalidate all sessions (force re-login)
    await db.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    });
    await db.session.deleteMany({ where: { userId: user.id } });

    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

// Verify a token is valid (used by the reset page on load)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) throw new ResponseError(400, "Token gerekli");

    const reset = await db.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return Response.json({ valid: false });
    }
    return Response.json({ valid: true, email: reset.email });
  } catch (e) {
    return errorResponse(e);
  }
}
