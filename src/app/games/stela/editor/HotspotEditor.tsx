"use client";

import { useMemo, useRef, useState } from "react";
import { STELA_OBJECTS, isHotspotList, sortByDirection, type Hotspot, type Phrase } from "@/lib/stela";

const GLYPH = { fontFamily: "'Noto Sans Egyptian Hieroglyphs', 'Segoe UI Historic', serif" } as const;

/**
 * Click on the photograph to drop a hotspot (default 3% × 3%), edit its
 * fields in the table, drag the numbered handle to move it, use the wheel to
 * zoom, then copy the JSON into src/lib/stela.ts. Nothing is saved anywhere.
 */
export default function HotspotEditor() {
  const objects = useMemo(() => STELA_OBJECTS.filter((o) => o.image), []);
  const [objectId, setObjectId] = useState(objects[0]?.id ?? "");
  const object = objects.find((o) => o.id === objectId)!;
  const [phraseId, setPhraseId] = useState<string>(object.phrases[0]?.id ?? "new");
  const [direction, setDirection] = useState<Phrase["direction"]>("ltr");
  const [hotspots, setHotspots] = useState<Hotspot[]>(object.phrases[0]?.hotspots ?? []);
  const [size, setSize] = useState(0.03);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [imported, setImported] = useState("");
  const wrap = useRef<HTMLDivElement>(null);
  const dragging = useRef<string | null>(null);

  function loadPhrase(oid: string, pid: string) {
    const o = objects.find((x) => x.id === oid)!;
    const p = o.phrases.find((x) => x.id === pid);
    setHotspots(p ? p.hotspots.map((h) => ({ ...h })) : []);
    setDirection(p?.direction ?? "ltr");
    setSelected(null);
  }

  function toFraction(e: React.MouseEvent): { x: number; y: number } | null {
    const el = wrap.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  }

  function addAt(e: React.MouseEvent) {
    if (dragging.current) return;
    const f = toFraction(e);
    if (!f) return;
    const id = `h${hotspots.length + 1}`;
    const aspect = object.image!.width / object.image!.height;
    setHotspots([...hotspots, { id, x: +f.x.toFixed(3), y: +f.y.toFixed(3), w: +size.toFixed(3), h: +(size * aspect).toFixed(3), glyph: "𓏏", value: "", name: "" }]);
    setSelected(id);
  }

  function update(id: string, patch: Partial<Hotspot>) {
    setHotspots((hs) => hs.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  const json = JSON.stringify(hotspots, null, 2);

  return (
    <main className="min-h-screen bg-obsidian text-sand-100 p-4 font-body text-sm">
      <h1 className="font-display text-2xl mb-3">Stela hotspot editor (dev only)</h1>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <select
          value={objectId}
          onChange={(e) => {
            setObjectId(e.target.value);
            const o = objects.find((x) => x.id === e.target.value)!;
            const pid = o.phrases[0]?.id ?? "new";
            setPhraseId(pid);
            loadPhrase(o.id, pid);
            setScale(1);
            setOrigin({ x: 0, y: 0 });
          }}
          className="bg-obsidian-lighter border border-gold-700/30 p-2"
        >
          {objects.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
        <select
          value={phraseId}
          onChange={(e) => {
            setPhraseId(e.target.value);
            loadPhrase(objectId, e.target.value);
          }}
          className="bg-obsidian-lighter border border-gold-700/30 p-2"
        >
          {object.phrases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
          <option value="new">＋ new phrase (empty)</option>
        </select>
        <label>
          Direction{" "}
          <select value={direction} onChange={(e) => setDirection(e.target.value as Phrase["direction"])} className="bg-obsidian-lighter border border-gold-700/30 p-1">
            <option value="ltr">left → right</option>
            <option value="rtl">right → left</option>
            <option value="ttb">top → bottom</option>
          </select>
        </label>
        <label>
          New box size {Math.round(size * 100)}% <input type="range" min={0.01} max={0.2} step={0.005} value={size} onChange={(e) => setSize(+e.target.value)} />
        </label>
        <label>
          Zoom {scale.toFixed(1)}× <input type="range" min={1} max={6} step={0.1} value={scale} onChange={(e) => setScale(+e.target.value)} />
        </label>
        <button type="button" className="btn-secondary py-1 px-3 text-xs" onClick={() => setHotspots(sortByDirection(hotspots, direction))}>
          Sort into reading order
        </button>
        <button type="button" className="btn-secondary py-1 px-3 text-xs" onClick={() => setHotspots([])}>
          Clear
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-4">
        <div className="overflow-auto border border-gold-700/30 bg-black" style={{ maxHeight: "80vh" }}>
          <div
            ref={wrap}
            className="relative"
            style={{ width: `${scale * 100}%`, transformOrigin: `${origin.x}% ${origin.y}%` }}
            onClick={addAt}
            onWheel={(e) => {
              if (!e.ctrlKey) return;
              e.preventDefault();
              const f = toFraction(e as unknown as React.MouseEvent);
              if (f) setOrigin({ x: f.x * 100, y: f.y * 100 });
              setScale((s) => Math.min(6, Math.max(1, s * (e.deltaY < 0 ? 1.1 : 0.9))));
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={object.image!.src} alt="" className="w-full block" draggable={false} />
            {hotspots.map((h, i) => (
              <div
                key={h.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 border-2 ${selected === h.id ? "border-turquoise" : "border-gold-400"} bg-gold-400/10 cursor-move`}
                style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(h.id);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  dragging.current = h.id;
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (dragging.current !== h.id) return;
                  const f = toFraction(e as unknown as React.MouseEvent);
                  if (f) update(h.id, { x: +f.x.toFixed(3), y: +f.y.toFixed(3) });
                }}
                onPointerUp={() => {
                  window.setTimeout(() => (dragging.current = null), 0);
                }}
              >
                <span className="absolute -top-4 left-0 text-[10px] bg-obsidian px-1 text-gold-300">
                  {i + 1} <span style={GLYPH}>{h.glyph}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-sand-500 text-left">
                <th>#</th>
                <th>id</th>
                <th>glyph</th>
                <th>value</th>
                <th>name</th>
                <th>w</th>
                <th>h</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {hotspots.map((h, i) => (
                <tr key={h.id} className={selected === h.id ? "bg-gold-500/10" : ""} onClick={() => setSelected(h.id)}>
                  <td className="pr-1">{i + 1}</td>
                  <td>
                    <input value={h.id} onChange={(e) => update(h.id, { id: e.target.value })} className="w-16 bg-obsidian-lighter border border-gold-700/30 p-1" />
                  </td>
                  <td>
                    <input value={h.glyph} onChange={(e) => update(h.id, { glyph: e.target.value })} className="w-14 bg-obsidian-lighter border border-gold-700/30 p-1" style={GLYPH} />
                  </td>
                  <td>
                    <input value={h.value} onChange={(e) => update(h.id, { value: e.target.value })} className="w-16 bg-obsidian-lighter border border-gold-700/30 p-1" />
                  </td>
                  <td>
                    <input value={h.name} onChange={(e) => update(h.id, { name: e.target.value })} className="w-28 bg-obsidian-lighter border border-gold-700/30 p-1" />
                  </td>
                  <td>
                    <input type="number" step={0.005} value={h.w} onChange={(e) => update(h.id, { w: +e.target.value })} className="w-14 bg-obsidian-lighter border border-gold-700/30 p-1" />
                  </td>
                  <td>
                    <input type="number" step={0.005} value={h.h} onChange={(e) => update(h.id, { h: +e.target.value })} className="w-14 bg-obsidian-lighter border border-gold-700/30 p-1" />
                  </td>
                  <td>
                    <button type="button" onClick={() => setHotspots(hotspots.filter((x) => x.id !== h.id))} className="text-terracotta">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sand-500 mt-3">Export (paste into the phrase’s `hotspots` in src/lib/stela.ts):</p>
          <textarea readOnly value={json} className="w-full h-48 bg-obsidian-lighter border border-gold-700/30 p-2 font-mono text-[11px]" />
          <button type="button" className="btn-secondary py-1 px-3 text-xs mt-1" onClick={() => navigator.clipboard.writeText(json).catch(() => null)}>
            Copy JSON
          </button>
          <p className="text-sand-500 mt-3">Import JSON:</p>
          <textarea value={imported} onChange={(e) => setImported(e.target.value)} className="w-full h-20 bg-obsidian-lighter border border-gold-700/30 p-2 font-mono text-[11px]" />
          <button
            type="button"
            className="btn-secondary py-1 px-3 text-xs mt-1"
            onClick={() => {
              try {
                const parsed = JSON.parse(imported);
                if (isHotspotList(parsed)) setHotspots(parsed);
              } catch {}
            }}
          >
            Load
          </button>
        </div>
      </div>
    </main>
  );
}
