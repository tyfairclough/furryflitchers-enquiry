import { prisma } from "@/server/db";

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getSettingWithDefault(
  key: string,
  defaultValue: string,
) {
  return (await getSetting(key)) ?? defaultValue;
}

