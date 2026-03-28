import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function adapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return new PrismaMariaDb(url);
}

async function main() {
  const username = process.env.ADMIN_SEED_USERNAME;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_SEED_USERNAME and ADMIN_SEED_PASSWORD are required");
  }

  const prisma = new PrismaClient({ adapter: adapter() });
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { username },
    create: { username, passwordHash, active: true, role: "admin" },
    update: { passwordHash, active: true },
  });
  await prisma.$disconnect();
  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${username}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

