import { prisma } from "@/server/db";
import { requireAdminUser } from "@/server/adminAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { revalidatePath } from "next/cache";

const SETTINGS = [
  {
    key: "rejectionMessage",
    label: "Rejection message (shown when dog group is not accepted)",
  },
  { key: "adminWhatsappNumber", label: "Admin WhatsApp number (E.164)" },
  { key: "termsUrl", label: "Terms URL" },
];

async function saveSetting(formData: FormData) {
  "use server";
  await requireAdminUser();
  const key = String(formData.get("key") ?? "");
  const value = String(formData.get("value") ?? "");
  if (!SETTINGS.some((s) => s.key === key)) return;

  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  const rows = await prisma.setting.findMany({
    where: { key: { in: SETTINGS.map((s) => s.key) } },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8 lg:px-8 lg:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Configure screening messaging and notifications.
        </p>
      </header>

      <Card>
        <div className="grid gap-6">
          {SETTINGS.map((s) => (
            <form
              key={s.key}
              action={saveSetting}
              className="rounded-xl border border-border p-4"
            >
              <input type="hidden" name="key" value={s.key} />
              <Field label={s.label}>
                <TextInput
                  name="value"
                  defaultValue={byKey.get(s.key) ?? ""}
                  placeholder=""
                />
              </Field>
              <div className="mt-4 flex gap-3">
                <Button type="submit" className="px-4 py-2">
                  Save
                </Button>
              </div>
            </form>
          ))}
        </div>

      </Card>
    </main>
  );
}

