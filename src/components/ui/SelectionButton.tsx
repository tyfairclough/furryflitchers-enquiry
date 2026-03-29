import type { ComponentProps } from "react";
import { Button } from "./Button";
import { CheckIcon } from "./CheckIcon";

export function SelectionButton({
  selected,
  children,
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, "variant"> & { selected: boolean }) {
  return (
    <Button
      variant={selected ? "primary" : "secondary"}
      className={["gap-2", className].filter(Boolean).join(" ")}
      {...props}
    >
      {selected ? <CheckIcon className="size-[1.125rem] shrink-0" /> : null}
      {children}
    </Button>
  );
}
