/**
 * Admin Users API
 * 
 * GET /api/admin/users - List all users (with pagination)
 * POST /api/admin/users - Create new user
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, hashPassword } from "@/lib/auth";
import { getAdminUser, hasPermission, PERMISSIONS, logAdminAction } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  role: z.enum(["customer", "admin"]).default("customer"),
});

export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  
  if (!admin || !hasPermission(admin.permissions, PERMISSIONS.USERS_READ)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";

  const where = {
    AND: [
      search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      } : {},
      role ? { role } : {},
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        companyName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { products: true, subscriptions: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  
  if (!admin || !hasPermission(admin.permissions, PERMISSIONS.USERS_WRITE)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Er bestaat al een gebruiker met dit e-mailadres" },
        { status: 400 }
      );
    }

    // Only super_admin can create admins
    if (data.role === "admin" && admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Alleen super admins kunnen admin accounts aanmaken" },
        { status: 403 }
      );
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        companyName: data.companyName,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    await logAdminAction(
      admin.id,
      admin.email,
      "user.create",
      "user",
      user.id,
      undefined,
      { email: user.email, name: user.name, role: user.role }
    );

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Er is een fout opgetreden" }, { status: 500 });
  }
}
