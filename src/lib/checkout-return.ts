/**
 * Where a buyer goes back to when they leave Stripe Checkout, and how the sign-up card recognises someone on their
 * way to pay.
 *
 * Cancel used to always land on /pricing, which most buyers had never seen: they came from the dashboard, a lesson
 * or a locked game (GA4, May–Oct 2026). Now the page they came from travels with them as ?from= and comes back as
 * the cancel link. Only a same-site relative path is accepted, so it can never become an open redirect.
 */

const FALLBACK = "/pricing";

// Pages that are steps on the way to Stripe, not somewhere to come back to.
const NOT_A_RETURN = ["/checkout", "/get-started", "/login", "/api"];

/** A same-site path to send a buyer back to, with any old checkout= flag removed; /pricing when unsafe or missing. */
export function safeReturnPath(raw: string | null | undefined): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return FALLBACK;
  // a backslash reads as "/" to browsers ("/\\evil.com" is off-site)
  if (raw.length > 512 || /[\s<>"'`\\]/.test(raw)) return FALLBACK;
  let url: URL;
  try {
    url = new URL(raw, "https://x.invalid");
  } catch {
    return FALLBACK;
  }
  if (url.origin !== "https://x.invalid") return FALLBACK;
  if (NOT_A_RETURN.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return FALLBACK;
  url.searchParams.delete("checkout");
  return url.pathname + url.search + url.hash;
}

/** The Stripe cancel_url: the return path with checkout=cancelled added before any #hash. */
export function cancelUrlFor(base: string, from: string | null | undefined): string {
  const path = safeReturnPath(from);
  const hashAt = path.indexOf("#");
  const beforeHash = hashAt === -1 ? path : path.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : path.slice(hashAt);
  return `${base}${beforeHash}${beforeHash.includes("?") ? "&" : "?"}checkout=cancelled${hash}`;
}

/** True for the sign-up card's "next" when it leads to payment: "checkout" or any /checkout path. */
export function isBuyIntent(next: string | null | undefined): boolean {
  return next === "checkout" || (typeof next === "string" && (next === "/checkout" || next.startsWith("/checkout?")));
}

/** The plan named in a /checkout?plan=… destination, or null (which means Lifetime). */
export function planIdFromCheckoutPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/checkout")) return null;
  const q = path.indexOf("?");
  return q === -1 ? null : new URLSearchParams(path.slice(q + 1)).get("plan");
}
