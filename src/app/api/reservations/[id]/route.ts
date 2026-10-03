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
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  guestCount: z.number().int().min(1).optional(),
  reservationDate: z.string().min(1).optional(),
  reservationTime: z.string().min(1).optional(),
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
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const res = await db.reservation.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!res) throw new ResponseError(404, "Rezervasyon bulunamadı");

    // Staff can edit reservations — only access is required.
    await requireAccessibleRestaurant(user.id, res.restaurantId);

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }

    const {
      customerPhone,
      customerEmail,
      tableId,
      notes,
      ...rest
    } = parsed.data;
    const data: Record<string, unknown> = { ...rest };
    if (customerPhone !== undefined) data.customerPhone = customerPhone || null;
    if (customerEmail !== undefined) data.customerEmail = customerEmail || null;
    if (tableId !== undefined) data.tableId = tableId || null;
    if (notes !== undefined) data.notes = notes || null;

    const updated = await db.reservation.update({
      where: { id },
      data,
      include: { table: true },
    });
    return Response.json({ reservation: updated });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    const res = await db.reservation.findUnique({
      where: { id },
      include: { restaurant: true },
    });
    if (!res) throw new ResponseError(404, "Rezervasyon bulunamadı");

    await requireAccessibleRestaurant(user.id, res.restaurantId);

    // Only owner or manager can delete reservations.
    const role = await getRoleForRestaurant(user.id, res.restaurantId);
    if (role !== "owner" && role !== "manager") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    await db.reservation.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
