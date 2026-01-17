/**
 * Environment variable validation
 * Ensures all required environment variables are present at startup
 */

interface EnvConfig {
  NEXT_PUBLIC_SITE_URL: string;
  CONTACT_EMAIL?: string;
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
  OPENAI_API_KEY?: string;
  MOLLIE_API_KEY?: string;
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
  
  // MOLLIE_API_KEY for payments
  if (!process.env.MOLLIE_API_KEY) {
    console.warn("⚠️  MOLLIE_API_KEY not set - payment functionality will not work");
  } else if (!process.env.MOLLIE_API_KEY.startsWith("test_") && !process.env.MOLLIE_API_KEY.startsWith("live_")) {
    console.warn("⚠️  MOLLIE_API_KEY format looks incorrect (should start with 'test_' or 'live_')");
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
    CONTACT_EMAIL: process.env.CONTACT_EMAIL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    MOLLIE_API_KEY: process.env.MOLLIE_API_KEY,
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
