"use client";

/**
 * The expedition log: a calendar of days dug, with streak milestones.
 */
import { heatmap, type ExpeditionLog as LogData } from "@/lib/expedition";

export default function ExpeditionLog({ log, streak }: { log: LogData | null; streak: number }) {
  const today = new Date();
  const weeks = heatmap(log ?? { days: [] }, today, 20);
  const total = log?.days.length ?? 0;
  const months: { label: string; col: number }[] = [];
  weeks.forEach((w, i) => {
    const d = new Date(w[0].key + "T00:00:00");
    if (d.getDate() <= 7) months.push({ label: d.toLocaleString(undefined, { month: "short" }), col: i });
  });
  const milestones = [3, 7, 30];
  const nextMilestone = milestones.find((m) => m > streak) ?? null;

  return (
    <div className="card-ancient p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-sand-500 mb-1">Expedition log</p>
          <h2 className="font-display text-2xl text-sand-100">
            {log === null ? "Opening the log…" : total === 0 ? "No days on site yet" : `${total} day${total === 1 ? "" : "s"} on site`}
          </h2>
        </div>
        <p className="font-body text-xs text-sand-500">
          {streak > 0 ? `${streak}-day streak` : "No streak running"}
          {nextMilestone && ` · ${nextMilestone - streak} more for the ${nextMilestone}-day badge`}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="relative h-4 mb-1">
            {months.map((m) => (
              <span key={m.col} className="absolute font-body text-[10px] text-sand-500" style={{ left: `calc(${m.col} * (0.875rem + 3px))` }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((col, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {col.map((c) => (
                  <span
                    key={c.key}
                    title={c.key}
                    className={`block w-3.5 h-3.5 ${
                      c.future ? "bg-transparent" : c.active ? "bg-gold-500 shadow-[0_0_6px_rgba(212,168,50,0.5)]" : "bg-obsidian-lighter border border-gold-700/10"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {milestones.map((m) => (
          <span
            key={m}
            className={`font-body text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 border ${streak >= m ? "border-gold-400 text-gold-300" : "border-gold-700/25 text-sand-500"}`}
          >
            {m}-day {streak >= m ? "✓" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
