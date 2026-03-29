import Image from "next/image";
import Link from "next/link";

/** Matches `Button` primary variant visuals for the tile label strip (hover via parent `group`). */
const PET_TILE_BUTTON_LABEL =
  "flex w-full flex-1 items-center justify-center rounded-[4px] border border-transparent bg-primary px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-opacity group-hover:opacity-90";

const PET_TYPES = [
  {
    href: "/enquiry/cat",
    label: "Cat",
    imageSrc: "/images/enquiry/pet-cat.png",
    portraitBg: "#9c1522",
  },
  {
    href: "/enquiry/dog",
    label: "Dog",
    imageSrc: "/images/enquiry/pet-dog.png",
    portraitBg: "#9c1522",
  },
  {
    href: "/enquiry/small-pet",
    label: "Small pet",
    imageSrc: "/images/enquiry/pet-small-pet.png",
    portraitBg: "#046339",
  },
] as const;

export function EnquiryPetTypeTiles({ describedBy }: { describedBy?: string }) {
  return (
    <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:justify-center md:gap-6">
      {PET_TYPES.map((pet) => (
        <Link
          key={pet.href}
          href={pet.href}
          className="group flex min-w-0 flex-1 flex-row gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26322e] focus-visible:ring-offset-2 focus-visible:ring-offset-white md:max-w-none md:flex-col md:gap-2"
          aria-describedby={describedBy}
        >
          <div
            className="relative size-[100px] shrink-0 overflow-hidden rounded-[4px] md:h-[198px] md:w-full"
            style={{ backgroundColor: pet.portraitBg }}
          >
            <Image
              src={pet.imageSrc}
              alt=""
              fill
              className="object-cover object-center"
              sizes="(max-width: 767px) 100px, 33vw"
              priority
            />
          </div>
          <div className="flex min-h-[100px] min-w-0 flex-1 md:min-h-0 md:h-12 md:flex-none md:w-full">
            <div className={`${PET_TILE_BUTTON_LABEL} md:min-h-12`}>{pet.label}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
