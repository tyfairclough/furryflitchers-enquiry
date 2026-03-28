import Link from "next/link";

export default async function EnquiryThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; petType?: string }>;
}) {
  const { id, petType } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          Enquiry received
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Thanks — we’ll review your enquiry and be in touch.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-2 text-sm text-foreground">
          {petType ? (
            <p>
              <span className="font-semibold">Pet type:</span> {petType}
            </p>
          ) : null}
          {id ? (
            <p>
              <span className="font-semibold">Reference:</span> {id}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Back to start
          </Link>
        </div>
      </section>
    </main>
  );
}

