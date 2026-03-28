import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

const getCachedBreeds = unstable_cache(
  async () => {
    const rows = await prisma.breedRule.findMany({
      where: { active: true },
      select: { breedName: true },
      orderBy: { breedName: "asc" },
    });
    return rows.map((r) => r.breedName);
  },
  ["breed-rule-catalog-names"],
  { revalidate: 300 },
);

export async function GET() {
  const breeds = await getCachedBreeds();
  return NextResponse.json({ breeds });
}
