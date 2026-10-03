import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  errorResponse,
  getCurrentUser,
  requireAccessibleRestaurant,
  ResponseError,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const status = searchParams.get("status");
    if (!restaurantId) throw new ResponseError(400, "restaurantId gerekli");
    await requireAccessibleRestaurant(user.id, restaurantId);

    const where: Record<string, unknown> = { restaurantId };
    if (status) where.status = status;

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return Response.json({ orders });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const body = await req.json();
    const schema = z.object({
      restaurantId: z.string().min(1),
      customerName: z.string().min(1),
      customerPhone: z.string().optional().nullable(),
      tableNumber: z.string().optional().nullable(),
      orderType: z.enum(["dine_in", "takeaway"]).optional(),
      notes: z.string().optional().nullable(),
      items: z
        .array(
          z.object({
            menuItemId: z.string(),
            quantity: z.number().int().min(1),
            notes: z.string().optional().nullable(),
          })
        )
        .min(1, "En az 1 ürün gerekli"),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }
    await requireAccessibleRestaurant(user.id, parsed.data.restaurantId);

    // Fetch menu items to snapshot name/price + compute total
    const menuItemIds = parsed.data.items.map((i) => i.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    let total = 0;
    const orderItemsData = parsed.data.items.map((i) => {
      const mi = menuItemMap.get(i.menuItemId);
      if (!mi) throw new ResponseError(400, `Ürün bulunamadı: ${i.menuItemId}`);
      if (!mi.isAvailable)
        throw new ResponseError(400, `${mi.name} şu anda müsait değil`);
      total += mi.price * i.quantity;
      return {
        menuItemId: mi.id,
        name: mi.name,
        price: mi.price,
        quantity: i.quantity,
        notes: i.notes ?? null,
      };
    });

    const order = await db.order.create({
      data: {
        restaurantId: parsed.data.restaurantId,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone ?? null,
        tableNumber: parsed.data.tableNumber ?? null,
        orderType: parsed.data.orderType ?? "dine_in",
        notes: parsed.data.notes ?? null,
        total,
        source: "manual",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });
    return Response.json({ order });
  } catch (e) {
    return errorResponse(e);
  }
}
