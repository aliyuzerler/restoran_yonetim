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

const createSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  role: z.enum(["manager", "staff"]),
});

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    // RLS-equivalent: must have access to this restaurant.
    await requireAccessibleRestaurant(user.id, id);

    // Fetch the restaurant to include its owner as a synthetic owner member.
    const restaurant = await db.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });
    if (!restaurant) throw new ResponseError(404, "Restoran bulunamadı");

    const rows = await db.restaurantMember.findMany({
      where: { restaurantId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    // Build the member list. The owner is represented by the restaurant.ownerId
    // relationship, not a RestaurantMember row, so we synthesize an owner entry
    // at the top of the list.
    const ownerMember = {
      id: `owner-${restaurant.ownerId}`,
      restaurantId: restaurant.id,
      userId: restaurant.ownerId,
      role: "owner" as const,
      createdAt: new Date(0).toISOString(),
      user: restaurant.owner,
    };

    const members = [
      ownerMember,
      ...rows.map((r) => ({
        id: r.id,
        restaurantId: r.restaurantId,
        userId: r.userId,
        role: r.role as "owner" | "manager" | "staff",
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    ];

    return Response.json({ members });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new ResponseError(401, "Yetkisiz erişim");
    const { id } = await params;

    // Must be owner to add members.
    const role = await getRoleForRestaurant(user.id, id);
    if (role !== "owner") {
      throw new ResponseError(403, "Bu işlem için yetkiniz yok");
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      throw new ResponseError(400, parsed.error.issues[0].message);
    }

    const { email, role: newRole } = parsed.data;

    // Find the target user by email.
    const targetUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true },
    });
    if (!targetUser) {
      throw new ResponseError(
        404,
        "Kullanıcı bulunamadı. Önce kayıt olmalı."
      );
    }

    // Don't allow adding the owner as a member (they're already the owner).
    const restaurant = await db.restaurant.findUnique({
      where: { id },
      select: { ownerId: true },
    });
    if (!restaurant) throw new ResponseError(404, "Restoran bulunamadı");
    if (restaurant.ownerId === targetUser.id) {
      throw new ResponseError(400, "Bu kullanıcı zaten restoranın sahibi");
    }

    // Upsert the membership (idempotent — if they're already a member, update role).
    const member = await db.restaurantMember.upsert({
      where: {
        restaurantId_userId: {
          restaurantId: id,
          userId: targetUser.id,
        },
      },
      create: {
        restaurantId: id,
        userId: targetUser.id,
        role: newRole,
      },
      update: {
        role: newRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return Response.json({
      member: {
        id: member.id,
        restaurantId: member.restaurantId,
        userId: member.userId,
        role: member.role as "owner" | "manager" | "staff",
        createdAt: member.createdAt.toISOString(),
        user: member.user,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
