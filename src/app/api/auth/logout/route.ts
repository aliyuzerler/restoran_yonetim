import { clearSession, errorResponse } from "@/lib/auth";

export async function POST() {
  try {
    await clearSession();
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
