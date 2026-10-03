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
  categoryId: z.string().optional().nullable(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const item = await db.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!item) throw new ResponseError(404, "Ürün bulunamadı");

    await requireAccessibleRestaurant(user.id, item.restaurantId);

    const role = await getRoleForRestaurant(user.id, item.restaurantId);
    if (role !== "owner" && role !== "manager") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }

    const { categoryId, imageUrl, tags, ...rest } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (tags !== undefined) data.tags = tags || null;

    const updated = await db.menuItem.update({ where: { id }, data });
    return Response.json({ item: updated });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const item = await db.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!item) throw new ResponseError(404, "Ürün bulunamadı");

    await requireAccessibleRestaurant(user.id, item.restaurantId);

    const role = await getRoleForRestaurant(user.id, item.restaurantId);
    if (role !== "owner" && role !== "manager") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    await db.menuItem.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
