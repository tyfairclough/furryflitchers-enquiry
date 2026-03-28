import Link from "next/link";
import { prisma } from "@/server/db";
import { Card } from "@/components/ui/Card";

export default async function AdminEnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      petType: true,
      status: true,
      customerName: true,
      email: true,
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 lg:px-8 lg:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Enquiries</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Latest 50 submissions.
        </p>
      </header>

      <Card>
        <div className="grid gap-2">
          {enquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            enquiries.map((e) => (
              <Link
                key={e.id}
                href={`/admin/enquiries/${e.id}`}
                className="rounded-xl border border-border p-4 hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {e.customerName} · {e.petType}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {e.createdAt.toISOString()}
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.email} · status: {e.status}
                </p>
              </Link>
            ))
          )}
        </div>
      </Card>
    </main>
  );
}

