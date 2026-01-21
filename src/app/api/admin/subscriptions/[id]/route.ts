/**
 * Admin Subscription Detail API
 * 
 * GET /api/admin/subscriptions/:id - Get subscription details
 * PATCH /api/admin/subscriptions/:id - Update subscription
 * DELETE /api/admin/subscriptions/:id - Cancel subscription
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, hasPermission, PERMISSIONS, logAdminAction } from "@/lib/admin";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  
  if (!admin || !hasPermission(admin.permissions, PERMISSIONS.SUBSCRIPTIONS_READ)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          companyName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          domain: true,
        },
      },
      usageLogs: {
        orderBy: { date: "desc" },
        take: 20,
      },
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Abonnement niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({ subscription });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  
  if (!admin || !hasPermission(admin.permissions, PERMISSIONS.SUBSCRIPTIONS_WRITE)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action, ...updates } = body;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Abonnement niet gevonden" }, { status: 404 });
    }

    let updatedSubscription;

    switch (action) {
      case "cancel":
        updatedSubscription = await prisma.subscription.update({
          where: { id },
          data: {
            status: "cancelled",
            cancelledAt: new Date(),
            cancelAtPeriodEnd: true,
          },
        });
        await logAdminAction(
          admin.id,
          admin.email,
          "subscription.cancel",
          "subscription",
          id,
          { status: subscription.status },
          { status: "cancelled" }
        );
        break;

      case "pause":
        updatedSubscription = await prisma.subscription.update({
          where: { id },
          data: { status: "paused" },
        });
        await logAdminAction(
          admin.id,
          admin.email,
          "subscription.pause",
          "subscription",
          id
        );
        break;

      case "resume":
        updatedSubscription = await prisma.subscription.update({
          where: { id },
          data: { status: "active", cancelAtPeriodEnd: false },
        });
        await logAdminAction(
          admin.id,
          admin.email,
          "subscription.resume",
          "subscription",
          id
        );
        break;

      case "add_usage":
        const { description, hours, category } = updates;
        
        if (!description || !hours) {
          return NextResponse.json(
            { error: "Beschrijving en uren zijn verplicht" },
            { status: 400 }
          );
        }

        await prisma.usageLog.create({
          data: {
            subscriptionId: id,
            description,
            hours: parseFloat(hours),
            category: category || "update",
          },
        });

        updatedSubscription = await prisma.subscription.update({
          where: { id },
          data: {
            hoursUsed: { increment: parseFloat(hours) },
          },
        });

        await logAdminAction(
          admin.id,
          admin.email,
          "subscription.add_usage",
          "subscription",
          id,
          undefined,
          { description, hours }
        );
        break;

      case "reset_hours":
        updatedSubscription = await prisma.subscription.update({
          where: { id },
          data: { hoursUsed: 0 },
        });
        await logAdminAction(
          admin.id,
          admin.email,
          "subscription.reset_hours",
          "subscription",
          id
        );
        break;

      default:
        // Regular update
        const allowedFields = ["planType", "planName", "monthlyPrice", "hoursIncluded", "status"];
        const allowedUpdates: Record<string, unknown> = {};
        
        for (const field of allowedFields) {
          if (field in updates) {
            allowedUpdates[field] = updates[field];
          }
        }

        if (Object.keys(allowedUpdates).length > 0) {
          updatedSubscription = await prisma.subscription.update({
            where: { id },
            data: allowedUpdates,
          });
          
          await logAdminAction(
            admin.id,
            admin.email,
            "subscription.update",
            "subscription",
            id,
            subscription,
            allowedUpdates
          );
        }
    }

    return NextResponse.json({ success: true, subscription: updatedSubscription });
  } catch (error) {
    console.error("Update subscription error:", error);
    return NextResponse.json({ error: "Er is een fout opgetreden" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  
  if (!admin || !hasPermission(admin.permissions, PERMISSIONS.SUBSCRIPTIONS_DELETE)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    select: { id: true, userId: true, planName: true },
  });

  if (!subscription) {
    return NextResponse.json({ error: "Abonnement niet gevonden" }, { status: 404 });
  }

  await prisma.subscription.delete({ where: { id } });

  await logAdminAction(
    admin.id,
    admin.email,
    "subscription.delete",
    "subscription",
    id,
    { planName: subscription.planName }
  );

  return NextResponse.json({ success: true });
}
