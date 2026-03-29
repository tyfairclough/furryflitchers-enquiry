import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { Card } from "@/components/ui/Card";
import { formatDogAgeBand } from "@/lib/dogAgeDisplay";

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      dogs: { include: { breedRule: true } },
      cat: true,
      smallPets: { include: { animalType: true } },
    },
  });

  if (!enquiry) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 lg:px-8 lg:py-10">
      <header className="mb-8">
        <p className="text-xs font-medium text-muted-foreground">Enquiry</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {enquiry.customerName}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {enquiry.petType} · {enquiry.createdAt.toISOString()}
        </p>
      </header>

      <Card>
        <div className="grid gap-6 text-sm text-foreground">
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Customer
            </p>
            <p className="mt-2 font-semibold">{enquiry.customerName}</p>
            <p className="mt-1 text-muted-foreground">{enquiry.phone}</p>
            <p className="mt-1 text-muted-foreground">{enquiry.email}</p>
            <p className="mt-1 text-muted-foreground">
              Agreed to terms: {enquiry.agreedToTerms ? "yes" : "no"}
            </p>
          </section>

          {enquiry.petType === "dog" ? (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Dogs
              </p>
              <div className="mt-2 grid gap-2">
                {enquiry.dogs.map((d) => (
                  <div key={d.id} className="rounded-xl border border-border p-3">
                    <p className="font-semibold">{d.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d.breedRule?.breedName ?? "—"} · {formatDogAgeBand(d.ageMonths)} ·{" "}
                      {d.sex} ·{" "}
                      {d.neutered ? "neutered" : "not neutered"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      suitability: {d.suitability}
                      {d.rejectionReasonCode ? ` (${d.rejectionReasonCode})` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {enquiry.petType === "cat" && enquiry.cat ? (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cat
              </p>
              <div className="mt-2 rounded-xl border border-border p-3">
                <p className="font-semibold">{enquiry.cat.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  service: {enquiry.cat.service}
                </p>
              </div>
            </section>
          ) : null}

          {enquiry.petType === "smallPet" ? (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Small pets
              </p>
              <div className="mt-2 grid gap-2">
                {enquiry.smallPets.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-3">
                    <p className="font-semibold">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      type: {p.animalType?.name ?? "—"} · service: {p.service}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Raw submission
            </p>
            <pre className="mt-2 max-h-96 overflow-auto rounded-xl border border-border bg-muted/30 p-3 text-xs">
              {JSON.stringify(enquiry.rawSubmission ?? {}, null, 2)}
            </pre>
          </section>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center justify-center rounded-[4px] border border-foreground/20 bg-transparent px-4 py-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back
          </Link>
        </div>
      </Card>
    </main>
  );
}

