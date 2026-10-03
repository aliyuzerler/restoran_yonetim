import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { errorResponse } from "@/lib/auth";

export async function POST() {
  try {
    // Demo user
    let user = await db.user.findUnique({
      where: { email: "demo@restoran.app" },
    });
    if (!user) {
      user = await db.user.create({
        data: {
          name: "Demo Restoran Sahibi",
          email: "demo@restoran.app",
          passwordHash: await hashPassword("demo1234"),
          role: "owner",
        },
      });
    }

    // Demo restaurant
    let restaurant = await db.restaurant.findFirst({
      where: { ownerId: user.id },
    });
    if (!restaurant) {
      restaurant = await db.restaurant.create({
        data: {
          name: "Le Petit Bistro",
          slug: slugify("Le Petit Bistro"),
          description:
            "Şehrin kalbinde, mevsim malzemeleriyle hazırlanan modern Fransız-Akdeniz mutfağı. Sıcacık atmosfer ve özenli sunum.",
          cuisine: "Fransız & Akdeniz",
          phone: "+90 212 555 0100",
          email: "merhaba@lepetitbistro.com",
          address: "Bağdat Caddesi No: 142, Kadıköy",
          city: "İstanbul",
          openTime: "12:00",
          closeTime: "23:00",
          currency: "₺",
          ownerId: user.id,
          coverImage:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80",
          logoImage:
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80",
        },
      });
    }

    // Categories
    const catData = [
      { name: "Başlangıçlar", sortOrder: 0 },
      { name: "Ana Yemekler", sortOrder: 1 },
      { name: "Makarnalar", sortOrder: 2 },
      { name: "Tatlılar", sortOrder: 3 },
      { name: "İçecekler", sortOrder: 4 },
    ];
    const categories = [];
    for (const c of catData) {
      let cat = await db.category.findFirst({
        where: { restaurantId: restaurant.id, name: c.name },
      });
      if (!cat) {
        cat = await db.category.create({
          data: { ...c, restaurantId: restaurant.id },
        });
      }
      categories.push(cat);
    }

    // Menu items
    const itemData: Array<{
      name: string;
      description: string;
      price: number;
      cat: string;
      tags?: string;
      featured?: boolean;
    }> = [
      {
        name: "Burrata Salatası",
        description:
          "Taze burrata, çeri domates, fesleğen, sızma zeytinyağı ve balsamik glazür",
        price: 285,
        cat: "Başlangıçlar",
        tags: "vejetaryen",
        featured: true,
      },
      {
        name: "Karides Gumbo",
        description: "Taze karides, andouille sosis, kereviz ve baharatlı et suyu",
        price: 320,
        cat: "Başlangıçlar",
      },
      {
        name: "Izgara Kalamar",
        description: "Limonlu rocket salata ve sarımsaklı aioli",
        price: 295,
        cat: "Başlangıçlar",
      },
      {
        name: "Dana Cheek",
        description:
          "8 saat pişmiş dana yanağı, karamelize soğan püresi ve kırmızı şarap sosu",
        price: 540,
        cat: "Ana Yemekler",
        featured: true,
      },
      {
        name: "Somon En Papillote",
        description: "Pergamentte pişmiş Norveç somonu, mevsim sebzeleri ve dereotu",
        price: 495,
        cat: "Ana Yemekler",
      },
      {
        name: "Dana Tartar",
        description: "Elmeli hardal ve kapariyle dana eti tartarı, çıtır ekmek",
        price: 380,
        cat: "Ana Yemekler",
      },
      {
        name: "Trüf Mantar Risotto",
        description: "Arborio pirinç, karışık mantar, parmesan ve siyah trüf",
        price: 360,
        cat: "Makarnalar",
        tags: "vejetaryen",
        featured: true,
      },
      {
        name: "Deniz Mahsullü Linguine",
        description: "Midye, karides ve kalamarla beyaz şaraplı sos",
        price: 420,
        cat: "Makarnalar",
      },
      {
        name: "Crème Brûlée",
        description: "Klasik vanilyalı krema, karamelize şeker kabuğu",
        price: 180,
        cat: "Tatlılar",
        tags: "vejetaryen",
      },
      {
        name: "Çikolata Fondan",
        description: "Akışkan bitter çikolata, vanilyalı dondurma ve taze çilek",
        price: 210,
        cat: "Tatlılar",
        featured: true,
      },
      {
        name: "Tiramisu",
        description: "Espresso ve mascarpone ile katmanlı İtalyan klasiği",
        price: 195,
        cat: "Tatlılar",
      },
      {
        name: "Sigara Böreği",
        description: "Çıtır yufkada peynirli börek, nar ekşisi",
        price: 145,
        cat: "İçecekler",
      },
      {
        name: "Mevsim Limonata",
        description: "Taze sıkılmış limon, nane ve çubuk krallık",
        price: 95,
        cat: "İçecekler",
      },
    ];

    for (let i = 0; i < itemData.length; i++) {
      const it = itemData[i];
      const cat = categories.find((c) => c.name === it.cat)!;
      const exists = await db.menuItem.findFirst({
        where: { restaurantId: restaurant.id, name: it.name },
      });
      if (!exists) {
        await db.menuItem.create({
          data: {
            name: it.name,
            description: it.description,
            price: it.price,
            categoryId: cat.id,
            tags: it.tags ?? null,
            isFeatured: it.featured ?? false,
            sortOrder: i,
            restaurantId: restaurant.id,
          },
        });
      }
    }

    // Tables
    const tableData = [
      { name: "Masa 1", capacity: 2, location: "Pencere Kenarı", status: "available" },
      { name: "Masa 2", capacity: 2, location: "Pencere Kenarı", status: "available" },
      { name: "Masa 3", capacity: 4, location: "İç Salon", status: "occupied" },
      { name: "Masa 4", capacity: 4, location: "İç Salon", status: "available" },
      { name: "Masa 5", capacity: 6, location: "İç Salon", status: "reserved" },
      { name: "Masa 6", capacity: 2, location: "Teras", status: "available" },
      { name: "Masa 7", capacity: 4, location: "Teras", status: "cleaning" },
      { name: "Masa 8", capacity: 8, location: "VIP Salon", status: "available" },
    ];
    const tables = [];
    for (const t of tableData) {
      let table = await db.table.findFirst({
        where: { restaurantId: restaurant.id, name: t.name },
      });
      if (!table) {
        table = await db.table.create({
          data: { ...t, restaurantId: restaurant.id },
        });
      }
      tables.push(table);
    }

    // Reservations (today + upcoming)
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 10);
    const dayAfter = new Date(Date.now() + 2 * 86400000)
      .toISOString()
      .slice(0, 10);

    const resData: Array<{
      name: string;
      phone: string;
      size: number;
      date: string;
      time: string;
      status: string;
      tableIdx?: number;
      notes?: string;
    }> = [
      { name: "Ayşe Yılmaz", phone: "+90 532 111 2233", size: 2, date: today, time: "19:00", status: "confirmed", tableIdx: 0, notes: "Doğum günü" },
      { name: "Mehmet Demir", phone: "+90 533 222 3344", size: 4, date: today, time: "20:30", status: "pending", tableIdx: 3 },
      { name: "Zeynep Kaya", phone: "+90 534 333 4455", size: 6, date: today, time: "21:00", status: "confirmed", tableIdx: 4 },
      { name: "Can Öztürk", phone: "+90 535 444 5566", size: 2, date: tomorrow, time: "13:00", status: "pending" },
      { name: "Elif Şahin", phone: "+90 536 555 6677", size: 4, date: tomorrow, time: "19:30", status: "confirmed", tableIdx: 3 },
      { name: "Burak Aydın", phone: "+90 537 666 7788", size: 3, date: dayAfter, time: "20:00", status: "pending" },
      { name: "Selin Arslan", phone: "+90 538 777 8899", size: 2, date: dayAfter, time: "21:30", status: "confirmed", tableIdx: 1 },
    ];

    for (const r of resData) {
      const exists = await db.reservation.findFirst({
        where: {
          restaurantId: restaurant.id,
          customerName: r.name,
          date: r.date,
          time: r.time,
        },
      });
      if (!exists) {
        await db.reservation.create({
          data: {
            customerName: r.name,
            customerPhone: r.phone,
            partySize: r.size,
            date: r.date,
            time: r.time,
            status: r.status,
            notes: r.notes ?? null,
            tableId: r.tableIdx !== undefined ? tables[r.tableIdx].id : null,
            restaurantId: restaurant.id,
            userId: user.id,
            source: "manual",
          },
        });
      }
    }

    return Response.json({
      ok: true,
      restaurant: { slug: restaurant.slug, name: restaurant.name },
      credentials: { email: "demo@restoran.app", password: "demo1234" },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
