// Fetching a URL a visitor typed (the AI Crawler Checker) without letting them aim the server at
// itself or a private network (SSRF). The host is resolved once, every address is checked, and
// the socket connects only to those checked addresses, so a second DNS answer cannot swap in a
// private one. Redirects are followed by hand and re-checked; size and time are capped.

import http from "node:http";
import https from "node:https";
import dns from "node:dns";
import net from "node:net";
import type { LookupFunction } from "node:net";

// ── addresses ───────────────────────────────────────────────────────────────

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((n, part) => n * 256 + Number(part), 0);
}

const BLOCKED_V4: [string, number][] = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16],
  ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
  ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
];

function isPublicV4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return !BLOCKED_V4.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return ((n & mask) >>> 0) === ((ipv4ToInt(base) & mask) >>> 0);
  });
}

/** The 8 hextets of an IPv6 address (an embedded dotted IPv4 tail becomes the last two). */
function ipv6Hextets(ip: string): number[] {
  let s = ip.toLowerCase().replace(/%.*$/, "");
  const v4 = s.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4) {
    const n = ipv4ToInt(v4[1]);
    s = s.slice(0, -v4[1].length) + `${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const [head, tail] = s.includes("::") ? s.split("::") : [s, null];
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const fill = tail === null ? [] : Array(8 - h.length - t.length).fill("0");
  return [...h, ...fill, ...t].map((x) => parseInt(x || "0", 16));
}

function isPublicV6(ip: string): boolean {
  const x = ipv6Hextets(ip);
  const allZeroUpTo = (k: number) => x.slice(0, k).every((v) => v === 0);
  // ::ffff:a.b.c.d (mapped) and ::a.b.c.d (compatible): judge the IPv4 inside.
  if (allZeroUpTo(5) && (x[5] === 0xffff || x[5] === 0) && (x[6] !== 0 || x[7] > 1)) {
    return isPublicV4(`${x[6] >> 8}.${x[6] & 255}.${x[7] >> 8}.${x[7] & 255}`);
  }
  if (allZeroUpTo(7) && x[7] <= 1) return false; // :: and ::1
  if ((x[0] & 0xfe00) === 0xfc00) return false; // fc00::/7 unique local
  if ((x[0] & 0xffc0) === 0xfe80) return false; // fe80::/10 link-local
  if ((x[0] & 0xff00) === 0xff00) return false; // ff00::/8 multicast
  if (x[0] === 0x2001 && x[1] === 0x0db8) return false; // 2001:db8::/32 documentation
  if (x[0] === 0x64 && x[1] === 0xff9b && x[2] === 0 && x[3] === 0 && x[4] === 0 && x[5] === 0) return false; // 64:ff9b::/96 NAT64
  return true;
}

/** Whether a server may connect to this address. Anything unparsable is refused. */
export function isPublicAddress(ip: string): boolean {
  const kind = net.isIP(ip.replace(/%.*$/, ""));
  if (kind === 4) return isPublicV4(ip);
  if (kind === 6) return isPublicV6(ip);
  return false;
}

// ── user input ──────────────────────────────────────────────────────────────

const LOCAL_SUFFIXES = [".localhost", ".local", ".internal", ".home.arpa", ".lan", ".intranet"];

/** A visitor's input ("example.com", "https://example.com/page") as a host the tool may fetch. */
export function normalizeTarget(input: string): { ok: true; host: string } | { ok: false; error: string } {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter a domain, like example.com." };
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "That doesn't look like a domain." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, error: "Use an http or https address." };
  if (url.username || url.password) return { ok: false, error: "Leave out any user name or password." };
  if (url.port && url.port !== "80" && url.port !== "443") return { ok: false, error: "Only the standard web ports (80 and 443) can be checked." };
  const host = url.hostname.replace(/\.$/, "").toLowerCase();
  if (net.isIP(host.replace(/^\[|\]$/g, ""))) return { ok: false, error: "Enter a domain name, not an IP address." };
  if (host === "localhost" || LOCAL_SUFFIXES.some((s) => host.endsWith(s)) || !host.includes(".")) {
    return { ok: false, error: "Enter a public domain name." };
  }
  return { ok: true, host };
}

// ── fetching ────────────────────────────────────────────────────────────────

export type ResolvedAddress = { address: string; family: number };
export type Resolver = (host: string) => Promise<ResolvedAddress[]>;

export type SafeFetchResult =
  | { ok: true; status: number; finalUrl: string; text: string; truncated: boolean }
  | { ok: false; error: "blocked" | "timeout" | "too-many-redirects" | "network" };

const defaultResolver: Resolver = (host) => dns.promises.lookup(host, { all: true, verbatim: true });

const USER_AGENT = "LearnAEO-CrawlerChecker/1.0 (+https://www.learnaeo.com/tools/ai-crawler-checker)";

class Blocked extends Error {}

/** One GET, connecting only to the checked addresses. Resolves with status, location and body. */
function request(
  url: URL,
  addresses: ResolvedAddress[],
  maxBytes: number,
  signal: AbortSignal
): Promise<{ status: number; location: string | null; text: string; truncated: boolean }> {
  return new Promise((resolve, reject) => {
    const pinned: LookupFunction = (_host, options, cb) => {
      const all = (options as { all?: boolean }).all;
      if (all) (cb as unknown as (e: null, a: ResolvedAddress[]) => void)(null, addresses);
      else cb(null, addresses[0].address, addresses[0].family);
    };
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: { "User-Agent": USER_AGENT, Accept: "text/plain, */*;q=0.5" },
        lookup: pinned,
        signal,
      },
      (res) => {
        const chunks: Buffer[] = [];
        let size = 0;
        let truncated = false;
        const status = res.statusCode ?? 0;
        const location = typeof res.headers.location === "string" ? res.headers.location : null;
        if (status >= 300 && status < 400 && location) {
          res.destroy();
          return resolve({ status, location, text: "", truncated: false });
        }
        res.on("data", (chunk: Buffer) => {
          if (truncated) return;
          const room = maxBytes - size;
          if (chunk.length >= room) {
            chunks.push(chunk.subarray(0, room));
            size = maxBytes;
            truncated = true;
            res.destroy();
            resolve({ status, location: null, text: new TextDecoder().decode(Buffer.concat(chunks)), truncated });
            return;
          }
          chunks.push(chunk);
          size += chunk.length;
        });
        res.on("end", () => resolve({ status, location: null, text: new TextDecoder().decode(Buffer.concat(chunks)), truncated }));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.end();
  });
}

/**
 * GET a URL a visitor supplied. Refuses (error "blocked") IP literals that are not public, hosts
 * that resolve to any non-public address, and ports outside `allowedPorts`, on the first hop and
 * every redirect. One deadline covers the whole call. The body is cut at `maxBytes`.
 */
export async function safeFetchText(
  input: string,
  opts: {
    maxBytes?: number;
    timeoutMs?: number;
    maxRedirects?: number;
    lookup?: Resolver;
    allowedPorts?: number[];
    isAllowed?: (ip: string) => boolean;
  } = {}
): Promise<SafeFetchResult> {
  const maxBytes = opts.maxBytes ?? 512 * 1024;
  const maxRedirects = opts.maxRedirects ?? 3;
  const resolver = opts.lookup ?? defaultResolver;
  const allowedPorts = opts.allowedPorts ?? [80, 443];
  const isAllowed = opts.isAllowed ?? isPublicAddress;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 8000);

  const check = async (url: URL): Promise<ResolvedAddress[]> => {
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Blocked();
    if (url.username || url.password) throw new Blocked();
    const port = Number(url.port || (url.protocol === "https:" ? 443 : 80));
    if (!allowedPorts.includes(port)) throw new Blocked();
    const host = url.hostname.replace(/^\[|\]$/g, "");
    if (net.isIP(host)) {
      if (!isAllowed(host)) throw new Blocked();
      return [{ address: host, family: net.isIP(host) }];
    }
    const addresses = await resolver(host);
    if (!addresses.length || addresses.some((a) => !isAllowed(a.address))) throw new Blocked();
    return addresses;
  };

  try {
    let url = new URL(input);
    for (let hop = 0; ; hop++) {
      const addresses = await check(url);
      if (controller.signal.aborted) return { ok: false, error: "timeout" };
      const res = await request(url, addresses, maxBytes, controller.signal);
      if (res.location) {
        if (hop >= maxRedirects) return { ok: false, error: "too-many-redirects" };
        url = new URL(res.location, url);
        continue;
      }
      return { ok: true, status: res.status, finalUrl: url.toString(), text: res.text, truncated: res.truncated };
    }
  } catch (err) {
    if (err instanceof Blocked) return { ok: false, error: "blocked" };
    if (controller.signal.aborted) return { ok: false, error: "timeout" };
    return { ok: false, error: "network" };
  } finally {
    clearTimeout(timer);
  }
}
