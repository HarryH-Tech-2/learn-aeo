import Link from "next/link";
import InView from "@/components/InView";
import { reveal } from "@/components/reveal";
import { getHieroglyphs } from "@/lib/hieroglyph-translator";

const GLYPH_FONT = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif" };

const POINTS = [
  { glyph: "𓏞", text: "Whiteboard name translator: no sign-in, works on any device" },
  { glyph: "𓏛", text: "Printable A4 worksheet with alphabet chart and answer key" },
  { glyph: "𓂀", text: "Ready-made 50-minute lesson for the KS2 Ancient Egypt depth study" },
];

// Server component; scroll-reveal is CSS via <InView> + .reveal.
export default function TeachersSection() {
  return (
    <section id="teachers" className="relative py-20 overflow-hidden">
      <InView className="max-w-7xl mx-auto px-6 lg:px-8" margin="-100px">
        <div
          className="reveal border border-gold-500/25 bg-gold-500/[0.04] grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 p-8 md:p-12"
          style={reveal(0, { y: 24 })}
        >
          <div>
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="h-px w-12 bg-gold-700" />
              <span className="font-body text-xs tracking-[0.3em] uppercase text-gold-500">
                For Teachers
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-sand-100 mb-4">
              Teaching Ancient Egypt?{" "}
              <span className="text-gradient-gold font-medium">Put every pupil&apos;s name in a cartouche.</span>
            </h2>
            <p className="font-body text-sand-400 font-light leading-relaxed max-w-xl mb-8">
              Free classroom resources built on the same real Gardiner-list signs as the
              course: no pupil accounts, no adverts, free to photocopy.
            </p>
            <ul className="space-y-3 mb-8">
              {POINTS.map((p) => (
                <li key={p.text} className="flex items-start gap-3">
                  <span className="text-xl text-gold-400 leading-none mt-0.5" style={GLYPH_FONT}>
                    {p.glyph}
                  </span>
                  <span className="font-body text-sm text-sand-300">{p.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/teachers" className="btn-primary">
                Teacher resources
              </Link>
              <Link href="/teachers/worksheet" className="btn-secondary">
                Get the free worksheet
              </Link>
            </div>
          </div>

          {/* Classroom cartouches */}
          <div className="flex flex-col justify-center gap-4">
            {["Amelia", "Noah", "Priya"].map((name, i) => (
              <div
                key={name}
                className="reveal flex items-center gap-4"
                style={reveal(0.2 + i * 0.15, { x: 24, dur: 0.6 })}
              >
                <span className="font-body text-xs tracking-[0.15em] uppercase text-sand-500 w-14 shrink-0 text-right">
                  {name}
                </span>
                <div className="relative flex-1 px-6 py-2 border-2 border-gold-500/50 rounded-[40px] bg-obsidian-light/40 text-center">
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-6 border-2 border-gold-500/50 border-l-0 rounded-r-md" />
                  <span className="text-2xl md:text-3xl text-gold-400" style={GLYPH_FONT}>
                    {getHieroglyphs(name)}
                  </span>
                </div>
              </div>
            ))}
            <p className="font-body text-xs text-sand-600 text-center mt-2">
              Written with the 24 uniliteral signs, exactly as on the worksheet
            </p>
          </div>
        </div>
      </InView>
    </section>
  );
}
