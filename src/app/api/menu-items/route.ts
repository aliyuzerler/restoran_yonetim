import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  errorResponse,
  getCurrentUser,
  requireAccessibleRestaurant,
  ResponseError,
} from "@/lib/auth";

const createSchema = z.object({
  restaurantId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  name: z.string().min(1, "Ürün adı gerekli"),
  description: z.string().optional(),
  price: z.number().min(0, "Fiyat 0 veya daha büyük olmalı"),
  imageUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    if (!restaurantId) throw new ResponseError(400, "restaurantId gerekli");
    await requireAccessibleRestaurant(user.id, restaurantId);

    const items = await db.menuItem.findMany({
      where: { restaurantId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { category: true },
    });
    return Response.json({ items });
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
    await requireAccessibleRestaurant(user.id, parsed.data.restaurantId);

    const { categoryId, imageUrl, tags, ...rest } = parsed.data;
    const item = await db.menuItem.create({
      data: {
        ...rest,
        categoryId: categoryId || null,
        imageUrl: imageUrl || null,
        tags: tags || null,
      },
    });
    return Response.json({ item });
  } catch (e) {
    return errorResponse(e);
  }
}
