import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

// Log auth configuration status at startup
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (!authSecret) {
  console.error("[AUTH] ❌ CRITICAL: No AUTH_SECRET or NEXTAUTH_SECRET found!");
} else {
  console.log("[AUTH] ✓ Auth secret configured, length:", authSecret.length);
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === "development", // Enable debug in dev
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("[AUTH] Authorize called with email:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("[AUTH] Missing credentials");
            throw new Error("Vul je e-mailadres en wachtwoord in");
          }

          const email = (credentials.email as string).toLowerCase();
          const password = credentials.password as string;

          console.log("[AUTH] Looking up user:", email);
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log("[AUTH] User not found:", email);
            throw new Error("Geen account gevonden met dit e-mailadres");
          }

          console.log("[AUTH] User found:", user.id, "Active:", user.isActive);

          if (!user.isActive) {
            throw new Error("Je account is gedeactiveerd. Neem contact op met support.");
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          if (!isPasswordValid) {
            console.log("[AUTH] Invalid password for user:", email);
            throw new Error("Onjuist wachtwoord");
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          console.log("[AUTH] Login successful for:", email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH] Authorize error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
        token.role = user.role ?? "customer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "customer";
      }
      return session;
    },
  },
  pages: {
    signIn: "/portal/login",
    error: "/portal/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dagen
  },
  secret: authSecret,
  trustHost: true, // Required for Vercel deployments
});

// Extended types for NextAuth
declare module "next-auth" {
  interface User {
    role?: string;
  }
  
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}
