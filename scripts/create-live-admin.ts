/**
 * Create admin on LIVE Supabase database
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

// Live Supabase database URL
const DATABASE_URL = "postgresql://postgres:RoTech2026Secure@db.oquboszkaouefpqamuzw.supabase.co:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  console.log("\n🔌 Connecting to LIVE Supabase database...\n");

  const email = "bart@rotech.dev";
  const password = "RoTech2026!";
  const name = "Bart van Rooij";

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  const hashedPassword = await hash(password, 12);

  if (existing) {
    // Update existing user
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: "super_admin",
        isActive: true,
        emailVerified: new Date(),
      },
    });
    console.log("✅ Bestaande gebruiker geüpgraded naar super_admin!");
  } else {
    // Create new user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "super_admin",
        isActive: true,
        emailVerified: new Date(),
      },
    });
    console.log("✅ Nieuwe super_admin aangemaakt!");
  }

  console.log("\n" + "=".repeat(50));
  console.log("  LIVE ADMIN CREDENTIALS");
  console.log("=".repeat(50));
  console.log("");
  console.log(`  Email:      ${email}`);
  console.log(`  Wachtwoord: ${password}`);
  console.log("");
  console.log("=".repeat(50));
  console.log("");
  console.log("  Login: https://ro-techdevelopment.dev/portal/login");
  console.log("  Admin: https://ro-techdevelopment.dev/admin");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
  })
  .finally(() => prisma.$disconnect());
