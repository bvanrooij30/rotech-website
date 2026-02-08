import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n🔧 Fixing user roles...\n");
  
  // Find users with incorrect role casing
  const users = await prisma.user.findMany({
    where: {
      role: {
        not: { in: ["customer", "admin", "super_admin"] }
      }
    }
  });
  
  if (users.length === 0) {
    console.log("✅ No users with incorrect role casing found.\n");
  } else {
    console.log(`Found ${users.length} user(s) with incorrect role casing:\n`);
    
    for (const user of users) {
      const oldRole = user.role;
      let newRole = user.role.toLowerCase();
      
      // Normalize to correct values
      if (newRole === "admin" || newRole === "superadmin" || newRole === "super_admin") {
        newRole = "super_admin";
      } else if (newRole !== "customer") {
        newRole = "customer";
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { role: newRole }
      });
      
      console.log(`  ${user.email}: "${oldRole}" → "${newRole}"`);
    }
    
    console.log("\n✅ All roles fixed!\n");
  }
  
  // Show current state
  const allUsers = await prisma.user.findMany({
    select: { email: true, role: true, isActive: true }
  });
  
  console.log("Current users:");
  allUsers.forEach(u => {
    console.log(`  ${u.email} - Role: ${u.role}, Active: ${u.isActive}`);
  });
  console.log("");
}

main()
  .catch((e) => console.error("Error:", e))
  .finally(() => prisma.$disconnect());
