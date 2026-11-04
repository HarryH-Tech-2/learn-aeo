import { normalizeTarget } from "@/lib/safe-fetch";

/** "example.com/blog/post?x=1" or a full URL → https URL on a public host, or an error for the visitor. */
export function normalizePageUrl(input: string): { ok: true; url: string } | { ok: false; error: string } {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter the address of a page." };
  let parsed: URL;
  try {
    parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "That doesn't look like a web address." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return { ok: false, error: "Only http and https pages can be checked." };
  const target = normalizeTarget(parsed.hostname);
  if (!target.ok) return { ok: false, error: target.error };
  return { ok: true, url: `${parsed.protocol}//${target.host}${parsed.pathname}${parsed.search}` };
}
