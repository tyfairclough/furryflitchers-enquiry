import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:opacity-90 focus-visible:outline-primary",
  ghost:
    "text-foreground hover:bg-muted focus-visible:outline-primary",
  danger:
    "bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:outline-destructive",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      className={[
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variantClass[variant],
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}
