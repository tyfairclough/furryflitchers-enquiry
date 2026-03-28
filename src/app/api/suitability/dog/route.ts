import { NextResponse } from "next/server";
import { z } from "zod";
import { dogInputSchema, evaluateDogGroupSuitability } from "@/server/suitability";
import { getSettingWithDefault } from "@/server/settings";

export const runtime = "nodejs";

const requestSchema = z.object({
  dogs: z.array(dogInputSchema).min(1),
});

const DEFAULT_REJECTION_MESSAGE =
  "Thanks for your enquiry. Based on the details provided, we’re not able to accept this booking right now. If you think this is a mistake, please contact us and we’ll help.";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 },
    );
  }

  const result = await evaluateDogGroupSuitability(parsed.data.dogs);
  const rejectionMessage = await getSettingWithDefault(
    "rejectionMessage",
    DEFAULT_REJECTION_MESSAGE,
  );

  return NextResponse.json({
    accepted: result.accepted,
    dogs: result.dogs,
    rejectionMessage,
  });
}

