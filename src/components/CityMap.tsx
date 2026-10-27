import Link from "next/link";
import type { ReactNode } from "react";
import { lessonPath } from "@/lib/lesson-catalog";
import type { DistrictStatus, DistrictView } from "@/lib/city-map";

const STATUS: Record<DistrictStatus, { label: string; badge: string; card: string; num: string }> = {
  done: {
    label: "Completed",
    badge: "text-gold-400 border-gold-500/40 bg-gold-500/10",
    card: "border-gold-500/40",
    num: "bg-gold-500 text-obsidian border-gold-500",
  },
  next: {
    label: "Up next",
    badge: "text-cyan border-cyan/40 bg-cyan/10",
    card: "border-cyan/60",
    num: "bg-cyan text-obsidian border-cyan",
  },
  open: {
    label: "Open",
    badge: "text-sand-300 border-sand-500/40",
    card: "border-sand-500/30",
    num: "bg-obsidian-lighter text-sand-200 border-sand-500/50",
  },
  locked: {
    label: "Locked",
    badge: "text-sand-400 border-sand-500/30 bg-obsidian-lighter",
    card: "border-sand-500/20",
    num: "bg-obsidian-lighter text-sand-400 border-sand-500/30",
  },
  "coming-soon": {
    label: "Coming soon",
    badge: "text-sand-500 border-sand-500/20 border-dashed",
    card: "border-sand-500/20 border-dashed opacity-70",
    num: "bg-obsidian text-sand-500 border-sand-500/30",
  },
};

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan";

function Card({ d, children }: { d: DistrictView; children: ReactNode }) {
  const s = STATUS[d.districtStatus];
  const base = `block min-w-0 border bg-obsidian-light p-4 sm:p-5 transition-colors ${s.card}`;
  if (d.districtStatus === "coming-soon") return <div className={base}>{children}</div>;
  const href = d.districtStatus === "locked" ? "/pricing" : lessonPath(d.id);
  return (
    <Link href={href} className={`${base} hover:bg-obsidian-lighter ${FOCUS}`}>
      {children}
    </Link>
  );
}

/** The eight districts of the City of Answers, in order, along one path. */
export default function CityMap({ districts }: { districts: DistrictView[] }) {
  return (
    <ol className="relative space-y-4" aria-label="Districts of the City of Answers">
      <span aria-hidden="true" className="absolute left-5 top-5 bottom-5 w-px bg-sand-500/25" />
      {districts.map((d) => {
        const s = STATUS[d.districtStatus];
        return (
          <li key={d.id} data-district={d.id} className="relative flex gap-4 items-start">
            <span
              aria-hidden="true"
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-display text-xl ${s.num}`}
            >
              {d.order}
            </span>
            <div className="min-w-0 flex-1">
              <Card d={d}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <p className="font-sans text-xs tracking-[0.15em] uppercase text-sand-400">
                    District {d.order}: {d.district}
                  </p>
                  <span className={`font-sans text-[11px] tracking-wide uppercase border px-2 py-0.5 ${s.badge}`}>{s.label}</span>
                </div>
                <h3 className="font-display text-2xl text-sand-100 mb-1">{d.title}</h3>
                <p className="font-sans text-sm text-sand-400 mb-2">{d.summary}</p>
                <p className="font-sans text-xs text-sand-500">
                  <span className="capitalize">{d.level}</span> · {d.minutes} min
                  {d.districtStatus === "done" && d.bestScore !== null ? ` · Best score ${d.bestScore}%` : ""}
                  {d.districtStatus === "next" && d.started ? " · In progress" : ""}
                </p>
              </Card>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
