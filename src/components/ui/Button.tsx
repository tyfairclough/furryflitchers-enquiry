import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const variantClass: Record<Variant, string> = {
  primary:
    "border border-transparent bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-primary",
  secondary:
    "border border-transparent bg-secondary text-secondary-foreground hover:opacity-90 focus-visible:outline-primary",
  outline:
    "border border-border bg-transparent text-muted-foreground hover:border-muted-foreground focus-visible:outline-primary",
  ghost:
    "border border-transparent text-foreground hover:bg-muted focus-visible:outline-primary",
  danger:
    "border border-transparent bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:outline-destructive",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-[4px] px-4 py-3 text-sm font-semibold uppercase tracking-wide",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variantClass[variant],
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
