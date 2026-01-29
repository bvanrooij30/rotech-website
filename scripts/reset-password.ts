import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "bart@ro-techdevelopment.dev";
  const newPassword = "admin123";
  
  // Hash met bcryptjs (zelfde als auth.ts)
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  console.log("\nHashing password...");
  console.log("Plain password:", newPassword);
  console.log("Hashed:", hashedPassword);
  
  // Verify it works
  const testVerify = await bcrypt.compare(newPassword, hashedPassword);
  console.log("Verification test:", testVerify ? "PASSED" : "FAILED");
  
  const user = await prisma.user.update({
    where: { email },
    data: { 
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  
  console.log("\n✅ Wachtwoord gereset!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Email:      ${user.email}`);
  console.log(`Wachtwoord: ${newPassword}`);
  console.log(`Role:       ${user.role}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => console.error("Error:", e.message))
  .finally(() => prisma.$disconnect());
