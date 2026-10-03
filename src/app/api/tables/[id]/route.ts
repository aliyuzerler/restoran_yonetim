import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  errorResponse,
  getCurrentUser,
  getRoleForRestaurant,
  requireAccessibleRestaurant,
  ResponseError,
} from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  tableNumber: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  location: z.string().optional().nullable(),
  status: z
    .enum(["available", "occupied", "reserved", "inactive", "cleaning"])
    .optional(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const table = await db.table.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!table) throw new ResponseError(404, "Masa bulunamadı");

    await requireAccessibleRestaurant(user.id, table.restaurantId);

    const role = await getRoleForRestaurant(user.id, table.restaurantId);
    if (role !== "owner" && role !== "manager") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }

    const { location, notes, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (location !== undefined) data.location = location || null;
    if (notes !== undefined) data.notes = notes || null;

    const updated = await db.table.update({ where: { id }, data });
    return Response.json({ table: updated });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const table = await db.table.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!table) throw new ResponseError(404, "Masa bulunamadı");

    await requireAccessibleRestaurant(user.id, table.restaurantId);

    const role = await getRoleForRestaurant(user.id, table.restaurantId);
    if (role !== "owner" && role !== "manager") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    await db.table.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
