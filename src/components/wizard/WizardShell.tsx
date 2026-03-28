"use client";

import type { PropsWithChildren, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function WizardShell({
  title,
  subtitle,
  stepLabel,
  stepProgress,
  onBack,
  backHref,
  primaryAction,
  secondaryAction,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  stepLabel?: string;
  stepProgress?: number;
  onBack?: () => void;
  backHref?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}>) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{subtitle}</p>
        ) : null}
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
                className="h-full bg-accent transition-[width]"
                style={{ width: `${Math.min(100, stepProgress * 100)}%` }}
              />
            </div>
          </div>
        ) : null}
      </header>

      <Card>
        {children}

        {(primaryAction || secondaryAction || onBack || backHref) && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {secondaryAction ? (
              secondaryAction
            ) : onBack ? (
              <Button type="button" variant="secondary" onClick={onBack}>
                Back
              </Button>
            ) : backHref ? (
              <Link
                href={backHref}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted/30"
              >
                Back
              </Link>
            ) : (
              <div />
            )}

            {primaryAction ? (
              primaryAction
            ) : (
              <Button type="submit" disabled>
                Continue
              </Button>
            )}
          </div>
        )}
      </Card>
    </main>
  );
}

