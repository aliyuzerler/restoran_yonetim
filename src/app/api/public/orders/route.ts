import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { errorResponse, ResponseError } from "@/lib/auth";

const schema = z.object({
  restaurantSlug: z.string().min(1),
  customerName: z.string().min(1, "Ad soyad gerekli"),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }
    const { restaurantSlug, ...rest } = parsed.data;

    const restaurant = await db.restaurant.findUnique({
      where: { slug: restaurantSlug },
    });
    if (!restaurant || !restaurant.isActive) {
      throw new ResponseError(404, "Restoran bulunamadı");
    }

    // Fetch menu items to snapshot + compute total
    const menuItemIds = rest.items.map((i) => i.menuItemId);
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: menuItemIds }, restaurantId: restaurant.id },
    });
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    let total = 0;
    const orderItemsData = rest.items.map((i) => {
      const mi = menuItemMap.get(i.menuItemId);
      if (!mi) throw new ResponseError(400, "Ürün bulunamadı");
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
        restaurantId: restaurant.id,
        customerName: rest.customerName,
        customerPhone: rest.customerPhone ?? null,
        tableNumber: rest.tableNumber ?? null,
        orderType: rest.orderType ?? "dine_in",
        notes: rest.notes ?? null,
        total,
        source: "online",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });
    return Response.json({ order });
  } catch (e) {
    return errorResponse(e);
  }
}
