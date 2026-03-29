"use client";

import type { FormEvent, PropsWithChildren, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function WizardShell({
  title,
  stepLabel,
  stepProgress,
  onBack,
  backHref,
  /** When set, wraps fields and actions in a form so Enter submits like the primary button. */
  onContinue,
  primaryAction,
  secondaryAction,
  children,
}: PropsWithChildren<{
  title: string;
  stepLabel?: string;
  stepProgress?: number;
  onBack?: () => void;
  backHref?: string;
  onContinue?: () => void | Promise<void>;
  /** Pass `null` to omit the primary slot (no default disabled Continue). */
  primaryAction?: ReactNode | null;
  secondaryAction?: ReactNode;
}>) {
  const onlyBack =
    (onBack != null || backHref != null) &&
    secondaryAction == null &&
    primaryAction === null;

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!onContinue) return;
    void Promise.resolve(onContinue());
  }

  const showActionFooter =
    Boolean(secondaryAction) ||
    onBack != null ||
    backHref != null ||
    primaryAction !== undefined ||
    primaryAction === null;

  const actionFooterContent =
    showActionFooter &&
    (onlyBack ? (
      <div className="flex w-full justify-start gap-3">
        {onBack ? (
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
        ) : (
          <Link
            href={backHref!}
            className="inline-flex items-center justify-center rounded-[4px] border border-transparent bg-secondary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-secondary-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back
          </Link>
        )}
      </div>
    ) : (
      <div className="grid w-full grid-cols-2 gap-3">
        {secondaryAction ? (
          secondaryAction
        ) : onBack ? (
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
        ) : backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-[4px] border border-transparent bg-secondary px-4 py-3 text-sm font-semibold uppercase tracking-wide text-secondary-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Back
          </Link>
        ) : (
          <div />
        )}

        {primaryAction === undefined ? (
          <Button type="submit" disabled>
            Continue
          </Button>
        ) : primaryAction === null ? (
          <div />
        ) : (
          primaryAction
        )}
      </div>
    ));

  const hasActionFooter = Boolean(actionFooterContent);

  const actionFooter =
    actionFooterContent ? (
      <div
        className={[
          "fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          "pb-[max(1rem,env(safe-area-inset-bottom))]",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-[640px] px-4">{actionFooterContent}</div>
      </div>
    ) : null;

  const body = (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="mb-7 shrink-0">
          <h1 className="text-2xl font-semibold uppercase tracking-[3px] text-muted">
            {title}
          </h1>
          {typeof stepProgress === "number" ? (
            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {stepLabel ?? "Progress"}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {Math.round(stepProgress * 100)}%
                </p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-secondary transition-[width]"
                  style={{ width: `${Math.min(100, stepProgress * 100)}%` }}
                />
              </div>
            </div>
          ) : null}
        </header>

        <section
          className={[
            "min-h-0 flex-1 overflow-y-auto text-foreground",
            hasActionFooter
              ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
              : "pb-4",
          ].join(" ")}
        >
          {children}
        </section>
      </div>
      {actionFooter}
    </>
  );

  const shellClassName =
    "flex min-h-0 flex-1 flex-col p-2";

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col px-4 pt-10">
      {onContinue ? (
        <form
          className={shellClassName}
          noValidate
          onSubmit={handleFormSubmit}
        >
          {body}
        </form>
      ) : (
        <div className={shellClassName}>{body}</div>
      )}
    </main>
  );
}
