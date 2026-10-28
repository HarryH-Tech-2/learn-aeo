import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ToolMeta } from "@/lib/tools";

const tools = vi.hoisted(() => ({ list: [] as ToolMeta[] }));
vi.mock("@/lib/tools", async (orig) => {
  const real = await orig<typeof import("@/lib/tools")>();
  return { ...real, get TOOLS() { return tools.list; } };
});

import ToolsSection from "@/components/ToolsSection";
import { TOOLS as REAL } from "@/lib/tools";

describe("ToolsSection", () => {
  it("shows every tool as coming soon, with no links, while none is live", async () => {
    const real = (await vi.importActual<typeof import("@/lib/tools")>("@/lib/tools")).TOOLS;
    tools.list = real.map((t) => ({ ...t, status: "coming-soon" as const }));
    const html = renderToStaticMarkup(<ToolsSection />);
    for (const t of real) expect(html).toContain(t.name);
    expect(html.match(/Coming soon/g)).toHaveLength(real.length);
    expect(html).not.toContain('href="/tools/');
  });

  it("links a live tool and only that one", async () => {
    const real = (await vi.importActual<typeof import("@/lib/tools")>("@/lib/tools")).TOOLS;
    tools.list = real.map((t, i) => ({ ...t, status: i === 0 ? ("live" as const) : ("coming-soon" as const) }));
    const html = renderToStaticMarkup(<ToolsSection />);
    expect(html.match(/href="\/tools\//g)).toHaveLength(1);
    expect(html).toContain(`href="/tools/${real[0].slug}"`);
    expect(html.match(/Coming soon/g)).toHaveLength(real.length - 1);
    void REAL;
  });
});
