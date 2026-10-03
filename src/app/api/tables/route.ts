import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  errorResponse,
  getCurrentUser,
  ResponseError,
} from "@/lib/auth";

async function ensureOwned(restaurantId: string, userId: string) {
  const r = await db.restaurant.findFirst({
    where: { id: restaurantId, ownerId: userId },
  });
  if (!r) throw new ResponseError(404, "Restoran bulunamadı");
  return r;
}

const createSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(1, "Masa adı gerekli"),
  capacity: z.number().int().min(1, "Kapasite en az 1 olmalı"),
  location: z.string().optional().nullable(),
  status: z
    .enum(["available", "occupied", "reserved", "cleaning"])
    .optional(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    if (!restaurantId) throw new ResponseError(400, "restaurantId gerekli");
    await ensureOwned(restaurantId, user.id);

    const tables = await db.table.findMany({
      where: { restaurantId },
      orderBy: [{ name: "asc" }],
    });
    return Response.json({ tables });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }
    await ensureOwned(parsed.data.restaurantId, user.id);

    const { location, notes, ...rest } = parsed.data;
    const table = await db.table.create({
      data: {
        ...rest,
        location: location || null,
        notes: notes || null,
      },
    });
    return Response.json({ table });
  } catch (e) {
    return errorResponse(e);
  }
}
