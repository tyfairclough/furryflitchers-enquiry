import { EnquiryPetTypeTiles } from "@/components/enquiry/EnquiryPetTypeTiles";
import { EnquirySiteHeader } from "@/components/enquiry/EnquirySiteHeader";

export default function Home() {
  const petIntroId = "pet-type-intro";

  return (
    <>
      <EnquirySiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10 md:max-w-[640px] md:px-0">
        <section className="flex flex-col gap-6 text-[#26322e]" aria-labelledby={petIntroId}>
          <div className="flex flex-col gap-2">
            <h1 className="font-sans text-[28px] font-semibold uppercase leading-[36px] tracking-[3px] text-[#26322e]">
              New customer enquiry
            </h1>
            <p
              id={petIntroId}
              className="font-subtitle text-[15px] font-medium leading-normal text-[#515b58]"
            >
              Choose the type of pet you’re enquiring about.
            </p>
          </div>

          <EnquiryPetTypeTiles describedBy={petIntroId} />
        </section>
      </main>
    </>
  );
}
