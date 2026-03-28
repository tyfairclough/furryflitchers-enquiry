import { z } from "zod";

const verifyResponseSchema = z.object({
  success: z.boolean(),
  "error-codes": z.array(z.string()).optional(),
});

const LOCAL_HOST_RE = /^localhost(?::\d+)?$/i;
const LOOPBACK_HOST_RE = /^127\.0\.0\.1(?::\d+)?$/;

/** Skip verification in dev, on localhost, or when explicitly disabled (e.g. staging). */
export function shouldSkipHcaptchaForRequest(req: Request): boolean {
  const flag = process.env.DISABLE_HCAPTCHA?.toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return true;
  if (process.env.NODE_ENV === "development") return true;
  const host = req.headers.get("host") ?? "";
  return LOCAL_HOST_RE.test(host) || LOOPBACK_HOST_RE.test(host);
}

export async function verifyHcaptchaToken(opts: {
  token: string | null;
  remoteip?: string | null;
  skipVerification?: boolean;
}) {
  if (opts.skipVerification) return { ok: true as const, skipped: true as const };

  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return { ok: true as const, skipped: true as const };

  if (!opts.token) return { ok: false as const, error: "MISSING_TOKEN" };

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", opts.token);
  if (opts.remoteip) body.set("remoteip", opts.remoteip);

  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json().catch(() => null);
  const parsed = verifyResponseSchema.safeParse(json);
  if (!parsed.success) return { ok: false as const, error: "BAD_RESPONSE" };
  if (!parsed.data.success) {
    return { ok: false as const, error: "FAILED", codes: parsed.data["error-codes"] ?? [] };
  }
  return { ok: true as const, skipped: false as const };
}

