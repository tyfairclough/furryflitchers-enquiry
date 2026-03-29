"use client";

import type { KeyboardEvent } from "react";
import { useMemo } from "react";
import {
  dogAgeBandLabel,
  dogAgeBandToRepresentativeMonths,
  getDogAgeBand,
  type DogAgeBand,
} from "@/lib/dogAgeDisplay";

const bandOrder: DogAgeBand[] = ["under6", "6to12", "over12"];

const labelTextAlign = ["text-left", "text-center", "text-right"] as const;

/** Track fill width between first and last node centers: none / to middle / full. */
function trackFillPercent(selectedIndex: number | null): string {
  if (selectedIndex === null || selectedIndex <= 0) return "0%";
  if (selectedIndex === 1) return "50%";
  return "100%";
}

export function DogAgeRangeSlider({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
}) {
  const selectedBand = getDogAgeBand(value);
  const selectedIndex = selectedBand
    ? bandOrder.findIndex((b) => b === selectedBand)
    : null;

  const ariaValueText = useMemo(() => {
    if (!selectedBand) return "Not selected";
    return dogAgeBandLabel(selectedBand);
  }, [selectedBand]);

  function selectBand(band: DogAgeBand) {
    onChange(dogAgeBandToRepresentativeMonths(band));
  }

  function clearSelection() {
    onChange(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Home" &&
      e.key !== "End" &&
      e.key !== "Escape"
    ) {
      return;
    }
    e.preventDefault();

    if (e.key === "Escape") {
      clearSelection();
      return;
    }

    if (e.key === "Home") {
      selectBand("under6");
      return;
    }
    if (e.key === "End") {
      selectBand("over12");
      return;
    }

    if (selectedIndex === null) {
      // Right = first stop (youngest, left); left = last stop (oldest, right)
      selectBand(e.key === "ArrowRight" ? "under6" : "over12");
      return;
    }

    const nextIndex =
      e.key === "ArrowLeft" ? selectedIndex - 1 : selectedIndex + 1;
    const clamped = Math.max(0, Math.min(bandOrder.length - 1, nextIndex));
    selectBand(bandOrder[clamped]);
  }

  return (
    <div className="grid gap-4">
      <div
        role="slider"
        tabIndex={0}
        aria-label="How old is your dog?"
        aria-valuemin={0}
        aria-valuemax={bandOrder.length - 1}
        aria-valuenow={selectedIndex ?? undefined}
        aria-valuetext={ariaValueText}
        className="relative rounded-none py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onKeyDown={onKeyDown}
      >
        {/* Track inset to node centres: outer w-10 → left-5 / right-5 */}
        <div className="relative flex items-center justify-between">
          <div
            className="pointer-events-none absolute left-5 right-5 top-1/2 z-0 h-2 -translate-y-1/2"
            aria-hidden
          >
            <div className="h-full w-full rounded-full bg-muted" />
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-secondary transition-[width] duration-200 ease-out"
              style={{ width: trackFillPercent(selectedIndex) }}
            />
          </div>

          {bandOrder.map((band, i) => {
            const nodeActive = selectedIndex !== null && i <= selectedIndex;
            return (
              <button
                key={band}
                type="button"
                tabIndex={-1}
                onClick={() => selectBand(band)}
                className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted p-0"
                aria-label={dogAgeBandLabel(band)}
              >
                <span
                  className={[
                    "h-5 w-5 rounded-full transition-colors duration-200",
                    nodeActive ? "bg-secondary" : "bg-muted",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-between gap-2">
          {bandOrder.map((band, i) => {
            const isActive = band === selectedBand;
            return (
              <div
                key={`label-${band}`}
                className={[
                  "flex-1 text-xs leading-4",
                  labelTextAlign[i],
                  isActive
                    ? "font-semibold text-muted"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {dogAgeBandLabel(band)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
