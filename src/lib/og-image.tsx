// The Open Graph card for generated share images (next/og ImageResponse, which supports flex
// layout only). Brand colors match the site: navy, cyan eyebrow, gold accents. It uses
// next/og's built-in font, so builds never fetch a font over the network.

import type { ReactElement } from "react";

export const OG_SIZE = { width: 1200, height: 630 };

const NAVY = "#04060d";
const CYAN = "#6fe3ff";
const GOLD = "#ffc76b";
const SAND = "#e6ebf5";

/** Title font size in px: smaller as the title gets longer, so it stays within three lines. */
export function ogTitleSize(title: string): number {
  if (title.length <= 32) return 84;
  if (title.length <= 56) return 68;
  return 54;
}

export function ogCard(o: { eyebrow: string; title: string; footer: string }): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: `radial-gradient(ellipse 80% 70% at 50% 30%, #16294a 0%, ${NAVY} 70%)`,
        color: SAND,
        border: `6px solid ${GOLD}`,
      }}
    >
      <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: CYAN }}>
        {o.eyebrow}
      </div>
      <div style={{ display: "flex", fontSize: ogTitleSize(o.title), lineHeight: 1.08, maxWidth: 1000 }}>{o.title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ display: "flex", fontSize: 30, color: GOLD }}>{o.footer}</div>
        <div style={{ display: "flex", fontSize: 40 }}>
          Learn&nbsp;<span style={{ color: GOLD }}>AEO</span>
        </div>
      </div>
    </div>
  );
}
