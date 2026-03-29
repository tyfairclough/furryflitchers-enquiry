import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createAdapter() {
  const connectionString = process.env.DATABASE_URL;
  // #region agent log
  fetch("http://127.0.0.1:7843/ingest/5ec9ede7-310b-411e-9b5a-829c3425a0fe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "c266af",
    },
    body: JSON.stringify({
      sessionId: "c266af",
      runId: "post-fix",
      hypothesisId: "B",
      location: "db.ts:createAdapter",
      message: "createAdapter",
      data: { hasDatabaseUrl: Boolean(connectionString) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
