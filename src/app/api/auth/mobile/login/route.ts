import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { sign } from 'jsonwebtoken';

const LoginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(1, 'Wachtwoord is verplicht'),
});

// JWT secret - MUST be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
}

export async function POST(request: NextRequest) {
  try {
    // Check if JWT_SECRET is configured
    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: 'Authenticatie is niet geconfigureerd' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validated = LoginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Geen account gevonden met dit e-mailadres' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Je account is gedeactiveerd. Neem contact op met support.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(validated.password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Onjuist wachtwoord' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data and token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        companyName: user.companyName,
        role: user.role,
      },
      token,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validatie mislukt', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Mobile login error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het inloggen' },
      { status: 500 }
    );
  }
}
