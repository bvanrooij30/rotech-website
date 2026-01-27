/**
 * Environment variable validation
 * Ensures all required environment variables are present at startup
 * 
 * Auth.js v5 (NextAuth v5) uses:
 * - AUTH_SECRET (required) - for signing tokens
 * - AUTH_URL (optional) - auto-detected from request headers
 * - AUTH_TRUST_HOST (for Vercel deployments)
 */

interface EnvConfig {
  NEXT_PUBLIC_SITE_URL: string;
  AUTH_SECRET?: string;
  AUTH_URL?: string;
  DATABASE_URL?: string;
  CONTACT_EMAIL?: string;
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
  OPENAI_API_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  // Admin account (auto-created if not exists)
  SUPER_ADMIN_EMAIL?: string;
  SUPER_ADMIN_PASSWORD?: string;
  SUPER_ADMIN_NAME?: string;
}

/**
 * Validate required environment variables
 * Throws error if critical variables are missing
 */
export function validateEnv(): void {
  const errors: string[] = [];
  
  // Required variables
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    errors.push("NEXT_PUBLIC_SITE_URL is required");
  } else {
    // Validate URL format
    try {
      new URL(process.env.NEXT_PUBLIC_SITE_URL);
    } catch {
      errors.push("NEXT_PUBLIC_SITE_URL must be a valid URL");
    }
  }
  
  // NextAuth Configuration (critical for login functionality)
  const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!authSecret) {
    console.warn("⚠️  NEXTAUTH_SECRET not set - authentication will NOT work!");
    console.warn("   Generate one with: openssl rand -base64 32");
  } else if (authSecret.length < 32) {
    console.warn("⚠️  NEXTAUTH_SECRET should be at least 32 characters for security");
  }
  
  // Database
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL not set - database features will not work");
  }
  
  // Optional but recommended
  if (!process.env.CONTACT_EMAIL) {
    console.warn("⚠️  CONTACT_EMAIL not set - email functionality will not work");
  } else {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(process.env.CONTACT_EMAIL)) {
      errors.push("CONTACT_EMAIL must be a valid email address");
    }
  }
  
  // RESEND_API_KEY is optional (email code is commented out)
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_")) {
    console.warn("⚠️  RESEND_API_KEY format looks incorrect (should start with 're_')");
  }
  
  // FROM_EMAIL validation if RESEND_API_KEY is set
  if (process.env.RESEND_API_KEY && !process.env.FROM_EMAIL) {
    console.warn("⚠️  FROM_EMAIL not set - email sending may fail");
  }
  
  // OPENAI_API_KEY for chatbot
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️  OPENAI_API_KEY not set - AI chatbot will not work");
  } else if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
    console.warn("⚠️  OPENAI_API_KEY format looks incorrect (should start with 'sk-')");
  }
  
  // STRIPE_SECRET_KEY for payments
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("⚠️  STRIPE_SECRET_KEY not set - payment functionality will not work");
  } else if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_test_") && !process.env.STRIPE_SECRET_KEY.startsWith("sk_live_")) {
    console.warn("⚠️  STRIPE_SECRET_KEY format looks incorrect (should start with 'sk_test_' or 'sk_live_')");
  }
  
  // STRIPE_WEBHOOK_SECRET for webhook verification
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn("⚠️  STRIPE_WEBHOOK_SECRET not set - webhook verification will be disabled");
  } else if (!process.env.STRIPE_WEBHOOK_SECRET.startsWith("whsec_")) {
    console.warn("⚠️  STRIPE_WEBHOOK_SECRET format looks incorrect (should start with 'whsec_')");
  }
  
  // Super admin auto-creation
  if (process.env.SUPER_ADMIN_EMAIL && !process.env.SUPER_ADMIN_PASSWORD) {
    console.warn("⚠️  SUPER_ADMIN_EMAIL set but SUPER_ADMIN_PASSWORD missing - admin will not be created");
  }
  if (process.env.SUPER_ADMIN_PASSWORD && process.env.SUPER_ADMIN_PASSWORD.length < 8) {
    console.warn("⚠️  SUPER_ADMIN_PASSWORD should be at least 8 characters");
  }
  
  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
  }
}

/**
 * Get validated environment config
 */
export function getEnvConfig(): EnvConfig {
  return {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.dev",
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME,
  };
}

// Validate on module load (only in production)
if (process.env.NODE_ENV === "production") {
  try {
    validateEnv();
  } catch (error) {
    console.error("❌ Environment validation failed:", error);
    // Don't throw in production to prevent startup failure
    // But log the error clearly
  }
}
