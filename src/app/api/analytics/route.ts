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

    const restaurant = await requireAccessibleRestaurant(user.id, restaurantId);

    const [reservations, menuItems, categories, tables] = await Promise.all([
      db.reservation.findMany({
        where: { restaurantId },
        include: { table: true },
      }),
      db.menuItem.findMany({
        where: { restaurantId },
        include: { category: true },
      }),
      db.category.findMany({ where: { restaurantId } }),
      db.table.findMany({ where: { restaurantId } }),
    ]);

    const currency = restaurant.currency;

    // 1. Busy hours: reservation count by hour bucket
    const hourBuckets: Record<string, number> = {};
    for (const r of reservations) {
      const hour = parseInt(r.reservationTime.split(":")[0] ?? "12", 10);
      // bucket: 12-14 lunch, 18-22 dinner, else other
      let bucket = "12-14";
      if (hour >= 18 && hour < 23) bucket = "18-22";
      else if (hour >= 14 && hour < 18) bucket = "14-18";
      else if (hour < 12) bucket = "00-12";
      hourBuckets[bucket] = (hourBuckets[bucket] ?? 0) + 1;
    }
    const busyHours = [
      { slot: "00-12", label: "Sabah", count: hourBuckets["00-12"] ?? 0 },
      { slot: "12-14", label: "Öğle", count: hourBuckets["12-14"] ?? 0 },
      { slot: "14-18", label: "İkindi", count: hourBuckets["14-18"] ?? 0 },
      { slot: "18-22", label: "Akşam", count: hourBuckets["18-22"] ?? 0 },
    ];

    // 2. Revenue estimate: assume avg spend per person = avg of menu item prices,
    // realized revenue = confirmed/seated/completed guests * avgPrice
    // potential revenue = all guests * avgPrice
    const avgPrice =
      menuItems.length > 0
        ? menuItems.reduce((s, m) => s + m.price, 0) / menuItems.length
        : 0;
    const totalGuests = reservations.reduce((s, r) => s + r.guestCount, 0);
    const realizedGuests = reservations
      .filter((r) =>
        ["confirmed", "seated", "completed"].includes(r.status)
      )
      .reduce((s, r) => s + r.guestCount, 0);
    const completedGuests = reservations
      .filter((r) => r.status === "completed" || r.status === "seated")
      .reduce((s, r) => s + r.guestCount, 0);
    const estimatedRevenue = Math.round(realizedGuests * avgPrice);
    const potentialRevenue = Math.round(totalGuests * avgPrice);

    // 3. Menu popularity: items sorted by featured + available, with category
    const popularity = menuItems
      .map((m) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        imageUrl: m.imageUrl,
        categoryName: m.category?.name ?? "Diğer",
        isFeatured: m.isFeatured,
        isAvailable: m.isAvailable,
        score:
          (m.isFeatured ? 50 : 0) +
          (m.isAvailable ? 10 : 0) +
          (m.tags ? 5 : 0) +
          Math.min(m.price / 50, 20),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // 4. Category distribution (item count + avg price)
    const categoryStats = categories
      .map((c) => {
        const items = menuItems.filter((m) => m.categoryId === c.id);
        const avg =
          items.length > 0
            ? items.reduce((s, m) => s + m.price, 0) / items.length
            : 0;
        return {
          name: c.name,
          itemCount: items.length,
          avgPrice: Math.round(avg),
          featuredCount: items.filter((m) => m.isFeatured).length,
        };
      })
      .sort((a, b) => b.itemCount - a.itemCount);

    // 5. Monthly reservations (last 6 months)
    const months: { label: string; count: number; guests: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("tr-TR", {
        month: "short",
        year: "2-digit",
      });
      const inMonth = reservations.filter((r) =>
        r.reservationDate.startsWith(ym)
      );
      months.push({
        label,
        count: inMonth.length,
        guests: inMonth.reduce((s, r) => s + r.guestCount, 0),
      });
    }

    // 6. Table utilization: reserved+occupied / total
    const occupiedCount = tables.filter(
      (t) => t.status === "occupied" || t.status === "reserved"
    ).length;
    const tableUtilization =
      tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0;

    // 7. Conversion: confirmed+seated+completed / total
    const converted = reservations.filter((r) =>
      ["confirmed", "seated", "completed"].includes(r.status)
    ).length;
    const conversionRate =
      reservations.length > 0
        ? Math.round((converted / reservations.length) * 100)
        : 0;

    // 8. Online vs manual
    const online = reservations.filter((r) => r.source === "online").length;
    const manual = reservations.length - online;

    return Response.json({
      currency,
      kpis: {
        totalGuests,
        completedGuests,
        avgPrice: Math.round(avgPrice),
        estimatedRevenue,
        potentialRevenue,
        conversionRate,
        tableUtilization,
        onlineReservations: online,
        manualReservations: manual,
      },
      busyHours,
      popularity,
      categoryStats,
      months,
      sources: { online, manual },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
