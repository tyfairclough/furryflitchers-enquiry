import { prisma } from "@/server/db";
import { z } from "zod";

export const dogInputSchema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  /** Used for rule lookup and family bans when breed is e.g. Other/Crossbreed */
  breedScreeningText: z.string().optional(),
  ageMonths: z.number().int().positive(),
  sex: z.enum(["male", "female"]),
  neutered: z.boolean(),
});

export type DogInput = z.infer<typeof dogInputSchema>;

export type DogSuitabilityResult = {
  accepted: boolean;
  reasonCode: string | null;
};

export type GroupSuitabilityResult = {
  accepted: boolean;
  dogs: Array<DogSuitabilityResult>;
};

function normalizeBreedName(breed: string) {
  return breed.trim().toLowerCase();
}

function screeningNorm(dog: DogInput) {
  const st = dog.breedScreeningText?.trim();
  const raw = st && st.length > 0 ? st : dog.breed;
  return normalizeBreedName(raw);
}

/** Banned families (incl. crosses) when reflected in screening text */
function isFamilyBannedScreening(normalized: string): boolean {
  if (normalized.includes("poodle")) return true;
  if (normalized.includes("beagle")) return true;
  if (normalized.includes("french bulldog")) return true;
  if (normalized.includes("frenchie")) return true;
  return false;
}

export async function evaluateDogGroupSuitability(
  dogs: DogInput[],
): Promise<GroupSuitabilityResult> {
  const rules = await prisma.breedRule.findMany({
    where: { active: true },
    select: { id: true, breedName: true, ruleType: true },
  });

  const ruleByBreed = new Map(
    rules.map((r) => [normalizeBreedName(r.breedName), r]),
  );

  const dogResults: DogSuitabilityResult[] = dogs.map((dog) => {
    if (dog.ageMonths < 6) return { accepted: false, reasonCode: "PUPPY" };

    if (dog.sex === "female" && dog.neutered === false) {
      return { accepted: false, reasonCode: "FEMALE_NOT_NEUTERED" };
    }

    const screen = screeningNorm(dog);
    if (isFamilyBannedScreening(screen)) {
      return { accepted: false, reasonCode: "BREED_BANNED" };
    }

    const rule = ruleByBreed.get(screen);
    if (!rule) return { accepted: true, reasonCode: null };

    if (rule.ruleType === "banned") {
      return { accepted: false, reasonCode: "BREED_BANNED" };
    }

    if (rule.ruleType === "maleNeuteredOnly") {
      if (dog.sex === "male" && dog.neutered === true) {
        return { accepted: true, reasonCode: null };
      }
      return { accepted: false, reasonCode: "BREED_MALE_NEUTERED_ONLY" };
    }

    return { accepted: true, reasonCode: null };
  });

  const accepted = dogResults.every((r) => r.accepted);
  return { accepted, dogs: dogResults };
}

