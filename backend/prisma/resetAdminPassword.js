// ============================================================
// resetAdminPassword.js
// One-off script: update the ChessHub admin's password without
// touching anything else in the database.
//
// Why this exists: prisma/seed.js's upsert only CREATES the admin
// on a brand-new database — running the seed again against a
// database that's already been seeded and has real lesson content
// in it is not something you want to do just to change a password.
// This script does the one thing you actually want: re-hash and
// update the existing admin row, nothing else touched.
//
// Run:  npm run db:reset-admin-password
// (or:  node prisma/resetAdminPassword.js)
// ============================================================

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@chesshub.com";
const NEW_PASSWORD = "ChessHub@06";

async function main() {
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

  const admin = await prisma.admin.update({
    where: { email: ADMIN_EMAIL },
    data: { passwordHash },
  });

  console.log(`✅ Password updated for ${admin.email}`);
  console.log(`   New login: ${admin.email} / ${NEW_PASSWORD}`);
}

main()
  .catch((err) => {
    if (err.code === "P2025") {
      console.error(
        `❌ No admin found with email "${ADMIN_EMAIL}". ` +
          `Run "npm run db:seed" first to create one.`,
      );
    } else {
      console.error("❌ Failed to update admin password:", err.message);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
