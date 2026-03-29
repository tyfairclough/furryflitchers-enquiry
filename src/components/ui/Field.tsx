import type { PropsWithChildren } from "react";

export function Field({
  label,
  hint,
  children,
}: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <div className="grid w-full gap-2">
      <div className="w-full">
        <label className="text-sm font-semibold text-[color:var(--card)]">{label}</label>
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
        "h-12 min-w-0 w-full rounded-none border border-[#e5e5e5] bg-destructive-foreground px-3 text-sm text-muted",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/35",
        "dark:border-muted-foreground",
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
        "h-12 min-w-0 w-full rounded-none border border-[#e5e5e5] bg-destructive-foreground px-3 text-sm text-muted",
        "dark:border-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring/35",
        props.className ?? "",
      ].join(" ")}
    />
  );
}
