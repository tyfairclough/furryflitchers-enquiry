import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET() {
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
      hypothesisId: "D",
      location: "route.ts:GET:entry",
      message: "GET /api/breeds/catalog entered",
      data: { nodeEnv: process.env.NODE_ENV },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  try {
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
        hypothesisId: "C",
        location: "route.ts:GET:before-query",
        message: "before findMany (no unstable_cache)",
        data: {},
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const rows = await prisma.breedRule.findMany({
      where: { active: true },
      select: { breedName: true },
      orderBy: { breedName: "asc" },
    });
    const breeds = rows.map((r) => r.breedName);
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
        hypothesisId: "C",
        location: "route.ts:GET:after-query",
        message: "findMany ok",
        data: { rowCount: rows.length, breedCount: breeds.length },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return NextResponse.json({ breeds });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : "unknown";
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
        hypothesisId: "A",
        location: "route.ts:GET:catch",
        message: "GET handler threw",
        data: { errorName: name, errorMessage: msg.slice(0, 500) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw err;
  }
}
