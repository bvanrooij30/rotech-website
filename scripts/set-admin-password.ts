import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "bart@rotech.dev";
  const newPassword = "RoTech2026!";  // Makkelijk te onthouden wachtwoord
  const hashedPassword = await hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log("\n");
  console.log("=".repeat(50));
  console.log("  ADMIN WACHTWOORD INGESTELD");
  console.log("=".repeat(50));
  console.log("");
  console.log(`  Email:      ${email}`);
  console.log(`  Wachtwoord: ${newPassword}`);
  console.log("");
  console.log("=".repeat(50));
  console.log("");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
