import { requireAdminUser } from "@/server/adminAuth";
import { AdminDeskSidebar } from "@/components/admin/AdminDeskSidebar";

export default async function AdminDeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  return (
    <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col bg-background lg:flex-row">
      <AdminDeskSidebar username={user.username} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
