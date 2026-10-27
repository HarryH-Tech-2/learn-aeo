import { describe, expect, it, vi } from "vitest";

vi.mock("next-auth/react", () => ({ useSession: () => ({ data: null, status: "unauthenticated" }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

import { renderToStaticMarkup } from "react-dom/server";
import CityMap from "@/components/CityMap";
import { districtViews } from "@/lib/city-map";
import { LESSON_CATALOG, lessonPath } from "@/lib/lesson-catalog";
import type { LessonMeta } from "@/lib/lesson-types";

const catalog: LessonMeta[] = LESSON_CATALOG.map((l) => ({ ...l, status: l.order <= 3 ? "live" : "coming-soon" }));
const html = renderToStaticMarkup(<CityMap districts={districtViews(catalog, null, false)} />);

describe("CityMap", () => {
  it("renders all eight districts", () => {
    for (const l of catalog) expect(html).toContain(l.district);
    expect((html.match(/data-district=/g) ?? []).length).toBe(8);
  });

  it("links the next district to its lesson", () => {
    expect(html).toContain(`href="${lessonPath(catalog[0].id)}"`);
  });

  it("links locked districts to /pricing", () => {
    expect(html).toContain('href="/pricing"');
    expect(html).toContain("Locked");
  });

  it("does not link coming-soon districts", () => {
    expect(html).not.toContain(lessonPath(catalog[3].id));
    const soon = html.split("data-district=").filter((s) => s.includes("Coming soon"));
    expect(soon.length).toBe(5);
    for (const s of soon) expect(s.split("data-district=")[0]).not.toContain("href=");
  });
});
