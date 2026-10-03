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
import { uniqueSlug } from "@/lib/slug";

type Params = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  coverImageUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  currency: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;
    const restaurant = await requireAccessibleRestaurant(user.id, id);
    return Response.json({ restaurant });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const existing = await requireAccessibleRestaurant(user.id, id);

    // Only owner or manager can modify restaurant settings.
    const role = await getRoleForRestaurant(user.id, id);
    if (role !== "owner" && role !== "manager") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.email !== undefined) {
      data.email = parsed.data.email || null;
    }
    if (parsed.data.name && parsed.data.name !== existing.name) {
      data.slug = await uniqueSlug(parsed.data.name, id);
    }

    const restaurant = await db.restaurant.update({
      where: { id },
      data,
    });
    return Response.json({ restaurant });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    await requireAccessibleRestaurant(user.id, id);

    // Only owner or manager can delete.
    const role = await getRoleForRestaurant(user.id, id);
    if (role !== "owner" && role !== "manager") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    await db.restaurant.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
