import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createAdapter() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  const url = new URL(connectionString);

  // Local MySQL servers commonly require explicit public-key retrieval for
  // password auth (caching_sha2_password). Without this, connection setup
  // fails and Prisma surfaces pool timeout errors.
  if (
    (url.protocol === "mysql:" || url.protocol === "mariadb:") &&
    !url.searchParams.has("allowPublicKeyRetrieval")
  ) {
    url.searchParams.set("allowPublicKeyRetrieval", "true");
  }

  return new PrismaMariaDb(url.toString());
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    adapter: createAdapter(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
