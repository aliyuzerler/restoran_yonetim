import { errorResponse, getCurrentUser, toSafeUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ user: null });
    return Response.json({ user: toSafeUser(user) });
  } catch (e) {
    return errorResponse(e);
  }
}
