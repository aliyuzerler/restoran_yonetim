import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  errorResponse,
  getCurrentUser,
  getRoleForRestaurant,
  ResponseError,
} from "@/lib/auth";

type Params = { params: Promise<{ id: string; memberId: string }> };

const updateSchema = z.object({
  role: z.enum(["manager", "staff"]),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id, memberId } = await params;

    // Only owner can change member roles.
    const role = await getRoleForRestaurant(user.id, id);
    if (role !== "owner") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    const member = await db.restaurantMember.findUnique({
      where: { id: memberId },
      select: { restaurantId: true, userId: true, role: true },
    });
    if (!member || member.restaurantId !== id) {
      throw new ResponseError(404, "Üye bulunamadı");
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }

    const updated = await db.restaurantMember.update({
      where: { id: memberId },
      data: { role: parsed.data.role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return Response.json({
      member: {
        id: updated.id,
        restaurantId: updated.restaurantId,
        userId: updated.userId,
        role: updated.role as "owner" | "manager" | "staff",
        createdAt: updated.createdAt.toISOString(),
        user: updated.user,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id, memberId } = await params;

    // Only owner can remove members.
    const role = await getRoleForRestaurant(user.id, id);
    if (role !== "owner") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    const member = await db.restaurantMember.findUnique({
      where: { id: memberId },
      select: { restaurantId: true },
    });
    if (!member || member.restaurantId !== id) {
      throw new ResponseError(404, "Üye bulunamadı");
    }

    await db.restaurantMember.delete({ where: { id: memberId } });

    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
