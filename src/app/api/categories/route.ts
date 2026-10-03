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
  name: z.string().min(1, "Kategori adı gerekli"),
  description: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    if (!restaurantId) throw new ResponseError(400, "restaurantId gerekli");
    await requireAccessibleRestaurant(user.id, restaurantId);

    const categories = await db.category.findMany({
      where: { restaurantId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { menuItems: true } } },
    });
    return Response.json({ categories });
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

    const category = await db.category.create({
      data: parsed.data,
    });
    return Response.json({ category });
  } catch (e) {
    return errorResponse(e);
  }
}
