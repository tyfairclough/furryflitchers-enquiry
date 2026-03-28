"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/enquiries", label: "Enquiries", match: (p: string) => p === "/admin/enquiries" || p.startsWith("/admin/enquiries/") },
  { href: "/admin/breed-rules", label: "Breed rules", match: (p: string) => p.startsWith("/admin/breed-rules") },
  { href: "/admin/animal-types", label: "Animal types", match: (p: string) => p.startsWith("/admin/animal-types") },
  { href: "/admin/settings", label: "Settings", match: (p: string) => p.startsWith("/admin/settings") },
] as const;

export function AdminDeskSidebar({ username }: { username: string }) {
  const pathname = usePathname() ?? "";

  return (
    <aside className="flex shrink-0 flex-col border-b border-border bg-card lg:sticky lg:top-0 lg:z-10 lg:h-[100dvh] lg:w-56 lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-1 p-4 lg:p-5">
        <p className="text-xs font-medium text-muted-foreground">Furry Flitchers</p>
        <p className="text-sm font-semibold tracking-tight">Back-office</p>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{username}</span>
        </p>
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto border-t border-border px-2 py-2 lg:flex-col lg:overflow-y-auto lg:border-t-0 lg:px-3 lg:py-2">
        {NAV.map(({ href, label, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted/60",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-border p-4 lg:p-5">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-3 py-2 text-center text-sm font-semibold hover:bg-muted/30"
        >
          Back to enquiry
        </Link>
        <form action="/admin/logout" method="post">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
