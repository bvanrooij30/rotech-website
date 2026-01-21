import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, companyName, kvkNumber, vatNumber, street, houseNumber, postalCode, city } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(companyName !== undefined && { companyName: companyName || null }),
        ...(kvkNumber !== undefined && { kvkNumber: kvkNumber || null }),
        ...(vatNumber !== undefined && { vatNumber: vatNumber || null }),
        ...(street !== undefined && { street: street || null }),
        ...(houseNumber !== undefined && { houseNumber: houseNumber || null }),
        ...(postalCode !== undefined && { postalCode: postalCode || null }),
        ...(city !== undefined && { city: city || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Failed to update account:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
