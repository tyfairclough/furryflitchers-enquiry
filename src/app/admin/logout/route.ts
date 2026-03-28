import { NextResponse } from "next/server";
import { getAdminSession } from "@/server/adminSession";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getAdminSession();
  session.destroy();
  await session.save();
  const url = new URL("/admin/login", req.url);
  return NextResponse.redirect(url);
}

