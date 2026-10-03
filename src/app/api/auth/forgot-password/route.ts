import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { errorResponse, ResponseError } from "@/lib/auth";
import { createToken } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
});

// Always responds with success to prevent email enumeration.
// If the email exists, a reset token is created and returned (dev mode, since
// we have no email provider). In production this would send an email.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }
    const { email } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      // Invalidate previous unused tokens for this email
      await db.passwordReset.updateMany({
        where: { email, usedAt: null },
        data: { usedAt: new Date() },
      });
      // Create a fresh token (valid for 1 hour)
      const token = createToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const reset = await db.passwordReset.create({
        data: { token, email, userId: user.id, expiresAt },
      });
      // Dev mode: return the token so the UI can display a reset link.
      // In production with email, we would NOT return the token.
      return Response.json({
        ok: true,
        // @ts-expect-error dev convenience
        devToken: reset.token,
        devNote:
          "E-posta sağlayıcısı yok — şifre sıfırlama bağlantısı aşağıda gösteriliyor.",
      });
    }
    // Email does not exist — still return ok to prevent enumeration
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
