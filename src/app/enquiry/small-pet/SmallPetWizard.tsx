"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { WizardShell } from "@/components/wizard/WizardShell";
import { clearDraft, loadDraft, saveDraft } from "@/lib/localDraft";
import { useInvisibleHcaptcha } from "@/components/hcaptcha/InvisibleHcaptcha";
import {
  formatUkPhoneE164,
  INVALID_UK_PHONE_HINT,
  isValidUkPhoneNumber,
} from "@/lib/ukPhone";

type SmallPetService = "popIn" | "boarding" | "";

type SmallPetEnquiryDraft = {
  petName: string;
  petType: string;
  service: SmallPetService;
  customerName: string;
  phone: string;
  email: string;
  agreedToTerms: boolean;
};

type StepId =
  | "petName"
  | "petType"
  | "service"
  | "customer"
  | "terms"
  | "review";

const defaultDraft = (): SmallPetEnquiryDraft => ({
  petName: "",
  petType: "",
  service: "",
  customerName: "",
  phone: "",
  email: "",
  agreedToTerms: false,
});

export function SmallPetWizard() {
  const router = useRouter();
  const { execute: executeCaptcha, element: captchaEl } = useInvisibleHcaptcha();
  const [draft, setDraft] = useState<SmallPetEnquiryDraft>(defaultDraft);
  const [step, setStep] = useState<StepId>("petName");
  const [startedAt] = useState(() => Date.now());
  const [hp, setHp] = useState("");

  useEffect(() => {
    const saved = loadDraft<SmallPetEnquiryDraft>("smallPet");
    if (saved) setDraft(saved);
  }, []);

  useEffect(() => {
    saveDraft("smallPet", draft);
  }, [draft]);

  const stepOrder: StepId[] = useMemo(
    () => ["petName", "petType", "service", "customer", "terms", "review"],
    [],
  );

  const stepIndex = stepOrder.indexOf(step);
  const stepProgress =
    stepIndex <= 0 ? 0 : stepIndex / (Math.max(1, stepOrder.length - 1));

  function canContinue(): boolean {
    switch (step) {
      case "petName":
        return draft.petName.trim().length > 0;
      case "petType":
        return draft.petType.trim().length > 0;
      case "service":
        return draft.service === "popIn" || draft.service === "boarding";
      case "customer":
        return (
          draft.customerName.trim().length > 0 &&
          isValidUkPhoneNumber(draft.phone) &&
          draft.email.trim().length > 3 &&
          draft.email.includes("@")
        );
      case "terms":
        return draft.agreedToTerms;
      case "review":
        return true;
    }
  }

  function goNext() {
    const idx = stepOrder.indexOf(step);
    const next = stepOrder[Math.min(stepOrder.length - 1, idx + 1)];
    setStep(next);
  }

  function goBack() {
    const idx = stepOrder.indexOf(step);
    const prev = stepOrder[Math.max(0, idx - 1)];
    setStep(prev);
  }

  async function submit() {
    const hcaptchaToken = await executeCaptcha();
    const payload = {
      petType: "smallPet" as const,
      petName: draft.petName.trim(),
      petTypeName: draft.petType.trim(),
      service: draft.service === "boarding" ? "boarding" : "popIn",
      customerName: draft.customerName.trim(),
      phone: formatUkPhoneE164(draft.phone)!,
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
    if (!res.ok) {
      alert("Something went wrong submitting your enquiry. Please try again.");
      return;
    }
    const data = (await res.json()) as { ok: true; id: string };

    clearDraft("smallPet");
    setDraft(defaultDraft());
    setStep("petName");
    router.push(
      `/enquiry/thanks?petType=smallPet&id=${encodeURIComponent(data.id)}`,
    );
  }

  if (step === "petName") {
    return (
      <WizardShell
        title="Small pet enquiry"
        stepProgress={stepProgress}
        backHref="/"
        onContinue={goNext}
        primaryAction={
          <Button type="submit" disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Pet name">
          <TextInput
            autoFocus
            value={draft.petName}
            onChange={(e) => setDraft((p) => ({ ...p, petName: e.target.value }))}
            placeholder="e.g. Nibbles"
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "petType") {
    return (
      <WizardShell
        title="Small pet enquiry"
        stepLabel="Pet type"
        stepProgress={stepProgress}
        onBack={goBack}
        onContinue={goNext}
        primaryAction={
          <Button type="submit" disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field
          label="Pet type"
          hint="This list will be managed from the back-office."
        >
          <TextInput
            autoFocus
            value={draft.petType}
            onChange={(e) => setDraft((p) => ({ ...p, petType: e.target.value }))}
            placeholder="e.g. Rabbit"
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "service") {
    return (
      <WizardShell
        title="Small pet enquiry"
        stepProgress={stepProgress}
        onBack={goBack}
        onContinue={goNext}
        primaryAction={
          <Button type="submit" disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Choose service">
          <Select
            autoFocus
            value={draft.service}
            onChange={(e) =>
              setDraft((p) => ({ ...p, service: e.target.value as SmallPetService }))
            }
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="popIn">Pop-in</option>
            <option value="boarding">Boarding</option>
          </Select>
        </Field>
      </WizardShell>
    );
  }

  if (step === "customer") {
    return (
      <WizardShell
        title="Small pet enquiry"
        stepProgress={stepProgress}
        onBack={goBack}
        onContinue={goNext}
        primaryAction={
          <Button type="submit" disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <div className="grid gap-4">
          <Field label="Your name">
            <TextInput
              autoFocus
              value={draft.customerName}
              onChange={(e) =>
                setDraft((p) => ({ ...p, customerName: e.target.value }))
              }
            />
          </Field>
          <Field
            label="Phone number"
            hint={
              draft.phone.trim() !== "" && !isValidUkPhoneNumber(draft.phone)
                ? INVALID_UK_PHONE_HINT
                : undefined
            }
          >
            <TextInput
              value={draft.phone}
              onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. 07... or 01..."
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              aria-invalid={
                draft.phone.trim() !== "" && !isValidUkPhoneNumber(draft.phone)
              }
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
            />
          </Field>
        </div>
      </WizardShell>
    );
  }

  if (step === "terms") {
    return (
      <WizardShell
        title="Small pet enquiry"
        stepLabel="Progress"
        stepProgress={stepProgress}
        onBack={goBack}
        onContinue={goNext}
        primaryAction={
          <Button type="submit" disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
          <input
            type="checkbox"
            checked={draft.agreedToTerms}
            onChange={(e) =>
              setDraft((p) => ({ ...p, agreedToTerms: e.target.checked }))
            }
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm text-muted">I agree to the terms.</span>
        </label>
      </WizardShell>
    );
  }

  return (
    <WizardShell
      title="Small pet enquiry"
      stepLabel="Review your enquiry"
      stepProgress={stepProgress}
      onBack={goBack}
      onContinue={submit}
      primaryAction={
        <Button type="submit">
          Submit
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
      <div className="grid gap-3 text-sm text-foreground">
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pet
          </p>
          <p className="mt-1 font-semibold">{draft.petName || "—"}</p>
          <p className="mt-1 text-muted-foreground">{draft.petType || "—"}</p>
          <p className="mt-1 text-muted-foreground">Service: {draft.service || "—"}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Customer
          </p>
          <p className="mt-1 font-semibold">{draft.customerName || "—"}</p>
          <p className="mt-1 text-[color:var(--muted)]">{draft.phone || "—"}</p>
          <p className="mt-1 text-[color:var(--muted)]">{draft.email || "—"}</p>
        </div>
      </div>
    </WizardShell>
  );
}

