/**
 * Safe user lookup - handles session ID mismatch with database ID
 * Uses email as fallback when ID lookup fails
 */
import prisma from "./prisma";
import { auth } from "./auth";

/**
 * Get the authenticated user's database ID
 * Handles the case where NextAuth session ID doesn't match the database ID
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user) return null;

    // Try ID first
    const byId = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    if (byId) return byId.id;

    // Fallback to email
    if (session.user.email) {
      const byEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (byEmail) return byEmail.id;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get the authenticated user with full profile
 */
export async function getAuthenticatedUser() {
  try {
    const session = await auth();
    if (!session?.user) return null;

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user && session.user.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    return user;
  } catch {
    return null;
  }
}
