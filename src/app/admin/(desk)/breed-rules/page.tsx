import type { BreedRuleType } from "@prisma/client";
import { prisma } from "@/server/db";
import { requireAdminUser } from "@/server/adminAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { revalidatePath } from "next/cache";

const RULE_TYPES: BreedRuleType[] = ["allowed", "maleNeuteredOnly", "banned"];

function isBreedRuleType(v: string): v is BreedRuleType {
  return (RULE_TYPES as string[]).includes(v);
}

async function createBreedRule(formData: FormData) {
  "use server";
  await requireAdminUser();
  const breedName = String(formData.get("breedName") ?? "").trim();
  const ruleType = String(formData.get("ruleType") ?? "").trim();
  if (!breedName) return;
  if (!isBreedRuleType(ruleType)) return;

  await prisma.breedRule.upsert({
    where: { breedName },
    create: { breedName, ruleType, active: true },
    update: { ruleType, active: true },
  });
  revalidatePath("/admin/breed-rules");
}

async function updateBreedRuleType(id: string, formData: FormData) {
  "use server";
  await requireAdminUser();
  const ruleType = String(formData.get("ruleType") ?? "").trim();
  if (!isBreedRuleType(ruleType)) return;
  const row = await prisma.breedRule.findUnique({ where: { id } });
  if (!row) return;
  await prisma.breedRule.update({
    where: { id },
    data: { ruleType },
  });
  revalidatePath("/admin/breed-rules");
}

async function toggleActive(id: string) {
  "use server";
  await requireAdminUser();
  const row = await prisma.breedRule.findUnique({ where: { id } });
  if (!row) return;
  await prisma.breedRule.update({
    where: { id },
    data: { active: !row.active },
  });
  revalidatePath("/admin/breed-rules");
}

export default async function AdminBreedRulesPage() {
  const rules = await prisma.breedRule.findMany({
    orderBy: [{ active: "desc" }, { breedName: "asc" }],
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 lg:px-8 lg:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Breed rules</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Only <span className="font-medium text-foreground">active</span> breeds appear in
          the dog enquiry autocomplete. When someone submits, each dog is checked in order:
          under six months old is declined; unneutered females are declined; certain breed
          families are always declined if they appear in the screening text (including
          crossbreeds described that way); then the rule for the matched breed applies —
          banned, allowed, or male and neutered only. The whole group is accepted only if
          every dog passes.
        </p>
        <details className="mt-4 rounded-xl border border-border bg-card/50 p-4 text-sm leading-6 text-muted-foreground open:bg-card">
          <summary className="cursor-pointer rounded-lg font-semibold text-foreground marker:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 [&::-webkit-details-marker]:text-muted-foreground">
            Loading many breeds (CSV, stdin, or interactive)
          </summary>
          <p className="mt-3">
            You can add breeds here one at a time, or bootstrap a longer list: export your
            sheet as CSV (column A header <code className="rounded bg-muted px-1 py-0.5 text-xs">Breed</code>, then
            names), then run{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              npm run import:breeds -- ./your-export.csv
            </code>{" "}
            with the real path to the file. Alternatively run{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run import:breeds</code>{" "}
            with no arguments to paste names in the terminal, or use{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">--stdin</code> to pipe input.
          </p>
        </details>
      </header>

      <Card>
        <form action={createBreedRule} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Breed name">
              <TextInput name="breedName" placeholder="e.g. Labrador Retriever" />
            </Field>
            <Field label="Rule type">
              <Select name="ruleType" defaultValue="allowed">
                <option value="allowed">Allowed</option>
                <option value="maleNeuteredOnly">Male + neutered only</option>
                <option value="banned">Banned</option>
              </Select>
            </Field>
          </div>
          <div className="flex gap-3">
            <Button type="submit">Save</Button>
          </div>
        </form>

        <hr className="my-6 border-border" />

        <div className="grid gap-2">
          {rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No breed rules yet.</p>
          ) : (
            rules.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {r.breedName}{" "}
                    {!r.active ? (
                      <span className="ml-2 text-xs font-semibold text-muted-foreground">
                        (inactive)
                      </span>
                    ) : null}
                  </p>
                  <form
                    action={updateBreedRuleType.bind(null, r.id)}
                    className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    <label className="sr-only" htmlFor={`rule-type-${r.id}`}>
                      Rule type for {r.breedName}
                    </label>
                    <Select
                      id={`rule-type-${r.id}`}
                      name="ruleType"
                      defaultValue={r.ruleType}
                      className="h-10 w-full min-w-[12rem] sm:max-w-xs"
                    >
                      <option value="allowed">Allowed</option>
                      <option value="maleNeuteredOnly">Male + neutered only</option>
                      <option value="banned">Banned</option>
                    </Select>
                    <Button type="submit" variant="secondary" className="h-10 shrink-0 px-3 text-xs">
                      Update rule
                    </Button>
                  </form>
                </div>
                <form action={toggleActive.bind(null, r.id)} className="shrink-0">
                  <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">
                    {r.active ? "Deactivate" : "Activate"}
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </Card>
    </main>
  );
}

