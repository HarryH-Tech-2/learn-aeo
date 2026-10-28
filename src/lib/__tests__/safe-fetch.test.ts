import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { isPublicAddress, normalizeTarget, safeFetchText } from "@/lib/safe-fetch";

describe("isPublicAddress", () => {
  it("blocks private, loopback, link-local, CGNAT, reserved, multicast and documentation IPv4", () => {
    for (const ip of [
      "0.0.0.0", "10.1.2.3", "100.64.0.1", "127.0.0.1", "169.254.169.254", "172.16.0.1", "172.31.255.255",
      "192.0.0.8", "192.0.2.1", "192.168.1.1", "198.18.0.1", "198.51.100.7", "203.0.113.9", "224.0.0.1",
      "240.0.0.1", "255.255.255.255",
    ]) expect(isPublicAddress(ip), ip).toBe(false);
  });

  it("blocks the same in IPv6, including IPv4-mapped forms", () => {
    for (const ip of ["::", "::1", "fc00::1", "fd12:3456::1", "fe80::1", "ff02::1", "2001:db8::1", "64:ff9b::a00:1", "::ffff:10.0.0.1", "::ffff:7f00:1", "::ffff:169.254.169.254"]) {
      expect(isPublicAddress(ip), ip).toBe(false);
    }
  });

  it("allows public addresses", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "172.32.0.1", "2606:4700:4700::1111", "::ffff:8.8.8.8"]) expect(isPublicAddress(ip), ip).toBe(true);
  });
});

describe("normalizeTarget", () => {
  it("accepts a bare domain or a URL and returns the lowercased host", () => {
    expect(normalizeTarget("  Example.COM ")).toEqual({ ok: true, host: "example.com" });
    expect(normalizeTarget("https://www.example.com/some/page?x=1")).toEqual({ ok: true, host: "www.example.com" });
    expect(normalizeTarget("http://example.com:443/")).toEqual({ ok: true, host: "example.com" });
  });

  it("rejects IP literals in every form, local names, odd ports, credentials and other schemes", () => {
    for (const bad of [
      "127.0.0.1", "2130706433", "127.1", "0x7f.1", "[::1]", "http://[::ffff:127.0.0.1]/", "8.8.8.8",
      "localhost", "foo.localhost", "printer.local", "db.internal", "router.home.arpa", "intranet",
      "https://example.com:8080", "https://user:pass@example.com", "ftp://example.com", "file:///etc/passwd", "javascript:alert(1)", "",
    ]) expect(normalizeTarget(bad).ok, bad).toBe(false);
  });
});

describe("safeFetchText", () => {
  let server: http.Server;
  let port: number;
  beforeAll(async () => {
    server = http.createServer((req, res) => {
      if (req.url === "/robots.txt") return res.end("User-agent: *\nDisallow: /private\n");
      if (req.url === "/big") {
        res.write("x".repeat(2 * 1024 * 1024));
        return res.end();
      }
      if (req.url === "/hang") {
        res.write("partial");
        return; // never ends
      }
      if (req.url?.startsWith("/redirect/")) {
        const n = Number(req.url.split("/")[2]);
        res.statusCode = 302;
        res.setHeader("Location", n > 0 ? `/redirect/${n - 1}` : "/robots.txt");
        return res.end();
      }
      if (req.url === "/to-private") {
        res.statusCode = 301;
        res.setHeader("Location", "http://private.test/robots.txt");
        return res.end();
      }
      res.statusCode = 404;
      res.end("nope");
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    port = (server.address() as AddressInfo).port;
  });
  afterAll(() => {
    server.closeAllConnections();
    server.close();
  });

  // fixture.test resolves to the local server; private.test to a private address.
  const lookup = async (host: string) =>
    host === "fixture.test" ? [{ address: "127.0.0.1", family: 4 }] : host === "private.test" ? [{ address: "10.0.0.1", family: 4 }] : [];
  const testOpts = () => ({ lookup, allowedPorts: [port], isAllowed: (ip: string) => ip === "127.0.0.1" || isPublicAddress(ip) });
  const url = (p: string) => `http://fixture.test:${port}${p}`;

  it("fetches text", async () => {
    const r = await safeFetchText(url("/robots.txt"), testOpts());
    expect(r).toMatchObject({ ok: true, status: 200, truncated: false });
    if (r.ok) expect(r.text).toContain("Disallow: /private");
  });

  it("reports the status of a missing file", async () => {
    expect(await safeFetchText(url("/missing"), testOpts())).toMatchObject({ ok: true, status: 404 });
  });

  it("refuses a host that resolves to any private address, before connecting", async () => {
    const mixed = async () => [{ address: "8.8.8.8", family: 4 }, { address: "10.0.0.1", family: 4 }];
    expect(await safeFetchText("https://example.com/robots.txt", { lookup: mixed })).toEqual({ ok: false, error: "blocked" });
  });

  it("refuses a redirect to a private host", async () => {
    expect(await safeFetchText(url("/to-private"), { ...testOpts(), allowedPorts: [port, 80] })).toEqual({ ok: false, error: "blocked" });
  });

  it("follows up to 3 redirects and refuses a 4th", async () => {
    expect(await safeFetchText(url("/redirect/2"), testOpts())).toMatchObject({ ok: true, status: 200 });
    expect(await safeFetchText(url("/redirect/3"), testOpts())).toEqual({ ok: false, error: "too-many-redirects" });
  });

  it("caps the body", async () => {
    const r = await safeFetchText(url("/big"), testOpts());
    expect(r).toMatchObject({ ok: true, truncated: true });
    if (r.ok) expect(r.text.length).toBeLessThanOrEqual(512 * 1024);
  });

  it("times out a response that never ends", async () => {
    const t0 = Date.now();
    expect(await safeFetchText(url("/hang"), { ...testOpts(), timeoutMs: 300 })).toEqual({ ok: false, error: "timeout" });
    expect(Date.now() - t0).toBeLessThan(2000);
  });

  it("refuses ports and IP literals outside the rules", async () => {
    expect(await safeFetchText(`http://fixture.test:${port}/robots.txt`, { lookup })).toEqual({ ok: false, error: "blocked" });
    expect(await safeFetchText("http://127.0.0.1/robots.txt")).toEqual({ ok: false, error: "blocked" });
  });
});
