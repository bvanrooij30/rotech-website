#!/usr/bin/env ts-node
/**
 * Create Admin Account Script
 * 
 * Usage:
 *   npx ts-node scripts/create-admin.ts
 * 
 * Or with specific values:
 *   ADMIN_EMAIL=your@email.com ADMIN_NAME="Your Name" npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import * as readline from "readline";

const prisma = new PrismaClient();

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const buffer = randomBytes(20);
  let password = "";
  
  for (let i = 0; i < 20; i++) {
    password += chars[buffer[i] % chars.length];
  }
  
  return password;
}

async function main() {
  console.log("\n🔐 Create Admin Account\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get email
  let email = process.env.ADMIN_EMAIL;
  if (!email) {
    email = await prompt("Email: ");
  } else {
    console.log(`Email: ${email}`);
  }

  // Validate email
  if (!email || !email.includes("@")) {
    console.error("❌ Invalid email address");
    process.exit(1);
  }

  // Check if exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.error(`❌ User with email ${email} already exists`);
    
    if (existing.role !== "super_admin") {
      const upgrade = await prompt("Upgrade to super_admin? (y/n): ");
      
      if (upgrade.toLowerCase() === "y") {
        await prisma.user.update({
          where: { email },
          data: { role: "super_admin" },
        });
        console.log("\n✅ User upgraded to super_admin!");
      }
    }
    
    process.exit(0);
  }

  // Get name
  let name = process.env.ADMIN_NAME;
  if (!name) {
    name = await prompt("Name: ");
  } else {
    console.log(`Name: ${name}`);
  }

  // Generate or get password
  let password = process.env.ADMIN_PASSWORD;
  const useGenerated = !password;
  
  if (!password) {
    password = generatePassword();
  }

  const hashedPassword = await hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name: name || "Admin",
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ Super Admin account created!\n");
  console.log(`   Email:    ${user.email}`);
  console.log(`   Name:     ${user.name}`);
  
  if (useGenerated) {
    console.log(`   Password: ${password}`);
    console.log("\n   ⚠️  SAVE THIS PASSWORD - it will not be shown again!");
  }
  
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n🚀 Login at: http://localhost:3000/portal/login");
  console.log("   Then go to: http://localhost:3000/admin\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
