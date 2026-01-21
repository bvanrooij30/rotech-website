/**
 * Token utilities for password reset and email verification
 */

import crypto from "crypto";
import prisma from "./prisma";

// Token expiration times
export const TOKEN_EXPIRY = {
  passwordReset: 60 * 60 * 1000, // 1 hour
  emailVerification: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export type TokenType = keyof typeof TOKEN_EXPIRY;

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a verification token and store it in the database
 */
export async function createVerificationToken(
  identifier: string,
  type: TokenType
): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + TOKEN_EXPIRY[type]);

  // Delete any existing tokens for this identifier
  await prisma.verificationToken.deleteMany({
    where: { identifier: `${type}:${identifier}` },
  });

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: `${type}:${identifier}`,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify a token and return the identifier if valid
 */
export async function verifyToken(
  token: string,
  type: TokenType
): Promise<string | null> {
  const record = await prisma.verificationToken.findFirst({
    where: {
      token,
      identifier: { startsWith: `${type}:` },
      expires: { gt: new Date() },
    },
  });

  if (!record) {
    return null;
  }

  // Extract the actual identifier (remove type prefix)
  const identifier = record.identifier.replace(`${type}:`, "");

  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: record.identifier,
        token,
      },
    },
  });

  return identifier;
}

/**
 * Delete all expired tokens (cleanup job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.verificationToken.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });

  return result.count;
}
