import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  errorResponse,
  getCurrentUser,
  ResponseError,
  toSafeUser,
} from "@/lib/auth";
import { uniqueSlug } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().min(2, "Restoran adı en az 2 karakter olmalı"),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  coverImage: z.string().optional(),
  logoImage: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  currency: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const restaurants = await db.restaurant.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            menuItems: true,
            tables: true,
            reservations: true,
          },
        },
      },
    });
    return Response.json({ restaurants });
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

    const slug = await uniqueSlug(parsed.data.name);
    const restaurant = await db.restaurant.create({
      data: {
        ...parsed.data,
        email: parsed.data.email || null,
        slug,
        ownerId: user.id,
      },
    });

    return Response.json({ restaurant });
  } catch (e) {
    return errorResponse(e);
  }
}

export { toSafeUser };
