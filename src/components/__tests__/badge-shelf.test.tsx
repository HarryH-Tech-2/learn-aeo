import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BadgeShelf, { getHowToEarn } from "@/components/BadgeShelf";
import { BADGE_DEFINITIONS } from "@/lib/gamification";

const OLD = /thoth|temple|site report|matching game/i;

describe("BadgeShelf", () => {
  it.each(BADGE_DEFINITIONS.map((b) => [b.criteria] as const))("has a specific hint for %s", (criteria) => {
    const hint = getHowToEarn(criteria);
    expect(hint).not.toBe(getHowToEarn("unknown"));
    expect(hint).not.toMatch(OLD);
  });

  it("explains the milestone thresholds", () => {
    expect(getHowToEarn("milestone:half-city")).toMatch(/4/);
    expect(getHowToEarn("milestone:all-districts")).toMatch(/8|every/);
    expect(getHowToEarn("perfect-audit")).toMatch(/audit/i);
  });

  it("renders every badge with its icon", () => {
    const html = renderToStaticMarkup(<BadgeShelf badges={[]} />);
    for (const b of BADGE_DEFINITIONS) {
      expect(html).toContain(b.icon);
      expect(html).toContain(b.name);
    }
  });
});
