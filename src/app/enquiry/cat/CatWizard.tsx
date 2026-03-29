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

type BookingType = "holiday" | "regular" | "oneOff" | "";

type CatEnquiryDraft = {
  catName: string;
  bookingType: BookingType;
  customerName: string;
  phone: string;
  email: string;
  agreedToTerms: boolean;
};

type StepId = "catName" | "service" | "bookingType" | "customer" | "terms" | "review";

const defaultDraft = (): CatEnquiryDraft => ({
  catName: "",
  bookingType: "",
  customerName: "",
  phone: "",
  email: "",
  agreedToTerms: false,
});

export function CatWizard() {
  const router = useRouter();
  const { execute: executeCaptcha, element: captchaEl } = useInvisibleHcaptcha();
  const [draft, setDraft] = useState<CatEnquiryDraft>(defaultDraft);
  const [step, setStep] = useState<StepId>("catName");
  const [startedAt] = useState(() => Date.now());
  const [hp, setHp] = useState("");

  useEffect(() => {
    const saved = loadDraft<CatEnquiryDraft>("cat");
    if (saved) setDraft(saved);
  }, []);

  useEffect(() => {
    saveDraft("cat", draft);
  }, [draft]);

  const stepOrder: StepId[] = useMemo(
    () => ["catName", "service", "bookingType", "customer", "terms", "review"],
    [],
  );

  const stepIndex = stepOrder.indexOf(step);
  const stepProgress =
    stepIndex <= 0 ? 0 : stepIndex / (Math.max(1, stepOrder.length - 1));

  function canContinue(): boolean {
    switch (step) {
      case "catName":
        return draft.catName.trim().length > 0;
      case "service":
        return true;
      case "bookingType":
        return (
          draft.bookingType === "holiday" ||
          draft.bookingType === "regular" ||
          draft.bookingType === "oneOff"
        );
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
      petType: "cat" as const,
      catName: draft.catName.trim(),
      bookingType:
        draft.bookingType === "holiday"
          ? "holiday"
          : draft.bookingType === "regular"
            ? "regular"
            : "oneOff",
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

    clearDraft("cat");
    setDraft(defaultDraft());
    setStep("catName");
    router.push(`/enquiry/thanks?petType=cat&id=${encodeURIComponent(data.id)}`);
  }

  if (step === "catName") {
    return (
      <WizardShell
        title="Cat enquiry"
        stepProgress={stepProgress}
        backHref="/"
        onContinue={goNext}
        primaryAction={
          <Button type="submit" disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <Field label="Cat name">
          <TextInput
            autoFocus
            value={draft.catName}
            onChange={(e) => setDraft((p) => ({ ...p, catName: e.target.value }))}
            placeholder="e.g. Luna"
          />
        </Field>
      </WizardShell>
    );
  }

  if (step === "service") {
    return (
      <WizardShell
        title="Cat enquiry"
        stepProgress={stepProgress}
        onBack={goBack}
        onContinue={goNext}
        primaryAction={
          <Button type="submit" disabled={!canContinue()}>
            Continue
          </Button>
        }
      >
        <div className="grid gap-3">
          <p className="text-sm font-semibold text-muted">Choose service</p>
          <p className="text-sm text-muted-foreground">
            Cat enquiries are pop-in only.
          </p>
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Selected: <span className="font-medium">Pop-in</span>
          </div>
        </div>
      </WizardShell>
    );
  }

  if (step === "bookingType") {
    return (
      <WizardShell
        title="Cat enquiry"
        stepProgress={stepProgress}
        onBack={goBack}
        onContinue={goNext}
        primaryAction={
          <Button type="submit" disabled={!canContinue()}>
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

  if (step === "customer") {
    return (
      <WizardShell
        title="Cat enquiry"
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
        title="Cat enquiry"
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
      title="Cat enquiry"
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
            Cat
          </p>
          <p className="mt-1 font-semibold">{draft.catName || "—"}</p>
          <p className="mt-1 text-muted-foreground">Service: pop-in</p>
          <p className="mt-1 text-muted-foreground">Booking: {draft.bookingType || "—"}</p>
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

