// A sliding-window rate limit for the server tools, kept in memory. On Vercel each running
// instance has its own memory, so this caps bursts per instance rather than globally; it is
// meant to stop one visitor hammering the checker, not to meter usage exactly.

const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number; now?: number }
): { ok: boolean; retryAfterSec: number } {
  const now = opts.now ?? Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => t > now - opts.windowMs);
  if (recent.length >= opts.limit) {
    hits.set(key, recent);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((recent[0] + opts.windowMs - now) / 1000)) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) {
    // Drop keys with no recent hits so the map cannot grow without bound.
    for (const [k, ts] of hits) if (!ts.some((t) => t > now - opts.windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfterSec: 0 };
}

/** The visitor's address as Vercel passes it: the first x-forwarded-for hop, else x-real-ip. */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || req.headers.get("x-real-ip")?.trim() || "unknown";
}
