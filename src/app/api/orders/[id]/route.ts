import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  errorResponse,
  getCurrentUser,
  ResponseError,
} from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z
    .enum(["pending", "preparing", "ready", "completed", "cancelled"])
    .optional(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new ResponseError(404, "Sipariş bulunamadı");

    // Verify access via restaurant
    const restaurant = await db.restaurant.findUnique({
      where: { id: order.restaurantId },
    });
    if (!restaurant) throw new ResponseError(404, "Restoran bulunamadı");
    if (restaurant.ownerId !== user.id) {
      const member = await db.restaurantMember.findUnique({
        where: {
          restaurantId_userId: {
            restaurantId: order.restaurantId,
            userId: user.id,
          },
        },
      });
      if (!member) throw new ResponseError(404, "Sipariş bulunamadı");
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }

    const updated = await db.order.update({
      where: { id },
      data: parsed.data,
      include: { items: true },
    });
    return Response.json({ order: updated });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
    });
    if (!order) throw new ResponseError(404, "Sipariş bulunamadı");

    const restaurant = await db.restaurant.findUnique({
      where: { id: order.restaurantId },
    });
    if (!restaurant) throw new ResponseError(404, "Restoran bulunamadı");
    if (restaurant.ownerId !== user.id) {
      const member = await db.restaurantMember.findUnique({
        where: {
          restaurantId_userId: {
            restaurantId: order.restaurantId,
            userId: user.id,
          },
        },
      });
      if (!member) throw new ResponseError(404, "Sipariş bulunamadı");
    }

    await db.order.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
