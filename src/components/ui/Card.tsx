import type { PropsWithChildren } from "react";

export function Card({ children }: PropsWithChildren) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      {children}
    </section>
  );
}
