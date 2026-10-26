/**
 * A small in-memory throttle for endpoints that send email to an address the visitor types (the keyboard's and
 * translator's "email it to me"). Best effort: each serverless instance keeps its own window, so it stops a
 * script hammering one instance rather than guaranteeing a global cap, which is enough to keep the Resend
 * domain's reputation safe from casual abuse without a new table.
 */
const hits = new Map<string, number[]>();

/** True if `key` has had fewer than `max` hits in the last `windowMs`; records this one when allowed. */
export function allowSend(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // keep the map from growing without bound on a long-lived instance
  if (hits.size > 5000) for (const k of [...hits.keys()].slice(0, 1000)) hits.delete(k);
  return true;
}

export function clientIp(request: Request): string {
  return (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}
