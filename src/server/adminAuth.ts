import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { getAdminSession } from "@/server/adminSession";

export async function requireAdminUser() {
  const session = await getAdminSession();
  if (!session.adminUserId) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({
    where: { id: session.adminUserId },
    select: { id: true, username: true, role: true, active: true },
  });
  if (!user || !user.active) redirect("/admin/login");
  return user;
}

