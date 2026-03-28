"use server";

import { prisma } from "@/server/db";
import { getAdminSession } from "@/server/adminSession";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.adminUser.findUnique({
    where: { username },
    select: { id: true, passwordHash: true, active: true },
  });

  if (!user || !user.active) return { ok: false as const };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { ok: false as const };

  const session = await getAdminSession();
  session.adminUserId = user.id;
  await session.save();
  return { ok: true as const };
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const submitAction = async (formData: FormData) => {
    "use server";
    const res = await loginAction(formData);
    if (!res.ok) redirect("/admin/login?error=1");
    redirect("/admin/enquiries");
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
      <header className="mb-10">
        <p className="text-sm font-medium text-muted-foreground">Furry Flitchers</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Back-office login
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Use your admin username and password.
        </p>
      </header>

      <Card>
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Login failed. Please try again.
          </div>
        ) : null}

        <form
          action={submitAction}
          className="grid gap-4"
        >
          <Field label="Username">
            <TextInput name="username" autoComplete="username" required />
          </Field>
          <Field label="Password">
            <TextInput
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Button type="submit">Sign in</Button>
        </form>
      </Card>
    </main>
  );
}
