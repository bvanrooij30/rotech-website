import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import prisma from "./prisma";
import { isRateLimited, recordAttempt, resetRateLimit } from "./rate-limiter";

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Track if admin has been ensured this session
let adminEnsured = false;

/**
 * Ensure super admin account exists
 * Creates admin from environment variables if not present
 */
async function ensureSuperAdmin(): Promise<void> {
  // Only run once per server instance
  if (adminEnsured) return;
  
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const adminName = process.env.SUPER_ADMIN_NAME || "Ro-Tech Admin";
  
  // Skip if env vars not configured
  if (!adminEmail || !adminPassword) {
    adminEnsured = true;
    return;
  }
  
  try {
    // Check if super admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "super_admin" },
    });
    
    if (!existingAdmin) {
      // Create super admin from env vars
      const hashedPassword = await hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail.toLowerCase(),
          name: adminName,
          password: hashedPassword,
          role: "super_admin",
          isActive: true,
          emailVerified: new Date(),
        },
      });
      
      console.log("✅ Super admin created from environment variables:", adminEmail);
    }
    
    adminEnsured = true;
  } catch (error) {
    // Log but don't throw - app should still work
    console.error("Failed to ensure super admin:", error);
    adminEnsured = true;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Explicit secret configuration (supports both AUTH_SECRET and NEXTAUTH_SECRET)
  secret: (() => {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("AUTH_SECRET of NEXTAUTH_SECRET is verplicht in production");
      }
      console.warn("⚠️  AUTH_SECRET niet gevonden - gebruik development fallback (NIET voor production!)");
      return "development-secret-DO-NOT-USE-IN-PRODUCTION";
    }
    return secret;
  })(),
  // Trust host for Vercel deployments (required for NextAuth v5)
  trustHost: true,
  pages: {
    signIn: "/portal/login",
    error: "/portal/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vul je e-mailadres en wachtwoord in");
        }

        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;

        // Check rate limit by email
        const rateCheck = isRateLimited(email, "login");
        if (rateCheck.limited) {
          const minutes = Math.ceil((rateCheck.retryAfter || 900) / 60);
          throw new Error(`Te veel inlogpogingen. Probeer het over ${minutes} minuten opnieuw.`);
        }

        // Ensure super admin exists on first login attempt
        await ensureSuperAdmin();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Record failed attempt even for non-existent users
          recordAttempt(email, "login");
          throw new Error("Onjuiste inloggegevens");
        }

        if (!user.isActive) {
          throw new Error("Je account is gedeactiveerd. Neem contact op met support.");
        }

        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
          // Record failed attempt
          recordAttempt(email, "login");
          throw new Error("Onjuiste inloggegevens");
        }

        // Reset rate limit on successful login
        resetRateLimit(email, "login");

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
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
