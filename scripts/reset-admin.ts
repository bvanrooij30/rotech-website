import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔧 Resetting admin account...\n");
  
  // Delete the extra account
  const deleted = await prisma.user.deleteMany({
    where: {
      email: { not: "bart@rotech.dev" }
    }
  });
  
  if (deleted.count > 0) {
    console.log(`🗑️  Deleted ${deleted.count} extra account(s)`);
  }
  
  // Reset password for main admin
  const newPassword = "RoTech2026!";
  const hashedPassword = await hash(newPassword, 12);
  
  const user = await prisma.user.update({
    where: { email: "bart@rotech.dev" },
    data: {
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
      emailVerified: new Date(),
    }
  });
  
  console.log("✅ Admin account reset successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`   Email:    ${user.email}`);
  console.log(`   Password: ${newPassword}`);
  console.log(`   Role:     ${user.role}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("🚀 Login at: http://localhost:3000/portal/login\n");
}

main()
  .catch((e) => console.error("Error:", e))
  .finally(() => prisma.$disconnect());
