type Bucket = { count: number; resetAtMs: number };

const ipBuckets = new Map<string, Bucket>();
const emailBuckets = new Map<string, Bucket>();

function take(map: Map<string, Bucket>, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = map.get(key);
  if (!bucket || bucket.resetAtMs <= now) {
    map.set(key, { count: 1, resetAtMs: now + windowMs });
    return { ok: true as const };
  }
  if (bucket.count >= limit) return { ok: false as const, retryAfterMs: bucket.resetAtMs - now };
  bucket.count += 1;
  return { ok: true as const };
}

export function rateLimitCheck(opts: {
  ip: string | null;
  email: string | null;
  ipLimitPerMinute?: number;
  emailLimitPerMinute?: number;
}) {
  const ipLimit = opts.ipLimitPerMinute ?? 20;
  const emailLimit = opts.emailLimitPerMinute ?? 10;
  const windowMs = 60_000;

  if (opts.ip) {
    const r = take(ipBuckets, opts.ip, ipLimit, windowMs);
    if (!r.ok) return { ok: false as const, reason: "RATE_LIMIT_IP", retryAfterMs: r.retryAfterMs };
  }
  if (opts.email) {
    const r = take(emailBuckets, opts.email.toLowerCase(), emailLimit, windowMs);
    if (!r.ok) return { ok: false as const, reason: "RATE_LIMIT_EMAIL", retryAfterMs: r.retryAfterMs };
  }
  return { ok: true as const };
}

