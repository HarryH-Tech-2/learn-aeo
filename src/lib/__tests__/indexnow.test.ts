import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/site";

describe("IndexNow setup", () => {
  const root = path.resolve(__dirname, "../../..");
  const cfg = JSON.parse(fs.readFileSync(path.join(root, "scripts/indexnow.config.json"), "utf8")) as { key: string; host: string };

  it("pings for this site's host", () => {
    expect(cfg.host).toBe(SITE.host);
  });

  it("serves the key file IndexNow checks", () => {
    expect(cfg.key).toMatch(/^[a-zA-Z0-9-]{8,128}$/);
    expect(fs.readFileSync(path.join(root, "public", `${cfg.key}.txt`), "utf8").trim()).toBe(cfg.key);
  });
});
