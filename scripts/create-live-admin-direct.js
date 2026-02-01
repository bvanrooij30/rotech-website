/**
 * Create admin on LIVE Supabase database using direct PostgreSQL
 */
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = "postgresql://postgres:RoTech2026Secure@db.oquboszkaouefpqamuzw.supabase.co:5432/postgres";

async function main() {
  console.log("\n🔌 Connecting to LIVE Supabase database...\n");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Connected to database!\n");

    const email = "bart@rotech.dev";
    const password = "RoTech2026!";
    const name = "Bart van Rooij";
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user exists
    const existingResult = await client.query(
      'SELECT id, role FROM "User" WHERE email = $1',
      [email]
    );

    if (existingResult.rows.length > 0) {
      // Update existing user
      await client.query(
        'UPDATE "User" SET password = $1, role = $2, "isActive" = true, "emailVerified" = NOW() WHERE email = $3',
        [hashedPassword, 'super_admin', email]
      );
      console.log("✅ Bestaande gebruiker geüpgraded naar super_admin!");
    } else {
      // Create new user
      await client.query(
        `INSERT INTO "User" (id, email, password, name, role, "isActive", "emailVerified", "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW(), NOW())`,
        [email, hashedPassword, name, 'super_admin']
      );
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

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

main();
