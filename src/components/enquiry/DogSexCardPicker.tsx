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
    <div className="flex w-full justify-center gap-6">
      {cards.map(({ sex, title, src }) => {
        const selected = value === sex;
        return (
          <button
            key={sex}
            type="button"
            onClick={() => onChange(sex)}
            aria-pressed={selected}
            className={[
              "flex max-w-[197px] min-w-0 flex-1 flex-col gap-2 rounded-[4px] text-left",
              "transition-[box-shadow] duration-200",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              selected
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "",
            ].join(" ")}
          >
            <div className="relative h-[198px] w-full overflow-hidden rounded-[4px]">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 448px) 42vw, 197px"
                priority
              />
            </div>
            <div
              className={[
                "flex h-12 w-full items-center justify-center gap-2 rounded-[4px] border bg-secondary text-secondary-foreground",
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
          </button>
        );
      })}
    </div>
  );
}
