"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BreedAutocomplete } from "@/components/enquiry/BreedAutocomplete";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { WizardShell } from "@/components/wizard/WizardShell";
import { clearDraft, loadDraft, saveDraft } from "@/lib/localDraft";
import { useInvisibleHcaptcha } from "@/components/hcaptcha/InvisibleHcaptcha";

type DogSex = "male" | "female";

type DogDraft = {
  id: string;
  name: string;
  breed: string;
  /** Free text used for screening when breed is Other/Crossbreed */
  breedScreeningText: string;
  ageMonths: number | null;
  sex: DogSex | "";
  neutered: boolean | null;
};

type BookingType = "holiday" | "regular" | "oneOff" | "";
type DogService = "daycare" | "boarding" | "";

type DogEnquiryDraft = {
  dogs: DogDraft[];
  service: DogService;
  bookingType: BookingType;
  customerName: string;
  phone: string;
  email: string;
  agreedToTerms: boolean;
};

type SuitabilityDog = { accepted: boolean; reasonCode: string | null };
type SuitabilityResponse = {
  accepted: boolean;
  dogs: SuitabilityDog[];
  rejectionMessage: string;
};

type StepId =
  | "dogName"
  | "dogBreed"
  | "dogAge"
  | "dogSex"
  | "dogNeutered"
  | "dogSuitability"
  | "service"
  | "bookingType"
  | "customerName"
  | "phone"
  | "email"
  | "terms"
  | "review";

const defaultDog = (): DogDraft => ({
  id: crypto.randomUUID(),
  name: "",
  breed: "",
  breedScreeningText: "",
  ageMonths: null,
  sex: "",
  neutered: null,
});

function buildDogApiFields(d: DogDraft) {
  const breed = d.breed.trim();
  const st = (d.breedScreeningText ?? "").trim();
  return {
    name: d.name.trim(),
    breed,
    ...(st.length > 0 && st !== breed ? { breedScreeningText: st } : {}),
    ageMonths: d.ageMonths ?? 0,
    sex: (d.sex === "male" || d.sex === "female" ? d.sex : "male") as DogSex,
    neutered: d.neutered ?? false,
  };
}

const defaultDraft = (): DogEnquiryDraft => ({
  dogs: [defaultDog()],
  service: "",
  bookingType: "",
  customerName: "",
  phone: "",
  email: "",
  agreedToTerms: false,
});

function dogLabel(dog: DogDraft, index: number) {
  return dog.name?.trim() ? dog.name.trim() : `Dog ${index + 1}`;
}

