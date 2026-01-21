/**
 * Database Seed Script
 * 
 * Creates the super admin account and initial system settings.
 * 
 * Usage:
 *   npx ts-node prisma/seed.ts
 * 
 * Or add to package.json:
 *   "prisma": { "seed": "ts-node prisma/seed.ts" }
 * 
 * Then run:
 *   npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

// Configuration - UPDATE THESE VALUES
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@ro-techdevelopment.dev";
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || "Ro-Tech Admin";

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Generate or use provided password
  const generatedPassword = process.env.SUPER_ADMIN_PASSWORD || generateSecurePassword();
  const hashedPassword = await hash(generatedPassword, 12);

  // Check if super admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "super_admin" },
  });

  if (existingAdmin) {
    console.log("⚠️  Super admin already exists:", existingAdmin.email);
    console.log("   Skipping super admin creation.\n");
  } else {
    // Create super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: SUPER_ADMIN_EMAIL,
        name: SUPER_ADMIN_NAME,
        password: hashedPassword,
        role: "super_admin",
        isActive: true,
        emailVerified: new Date(),
      },
    });

    console.log("✅ Super Admin created successfully!");
    console.log("   Email:", superAdmin.email);
    console.log("   Password:", generatedPassword);
    console.log("\n   ⚠️  IMPORTANT: Save this password securely!");
    console.log("   It will not be shown again.\n");
  }

  // Create initial system settings
  const defaultSettings = [
    { key: "site_name", value: JSON.stringify("Ro-Tech Development"), category: "general" },
    { key: "contact_email", value: JSON.stringify("contact@ro-techdevelopment.dev"), category: "general" },
    { key: "support_email", value: JSON.stringify("support@ro-techdevelopment.dev"), category: "general" },
    { key: "maintenance_mode", value: JSON.stringify(false), category: "general" },
    { key: "api_rate_limit", value: JSON.stringify(100), category: "security" },
    { key: "session_timeout", value: JSON.stringify(30 * 24 * 60 * 60), category: "security" },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("✅ System settings initialized\n");

  console.log("🎉 Database seed completed successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Next steps:");
  console.log("  1. Start the development server: npm run dev");
  console.log("  2. Navigate to: http://localhost:3000/admin");
  console.log("  3. Login with the super admin credentials above");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

function generateSecurePassword(): string {
  // Generate a secure 16-character password
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const randomBytesBuffer = randomBytes(16);
  let password = "";
  
  for (let i = 0; i < 16; i++) {
    password += chars[randomBytesBuffer[i] % chars.length];
  }
  
  return password;
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
