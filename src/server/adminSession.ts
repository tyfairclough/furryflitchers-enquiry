import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type AdminSession = {
  adminUserId?: string;
};

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_PASSWORD;
  if (!password || password.length < 32) {
    throw new Error("SESSION_PASSWORD must be set (min 32 chars)");
  }

  return {
    cookieName: "ff_admin_session",
    password,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  };
}

export async function getAdminSession() {
  return getIronSession<AdminSession>(await cookies(), sessionOptions());
}