export function DogWizard() {
  const router = useRouter();
  const { execute: executeCaptcha, element: captchaEl } = useInvisibleHcaptcha();
  const [draft, setDraft] = useState<DogEnquiryDraft>(defaultDraft);
  const [step, setStep] = useState<StepId>("dogName");
  const [dogIndex, setDogIndex] = useState(0);
  const [suitability, setSuitability] = useState<SuitabilityResponse | null>(
    null,
  );
  const [suitabilityLoading, setSuitabilityLoading] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [hp, setHp] = useState("");
  const [breedCatalog, setBreedCatalog] = useState<string[]>([]);
  const [breedQuery, setBreedQuery] = useState("");
  const prevStepRef = useRef<StepId | null>(null);
  /** Where to return when backing out of “add another dog” name step */
  const addDogReturnStepRef = useRef<StepId>("dogSuitability");

  useEffect(() => {
    fetch("/api/breeds/catalog")
      .then((r) => r.json())
      .then((data: { breeds?: string[] }) => setBreedCatalog(data.breeds ?? []))
      .catch(() => setBreedCatalog([]));
  }, []);

  useEffect(() => {
    const saved = loadDraft<DogEnquiryDraft>("dog");
    if (!saved) return;
    setDraft({
      ...saved,
      dogs: saved.dogs.map((d) => ({
        ...d,
        breedScreeningText:
          "breedScreeningText" in d &&
          typeof (d as DogDraft).breedScreeningText === "string"
            ? (d as DogDraft).breedScreeningText
            : d.breed || "",
      })),
    });
  }, []);

  useEffect(() => {
    saveDraft("dog", draft);
  }, [draft]);

  const currentDog = draft.dogs[dogIndex] ?? draft.dogs[0];

  useEffect(() => {
    if (step === "dogBreed" && prevStepRef.current !== "dogBreed") {
      setBreedQuery(currentDog.breed);
    }
    prevStepRef.current = step;
  }, [step, dogIndex, currentDog.breed]);

  const stepOrder: StepId[] = useMemo(
    () => [
      "dogName",
      "dogBreed",
      "dogAge",
      "dogSex",
      "dogNeutered",
      "dogSuitability",
      "service",
      "bookingType",
      "customerName",
      "phone",
      "email",
      "terms",
      "review",
    ],
    [],
  );

  const stepIndex = stepOrder.indexOf(step);
  const stepProgress =
    stepIndex <= 0 ? 0 : stepIndex / (Math.max(1, stepOrder.length - 1));

  function setDog(next: Partial<DogDraft>) {
    setDraft((prev) => ({
      ...prev,
      dogs: prev.dogs.map((d, i) => (i === dogIndex ? { ...d, ...next } : d)),
    }));
  }

  function canContinue(): boolean {
    switch (step) {
      case "dogName":
        return currentDog.name.trim().length > 0;
      case "dogBreed":
        return breedQuery.trim().length > 0;
      case "dogAge":
        return typeof currentDog.ageMonths === "number" && currentDog.ageMonths > 0;
      case "dogSex":
        return currentDog.sex === "male" || currentDog.sex === "female";
      case "dogNeutered":
        return currentDog.neutered !== null;
      case "dogSuitability":
        return suitability?.accepted ?? true;
      case "service":
        return draft.service === "boarding" || draft.service === "daycare";
      case "bookingType":
        return (
          draft.bookingType === "holiday" ||
          draft.bookingType === "regular" ||
          draft.bookingType === "oneOff"
        );
      case "customerName":
        return draft.customerName.trim().length > 0;
      case "phone":
        return draft.phone.trim().length > 0;
      case "email":
        return draft.email.trim().length > 3 && draft.email.includes("@");
      case "terms":
        return draft.agreedToTerms;
      case "review":
        return true;
    }
  }

  function goNext() {
    const idx = stepOrder.indexOf(step);
    if (idx < 0) return;
    const next = stepOrder[Math.min(stepOrder.length - 1, idx + 1)];
    setStep(next);
  }

  function goBack() {
    const idx = stepOrder.indexOf(step);
    if (idx <= 0) return;
    const prev = stepOrder[Math.max(0, idx - 1)];
    setStep(prev);
  }

  function addAnotherDog() {
    addDogReturnStepRef.current = step === "review" ? "review" : "dogSuitability";
    setDraft((prev) => ({ ...prev, dogs: [...prev.dogs, defaultDog()] }));
    setDogIndex(draft.dogs.length);
    setStep("dogName");
  }

  function backFromDogName() {
    if (dogIndex > 0) {
      const nextDogs = draft.dogs.slice(0, -1);
      setDraft((prev) => ({ ...prev, dogs: nextDogs }));
      setDogIndex((i) => i - 1);
      setStep(addDogReturnStepRef.current);
      void runSuitabilityCheck(nextDogs);
      return;
    }
    router.push("/");
  }

  async function runSuitabilityCheck(dogsOverride?: DogDraft[]) {
    const dogsToSend = dogsOverride ?? draft.dogs;
    setSuitabilityLoading(true);
    try {
      const payload = {
        dogs: dogsToSend.map((d) => buildDogApiFields(d)),
      };
      const res = await fetch("/api/suitability/dog", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Suitability check failed");
      const data = (await res.json()) as SuitabilityResponse;
      setSuitability(data);
      return data;
    } finally {
      setSuitabilityLoading(false);
    }
  }

  async function submit() {
    const latest = suitability ?? (await runSuitabilityCheck());
    if (!latest.accepted) {
      setStep("dogSuitability");
      return;
    }

    const hcaptchaToken = await executeCaptcha();
    const payload = {
      petType: "dog" as const,
      dogs: draft.dogs.map((d) => {
        const base = buildDogApiFields(d);
        return {
          ...base,
          sex: d.sex === "female" ? ("female" as const) : ("male" as const),
        };
      }),
      service: draft.service === "daycare" ? "daycare" : "boarding",
      bookingType:
        draft.bookingType === "holiday"
          ? "holiday"
          : draft.bookingType === "regular"
            ? "regular"
            : "oneOff",
      customerName: draft.customerName.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      agreedToTerms: true as const,
      hp,
      elapsedMs: Date.now() - startedAt,
      hcaptchaToken,
    };

    const res = await fetch("/api/enquiry/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 422) {
      const data = (await res.json()) as SuitabilityResponse;
      setSuitability(data);
      setStep("dogSuitability");
      return;
    }

    if (!res.ok) {
      alert("Something went wrong submitting your enquiry. Please try again.");
      return;
    }

    const data = (await res.json()) as { ok: true; id: string };
    clearDraft("dog");
    setDraft(defaultDraft());
    setDogIndex(0);
    setStep("dogName");
    setSuitability(null);
    router.push(`/enquiry/thanks?petType=dog&id=${encodeURIComponent(data.id)}`);
  }

  const title = `Dog${draft.dogs.length > 1 ? "s" : ""} enquiry`;

  if (step === "dogName") {
    return (
      <WizardShell
        title={title}
        subtitle={`Dog ${dogIndex + 1} of ${draft.dogs.length}`}
        stepLabel={`Dog ${dogIndex + 1}`}
        stepProgress={stepProgress}
        onBack={backFromDogName}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Dog name">
          <TextInput
            autoFocus
            value={currentDog.name}
            onChange={(e) => setDog({ name: e.target.value })}
            placeholder="e.g. Monty"
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "dogBreed") {
    function confirmBreedAndContinue() {
      const raw = breedQuery.trim();
      if (!raw) return;
      const lower = raw.toLowerCase();
      const canon = breedCatalog.find((b) => b.toLowerCase() === lower);
      if (canon) {
        setDog({ breed: canon, breedScreeningText: canon });
      } else {
        setDog({ breed: "Other/Crossbreed", breedScreeningText: raw });
      }
      goNext();
    }

    return (
      <WizardShell
        title={title}
        subtitle={`Dog ${dogIndex + 1} of ${draft.dogs.length}`}
        stepLabel={`Dog ${dogIndex + 1}`}
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button
            type="button"
            onClick={confirmBreedAndContinue}
            disabled={!canContinue()}
          >
            Continue
          </Button>
        }
      >
        <Field
          label="Dog breed"
          hint="Choose from the list or type a breed. If it is not listed, we will record it as Other/Crossbreed."
        >
          <BreedAutocomplete
            breeds={breedCatalog}
            value={breedQuery}
            onChange={setBreedQuery}
            placeholder="e.g. Labrador Retriever"
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "dogAge") {
    return (
      <WizardShell
        title={title}
        subtitle={`Dog ${dogIndex + 1} of ${draft.dogs.length}`}
        stepLabel={`Dog ${dogIndex + 1}`}
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field
          label="Dog age (months)"
          hint="Puppies under 6 months cannot be accepted."
        >
          <TextInput
            autoFocus
            inputMode="numeric"
            value={currentDog.ageMonths ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value);
              setDog({ ageMonths: Number.isFinite(n) ? n : null });
            }}
            placeholder="e.g. 18"
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "dogSex") {
    return (
      <WizardShell
        title={title}
        subtitle={`Dog ${dogIndex + 1} of ${draft.dogs.length}`}
        stepLabel={`Dog ${dogIndex + 1}`}
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Dog sex">
          <Select
            autoFocus
            value={currentDog.sex}
            onChange={(e) => setDog({ sex: e.target.value as DogSex })}
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </Field>
      </WizardShell>
    );
  }

  if (step === "dogNeutered") {
    return (
      <WizardShell
        title={title}
        subtitle={`Dog ${dogIndex + 1} of ${draft.dogs.length}`}
        stepLabel={`Dog ${dogIndex + 1}`}
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button
            type="button"
            onClick={async () => {
              await runSuitabilityCheck();
              goNext();
            }}
            disabled={!canContinue() || suitabilityLoading}
          >
            Continue
          </Button>
        }
      >
        <Field label="Is your dog neutered?">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={currentDog.neutered === true ? "primary" : "secondary"}
              onClick={() => setDog({ neutered: true })}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={currentDog.neutered === false ? "primary" : "secondary"}
              onClick={() => setDog({ neutered: false })}
            >
              No
            </Button>
          </div>
        </Field>
      </WizardShell>
    );
  }

  if (step === "dogSuitability") {
    const currentResult = suitability?.dogs?.[dogIndex];
    const rejected = suitability && !suitability.accepted;
    return (
      <WizardShell
        title={title}
        subtitle={`Dog ${dogIndex + 1} of ${draft.dogs.length}`}
        stepLabel={`Dog ${dogIndex + 1}`}
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext}>
            Continue
          </Button>
        }
        secondaryAction={
          <Button type="button" variant="secondary" onClick={addAnotherDog}>
            Add another dog
          </Button>
        }
      >
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Suitability check
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void runSuitabilityCheck()}
              disabled={suitabilityLoading}
              className="px-3 py-2 text-xs"
            >
              {suitabilityLoading ? "Checking…" : "Re-check"}
            </Button>
          </div>
          {rejected ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {suitability?.rejectionMessage}
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Looks good so far.
            </div>
          )}
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Current dog: <span className="font-medium">{dogLabel(currentDog, dogIndex)}</span>
            {currentResult ? (
              <>
                {" "}
                ·{" "}
                <span className="font-medium">
                  {currentResult.accepted ? "accepted" : "rejected"}
                </span>
              </>
            ) : null}
          </div>
          {rejected ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("dogName")}
            >
              Edit dog details
            </Button>
          ) : null}
        </div>
      </WizardShell>
    );
  }

  if (step === "service") {
    return (
      <WizardShell
        title={title}
        subtitle="Choose a service"
        stepLabel="Service"
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Choose service">
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={draft.service === "boarding" ? "primary" : "secondary"}
              onClick={() => setDraft((p) => ({ ...p, service: "boarding" }))}
            >
              Boarding
            </Button>
            <Button
              type="button"
              variant={draft.service === "daycare" ? "primary" : "secondary"}
              onClick={() => setDraft((p) => ({ ...p, service: "daycare" }))}
            >
              Daycare
            </Button>
          </div>
        </Field>
      </WizardShell>
    );
  }

  if (step === "bookingType") {
    return (
      <WizardShell
        title={title}
        subtitle="Choose booking type"
        stepLabel="Booking"
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Booking type">
          <Select
            autoFocus
            value={draft.bookingType}
            onChange={(e) =>
              setDraft((p) => ({ ...p, bookingType: e.target.value as BookingType }))
            }
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="holiday">Holiday</option>
            <option value="regular">Regular</option>
            <option value="oneOff">One-off</option>
          </Select>
        </Field>
      </WizardShell>
    );
  }

  if (step === "customerName") {
    return (
      <WizardShell
        title={title}
        subtitle="Your details"
        stepLabel="Customer"
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Customer name">
          <TextInput
            autoFocus
            value={draft.customerName}
            onChange={(e) => setDraft((p) => ({ ...p, customerName: e.target.value }))}
            placeholder="e.g. Karly"
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "phone") {
    return (
      <WizardShell
        title={title}
        subtitle="Your details"
        stepLabel="Customer"
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Phone number">
          <TextInput
            autoFocus
            value={draft.phone}
            onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
            placeholder="e.g. 07..."
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "email") {
    return (
      <WizardShell
        title={title}
        subtitle="Your details"
        stepLabel="Customer"
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Email">
          <TextInput
            autoFocus
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
            placeholder="e.g. you@example.com"
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "terms") {
    return (
      <WizardShell
        title={title}
        subtitle="Almost done"
        stepLabel="Terms"
        stepProgress={stepProgress}
        onBack={goBack}
        primaryAction={
          <Button type="button" onClick={goNext} disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <div className="grid gap-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
            <input
              type="checkbox"
              checked={draft.agreedToTerms}
              onChange={(e) =>
                setDraft((p) => ({ ...p, agreedToTerms: e.target.checked }))
              }
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm text-foreground">
              I agree to the terms.
            </span>
          </label>
        </div>
      </WizardShell>
    );
  }

  // review
  return (
    <WizardShell
      title={title}
      subtitle="Review your details"
      stepLabel="Review"
      stepProgress={stepProgress}
      onBack={goBack}
      primaryAction={
        <Button type="button" onClick={submit} disabled={suitabilityLoading}>
          Submit
        </Button>
      }
      secondaryAction={
        <Button type="button" variant="secondary" onClick={() => clearDraft("dog")}>
          Clear draft
        </Button>
      }
    >
      {captchaEl}
      <input
        name="hp"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        aria-hidden="true"
      />
      <div className="grid gap-4 text-sm text-foreground">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Dogs
          </p>
          <ul className="mt-2 grid gap-2">
            {draft.dogs.map((d, i) => (
              <li key={d.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{dogLabel(d, i)}</p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-muted-foreground underline underline-offset-2"
                    onClick={() => {
                      setDogIndex(i);
                      setStep("dogName");
                    }}
                  >
                    Edit
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.breed || "—"} · {d.ageMonths ?? "—"} months · {d.sex || "—"} ·{" "}
                  {d.neutered === null ? "—" : d.neutered ? "neutered" : "not neutered"}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Button type="button" variant="secondary" onClick={addAnotherDog}>
              Add another dog
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Service
          </p>
          <p className="mt-1 font-semibold">{draft.service || "—"}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Booking type
          </p>
          <p className="mt-1 font-semibold">{draft.bookingType || "—"}</p>
        </div>

        <div className="rounded-xl border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Customer
          </p>
          <p className="mt-1 font-semibold">{draft.customerName || "—"}</p>
          <p className="mt-1 text-muted-foreground">{draft.phone || "—"}</p>
          <p className="mt-1 text-muted-foreground">{draft.email || "—"}</p>
        </div>
      </div>
    </WizardShell>
  );
}

