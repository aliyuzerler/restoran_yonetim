import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { errorResponse, ResponseError } from "@/lib/auth";

const schema = z.object({
  restaurantSlug: z.string().min(1),
  customerName: z.string().min(1, "Ad soyad gerekli"),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  guestCount: z.number().int().min(1, "Kişi sayısı en az 1 olmalı"),
  reservationDate: z.string().min(1, "Tarih gerekli"),
  reservationTime: z.string().min(1, "Saat gerekli"),
  tableId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }
    const {
      restaurantSlug,
      customerPhone,
      customerEmail,
      tableId,
      notes,
      ...rest
    } = parsed.data;

    const restaurant = await db.restaurant.findUnique({
      where: { slug: restaurantSlug },
    });
    if (!restaurant || !restaurant.isActive) {
      throw new ResponseError(404, "Restoran bulunamadı");
    }

    const reservation = await db.reservation.create({
      data: {
        ...rest,
        restaurantId: restaurant.id,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        tableId: tableId || null,
        notes: notes || null,
        status: "pending",
        source: "online",
      },
      include: { table: true },
    });
    return Response.json({ reservation });
  } catch (e) {
    return errorResponse(e);
  }
}
