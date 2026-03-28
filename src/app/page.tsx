import Link from "next/link";
import { EnquirySiteHeader } from "@/components/enquiry/EnquirySiteHeader";

export default function Home() {
  return (
    <>
      <EnquirySiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">
            New customer enquiry
          </h1>
          <p className="mt-3 text-sm leading-6 text-primary-foreground">
            A quick step-by-step form. One thing at a time.
          </p>
        </header>

        <section className="rounded border border-border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-destructive-foreground">Start</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the type of pet you’re enquiring about.
          </p>

          <div className="mt-5 grid gap-3">
            <Link
              href="/enquiry/dog"
              className="rounded-xl border border-secondary/50 bg-secondary/30 px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-secondary/45"
            >
              Start (dog)
            </Link>
            <Link
              href="/enquiry/cat"
              className="rounded-xl border border-accent/50 bg-accent/15 px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-accent/25"
            >
              Start (cat)
            </Link>
            <Link
              href="/enquiry/small-pet"
              className="rounded-xl border-2 border-destructive/45 bg-destructive/[0.08] px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-destructive/[0.14]"
            >
              Start (small pet)
            </Link>
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          Staff?{" "}
          <Link href="/admin" className="underline underline-offset-2">
            Back-office login
          </Link>
        </footer>
      </main>
    </>
  );
}
