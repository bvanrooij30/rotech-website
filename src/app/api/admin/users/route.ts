import { NextResponse } from "next/server";
import { requirePermission, PERMISSIONS, logAdminAction } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Ongeldig email adres"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters zijn"),
  name: z.string().min(1, "Naam is verplicht"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  kvkNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(["customer", "admin", "super_admin"]).default("customer"),
});

// GET - List all users (with filters)
export async function GET(request: Request) {
  try {
    await requirePermission(PERMISSIONS.USERS_READ);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { companyName: { contains: search } },
          ],
        } : {},
        role ? { role } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
            select: {
              products: true,
              subscriptions: true,
              supportTickets: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Fout bij ophalen gebruikers" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: Request) {
  try {
    const admin = await requirePermission(PERMISSIONS.USERS_WRITE);

    const body = await request.json();
    const validated = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email is al in gebruik" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
        phone: validated.phone || null,
        companyName: validated.companyName || null,
        kvkNumber: validated.kvkNumber || null,
        vatNumber: validated.vatNumber || null,
        street: validated.street || null,
        houseNumber: validated.houseNumber || null,
        postalCode: validated.postalCode || null,
        city: validated.city || null,
        role: validated.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Log admin action
    await logAdminAction(
      admin.id,
      admin.email,
      "user.create",
      "user",
      user.id,
      undefined,
      user as unknown as Record<string, unknown>
    );

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validatiefout" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Fout bij aanmaken gebruiker" },
      { status: error.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
