import { NextRequest } from "next/server";
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
    if (!restaurantId) throw new ResponseError(400, "restaurantId gerekli");

    await requireAccessibleRestaurant(user.id, restaurantId);

    const [menuItems, tables, reservations, categories] = await Promise.all([
      db.menuItem.count({ where: { restaurantId } }),
      db.table.count({ where: { restaurantId } }),
      db.reservation.findMany({ where: { restaurantId } }),
      db.category.count({ where: { restaurantId } }),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const todays = reservations.filter((r) => r.reservationDate === today);
    const pending = reservations.filter((r) => r.status === "pending");
    const confirmed = reservations.filter((r) => r.status === "confirmed");

    // Today's total guests (sum of guestCount for today's reservations)
    const todayGuests = todays.reduce((s, r) => s + r.guestCount, 0);

    const byStatus: Record<string, number> = {};
    for (const r of reservations) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    }

    const byDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      byDay.push({
        date: ds,
        count: reservations.filter((r) => r.reservationDate === ds).length,
      });
    }

    const tablesByStatus: Record<string, number> = {};
    const allTables = await db.table.findMany({ where: { restaurantId } });
    for (const t of allTables) {
      tablesByStatus[t.status] = (tablesByStatus[t.status] ?? 0) + 1;
    }
    // Active tables = not inactive (available + occupied + reserved + cleaning)
    const activeTables = allTables.filter((t) => t.status !== "inactive").length;

    return Response.json({
      counts: {
        menuItems,
        tables: allTables.length,
        activeTables,
        reservations: reservations.length,
        categories,
      },
      reservations: {
        today: todays.length,
        todayGuests,
        pending: pending.length,
        confirmed: confirmed.length,
        byStatus,
        byDay,
      },
      tablesByStatus,
      upcoming: todays
        .sort((a, b) => a.reservationTime.localeCompare(b.reservationTime))
        .slice(0, 6),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
