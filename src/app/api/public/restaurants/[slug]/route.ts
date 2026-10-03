import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { errorResponse, ResponseError } from "@/lib/auth";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const restaurant = await db.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
        menuItems: {
          where: { isAvailable: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          include: { category: true },
        },
        tables: {
          orderBy: [{ name: "asc" }],
        },
      },
    });
    if (!restaurant || !restaurant.isActive) {
      throw new ResponseError(404, "Restoran bulunamadı");
    }
    return Response.json({ restaurant });
  } catch (e) {
    return errorResponse(e);
  }
}
