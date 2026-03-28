import type { PropsWithChildren } from "react";

export function Field({
  label,
  hint,
  children,
}: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <div className="grid gap-2">
      <div>
        <label className="text-sm font-semibold text-foreground">{label}</label>
        {hint ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={[
        "h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/35",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function Select(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={[
        "h-12 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/35",
        props.className ?? "",
      ].join(" ")}
    />
  );
}
