import Link from "next/link";
import { MAIN_SITE_URL } from "@/lib/site";

export default async function EnquiryThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; petType?: string }>;
}) {
  const { id, petType } = await searchParams;
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
      <header className="mb-10">
        <h1 className="text-2xl font-semibold uppercase tracking-[3px] text-muted">
          Enquiry received
        </h1>
        <p className="mt-3 text-lg leading-6 text-muted">
          Thanks — we’ll review your enquiry and be in touch.
        </p>
      </header>

      <section className="bg-card-foreground p-5 text-foreground">
        <div className="grid gap-2 text-sm text-muted">
          {petType ? (
            <p>
              <span className="font-semibold text-muted">Enquiry type:</span>{" "}
              {petType}
            </p>
          ) : null}
          {id ? (
            <p>
              <span className="font-semibold text-muted">Reference:</span> {id}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-[4px] border border-transparent bg-[#4a6663] px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a6663]"
          >
            Make another enquiry
          </Link>
          <a
            href={MAIN_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-[4px] border border-[#4a6663] bg-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#4a6663] hover:bg-[#4a6663]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a6663]"
          >
            Return to website
          </a>
        </div>
      </section>
    </main>
  );
}

