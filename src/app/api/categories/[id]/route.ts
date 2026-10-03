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
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const cat = await db.category.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!cat || cat.restaurant.ownerId !== user.id) {
      throw new ResponseError(404, "Kategori bulunamadı");
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }

    const category = await db.category.update({
      where: { id },
      data: parsed.data,
    });
    return Response.json({ category });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const cat = await db.category.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!cat || cat.restaurant.ownerId !== user.id) {
      throw new ResponseError(404, "Kategori bulunamadı");
    }

    await db.category.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
