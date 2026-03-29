"use client";

import Image from "next/image";
import { CheckIcon } from "@/components/ui/CheckIcon";

export type DogSexChoice = "male" | "female";

const cards: {
  sex: DogSexChoice;
  title: string;
  src: string;
}[] = [
  {
    sex: "female",
    title: "Female",
    src: "/images/enquiry/dog-sex-female.png",
  },
  {
    sex: "male",
    title: "Male",
    src: "/images/enquiry/dog-sex-male.png",
  },
];

export function DogSexCardPicker({
  value,
  onChange,
}: {
  value: DogSexChoice | "";
  onChange: (next: DogSexChoice) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:justify-center md:gap-6">
      {cards.map(({ sex, title, src }) => {
        const selected = value === sex;
        return (
          <button
            key={sex}
            type="button"
            onClick={() => onChange(sex)}
            aria-pressed={selected}
            className={[
              "flex min-w-0 w-full flex-row gap-2 rounded-[4px] text-left",
              "md:max-w-[197px] md:flex-1 md:flex-col md:gap-2",
              "transition-[box-shadow] duration-200",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              selected
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "",
            ].join(" ")}
          >
            <div className="relative size-[100px] shrink-0 overflow-hidden rounded-[4px] md:h-[198px] md:w-full">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 767px) 100px, 197px"
                priority
              />
            </div>
            <div className="flex min-h-[100px] min-w-0 flex-1 md:min-h-0 md:h-12 md:flex-none md:w-full">
              <div
                className={[
                  "flex w-full flex-1 items-center justify-center gap-2 rounded-[4px] border bg-secondary text-secondary-foreground md:min-h-12",
                  selected ? "border-primary/40" : "border-transparent",
                ].join(" ")}
              >
                {selected ? (
                  <CheckIcon className="size-5 shrink-0 text-secondary-foreground" />
                ) : null}
                <span className="text-[15px] font-medium uppercase tracking-normal text-secondary-foreground">
                  {title}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
