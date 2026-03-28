import { prisma } from "@/server/db";
import { requireAdminUser } from "@/server/adminAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { revalidatePath } from "next/cache";

async function createAnimalType(formData: FormData) {
  "use server";
  await requireAdminUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.animalType.upsert({
    where: { name },
    create: { name, active: true },
    update: { active: true },
  });
  revalidatePath("/admin/animal-types");
}

async function toggleActive(id: string) {
  "use server";
  await requireAdminUser();
  const row = await prisma.animalType.findUnique({ where: { id } });
  if (!row) return;
  await prisma.animalType.update({
    where: { id },
    data: { active: !row.active },
  });
  revalidatePath("/admin/animal-types");
}

export default async function AdminAnimalTypesPage() {
  const types = await prisma.animalType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 lg:px-8 lg:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Animal types</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Manage the small pet type list.
        </p>
      </header>

      <Card>
        <form action={createAnimalType} className="grid gap-4">
          <Field label="Animal type name">
            <TextInput name="name" placeholder="e.g. Rabbit" />
          </Field>
          <div className="flex gap-3">
            <Button type="submit">Save</Button>
          </div>
        </form>

        <hr className="my-6 border-border" />

        <div className="grid gap-2">
          {types.length === 0 ? (
            <p className="text-sm text-muted-foreground">No animal types yet.</p>
          ) : (
            types.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {t.name}{" "}
                    {!t.active ? (
                      <span className="ml-2 text-xs font-semibold text-muted-foreground">
                        (inactive)
                      </span>
                    ) : null}
                  </p>
                </div>
                <form action={toggleActive.bind(null, t.id)}>
                  <Button type="submit" variant="secondary" className="px-3 py-2 text-xs">
                    {t.active ? "Deactivate" : "Activate"}
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

