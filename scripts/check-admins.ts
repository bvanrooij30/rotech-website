import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { 
      role: { in: ["admin", "super_admin"] } 
    },
    select: { 
      email: true, 
      name: true, 
      role: true 
    }
  });

  console.log("\n=== ADMIN ACCOUNTS ===\n");
  
  if (admins.length === 0) {
    console.log("Geen admin accounts gevonden.");
    console.log("\nMaak er een aan met:");
    console.log("  npm run admin:create");
  } else {
    admins.forEach(admin => {
      console.log(`Email: ${admin.email}`);
      console.log(`Name:  ${admin.name}`);
      console.log(`Role:  ${admin.role}`);
      console.log("");
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
