export type DogAgeBand = "under6" | "6to12" | "over12";

const representativeMonths: Record<DogAgeBand, number> = {
  under6: 3,
  "6to12": 9,
  over12: 24,
};

const bandLabels: Record<DogAgeBand, string> = {
  under6: "Under six months",
  "6to12": "Six months to 1 year",
  over12: "Over 1 year old",
};

export function getDogAgeBand(
  ageMonths: number | null | undefined,
): DogAgeBand | null {
  if (typeof ageMonths !== "number" || !Number.isFinite(ageMonths)) return null;
  if (ageMonths <= 0) return null;
  if (ageMonths < 6) return "under6";
  if (ageMonths <= 12) return "6to12";
  return "over12";
}

export function dogAgeBandLabel(band: DogAgeBand): string {
  return bandLabels[band];
}

export function dogAgeBandToRepresentativeMonths(band: DogAgeBand): number {
  return representativeMonths[band];
}

export function formatDogAgeBand(
  ageMonths: number | null | undefined,
): string {
  const band = getDogAgeBand(ageMonths);
  return band ? dogAgeBandLabel(band) : "—";
}

