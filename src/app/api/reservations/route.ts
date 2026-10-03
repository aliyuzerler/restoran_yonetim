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
  customerName: z.string().min(1, "Müşteri adı gerekli"),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  guestCount: z.number().int().min(1, "Kişi sayısı en az 1 olmalı"),
  reservationDate: z.string().min(1, "Tarih gerekli"),
  reservationTime: z.string().min(1, "Saat gerekli"),
  tableId: z.string().optional().nullable(),
  status: z
    .enum([
      "pending",
      "confirmed",
      "seated",
      "completed",
      "cancelled",
      "no_show",
    ])
    .optional(),
  notes: z.string().optional().nullable(),
  source: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    if (!restaurantId) throw new ResponseError(400, "restaurantId gerekli");
    await requireAccessibleRestaurant(user.id, restaurantId);

    const where: Record<string, unknown> = { restaurantId };
    if (status) where.status = status;
    if (date) where.reservationDate = date;

    const reservations = await db.reservation.findMany({
      where,
      orderBy: [
        { reservationDate: "desc" },
        { reservationTime: "desc" },
      ],
      include: { table: true },
    });
    return Response.json({ reservations });
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
    // Staff can create reservations — only access is required.
    await requireAccessibleRestaurant(user.id, parsed.data.restaurantId);

    const {
      customerPhone,
      customerEmail,
      tableId,
      notes,
      ...rest
    } = parsed.data;
    const reservation = await db.reservation.create({
      data: {
        ...rest,
        customerPhone: customerPhone || null,
        customerEmail: customerEmail || null,
        tableId: tableId || null,
        notes: notes || null,
        userId: user.id,
      },
      include: { table: true },
    });
    return Response.json({ reservation });
  } catch (e) {
    return errorResponse(e);
  }
}
