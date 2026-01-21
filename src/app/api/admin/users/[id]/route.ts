/**
 * Admin User Detail API
 * 
 * GET /api/admin/users/:id - Get user details
 * PATCH /api/admin/users/:id - Update user or perform action
 * DELETE /api/admin/users/:id - Delete user
 */

import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { getAdminUser, hasPermission, PERMISSIONS, logAdminAction, isSuperAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  
  if (!admin || !hasPermission(admin.permissions, PERMISSIONS.USERS_READ)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          domain: true,
        },
      },
      subscriptions: {
        select: {
          id: true,
          planName: true,
          status: true,
          monthlyPrice: true,
          currentPeriodEnd: true,
        },
      },
      supportTickets: {
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      invoices: {
        select: {
          id: true,
          invoiceNumber: true,
          amount: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return NextResponse.json({ user: userWithoutPassword });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  
  if (!admin || !hasPermission(admin.permissions, PERMISSIONS.USERS_WRITE)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action, ...updates } = body;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
    }

    // Prevent editing super_admin unless you are super_admin
    if (user.role === "super_admin" && !isSuperAdmin(admin.role)) {
      return NextResponse.json(
        { error: "Je kunt geen super admin bewerken" },
        { status: 403 }
      );
    }

    let updatedUser;

    // Handle actions
    switch (action) {
      case "toggle_active":
        updatedUser = await prisma.user.update({
          where: { id },
          data: { isActive: !user.isActive },
        });
        await logAdminAction(
          admin.id,
          admin.email,
          "user.toggle_active",
          "user",
          id,
          { isActive: user.isActive },
          { isActive: !user.isActive }
        );
        break;

      case "make_admin":
        if (!isSuperAdmin(admin.role)) {
          return NextResponse.json(
            { error: "Alleen super admins kunnen admin rechten toekennen" },
            { status: 403 }
          );
        }
        updatedUser = await prisma.user.update({
          where: { id },
          data: { role: "admin" },
        });
        await logAdminAction(
          admin.id,
          admin.email,
          "user.make_admin",
          "user",
          id,
          { role: user.role },
          { role: "admin" }
        );
        break;

      case "remove_admin":
        if (!isSuperAdmin(admin.role)) {
          return NextResponse.json(
            { error: "Alleen super admins kunnen admin rechten verwijderen" },
            { status: 403 }
          );
        }
        updatedUser = await prisma.user.update({
          where: { id },
          data: { role: "customer" },
        });
        await logAdminAction(
          admin.id,
          admin.email,
          "user.remove_admin",
          "user",
          id,
          { role: user.role },
          { role: "customer" }
        );
        break;

      case "reset_password":
        // Generate random password
        const newPassword = randomBytes(12).toString("base64").slice(0, 16);
        const hashedPassword = await hashPassword(newPassword);
        
        updatedUser = await prisma.user.update({
          where: { id },
          data: { password: hashedPassword },
        });
        
        await logAdminAction(
          admin.id,
          admin.email,
          "user.reset_password",
          "user",
          id
        );

        // TODO: Send email with new password
        return NextResponse.json({ 
          success: true, 
          message: "Wachtwoord gereset",
          newPassword, // In production, email this instead of returning
        });

      default:
        // Regular update
        const allowedUpdates: Record<string, unknown> = {};
        const allowedFields = ["name", "phone", "companyName", "kvkNumber", "vatNumber", "street", "houseNumber", "postalCode", "city"];
        
        for (const field of allowedFields) {
          if (field in updates) {
            allowedUpdates[field] = updates[field];
          }
        }

        if (Object.keys(allowedUpdates).length > 0) {
          updatedUser = await prisma.user.update({
            where: { id },
            data: allowedUpdates,
          });
          
          await logAdminAction(
            admin.id,
            admin.email,
            "user.update",
            "user",
            id,
            user,
            allowedUpdates
          );
        }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Er is een fout opgetreden" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  
  if (!admin || !hasPermission(admin.permissions, PERMISSIONS.USERS_DELETE)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  // Cannot delete super_admin
  if (user.role === "super_admin") {
    return NextResponse.json(
      { error: "Super admin accounts kunnen niet worden verwijderd" },
      { status: 403 }
    );
  }

  // Cannot delete self
  if (user.id === admin.id) {
    return NextResponse.json(
      { error: "Je kunt je eigen account niet verwijderen" },
      { status: 403 }
    );
  }

  await prisma.user.delete({ where: { id } });

  await logAdminAction(
    admin.id,
    admin.email,
    "user.delete",
    "user",
    id,
    { email: user.email, name: user.name }
  );

  return NextResponse.json({ success: true });
}
