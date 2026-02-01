import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function generatePassword(): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const buffer = randomBytes(16);
  let password = "";
  
  for (let i = 0; i < 16; i++) {
    password += chars[buffer[i] % chars.length];
  }
  
  return password;
}

async function main() {
  const email = "bart@rotech.dev";
  const newPassword = generatePassword();
  const hashedPassword = await hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log("\n");
  console.log("=".repeat(50));
  console.log("  ADMIN WACHTWOORD GERESET");
  console.log("=".repeat(50));
  console.log("");
  console.log(`  Email:      ${email}`);
  console.log(`  Wachtwoord: ${newPassword}`);
  console.log("");
  console.log("  SLA DIT WACHTWOORD NU OP!");
  console.log("  Het wordt niet opnieuw getoond.");
  console.log("");
  console.log("=".repeat(50));
  console.log("");
  console.log("  Login: http://localhost:3000/portal/login");
  console.log("  Admin: http://localhost:3000/admin");
  console.log("");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
