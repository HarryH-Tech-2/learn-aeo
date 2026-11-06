"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_PLATFORMS,
  MAX_BRANDS,
  analyzeAnswer,
  answerKey,
  normalizeDomain,
  pct,
  runsToCsv,
  scoreRun,
  splitNames,
  splitPrompts,
  type Answers,
  type Brand,
  type SavedRun,
  type Setup,
} from "@/lib/share-of-voice";
import { trackEvent } from "@/lib/analytics";

// Everything stays in this browser: the setup and pasted answers as a draft, and saved runs to compare over time.
const STORAGE_KEY = "learnaeo-sov-tracker-v1";

/** A brand row as typed: aliases as one comma-separated string. */
type BrandInput = { name: string; aliases: string; domain: string };
type Stored = { brands: BrandInput[]; prompts: string; platforms: string[]; answers: Answers; runs: SavedRun[] };

const EMPTY_BRAND: BrandInput = { name: "", aliases: "", domain: "" };
const INITIAL: Stored = {
  brands: [EMPTY_BRAND, EMPTY_BRAND, EMPTY_BRAND],
  prompts: "",
  platforms: ["ChatGPT", "Perplexity", "Google AI Mode"],
  answers: {},
  runs: [],
};

// The course's running example, a made-up tea shop, with a few answers already pasted so the results fill in.
const EXAMPLE: Omit<Stored, "runs"> = {
  brands: [
    { name: "Larkfield Tea", aliases: "Larkfield", domain: "larkfieldtea.example" },
    { name: "Brewhouse Co", aliases: "Brewhouse", domain: "brewhouse.example" },
    { name: "Leafline", aliases: "", domain: "leafline.example" },
  ],
  prompts: "best loose leaf tea shop in the UK\nloose leaf tea subscription uk\nbest breakfast tea for milk",
  platforms: ["ChatGPT", "Perplexity"],
  answers: {
    [answerKey(0, "ChatGPT")]:
      "Popular UK loose leaf shops include Brewhouse Co, known for its wide range, and Larkfield Tea, a small-batch Yorkshire blender (larkfieldtea.example). Leafline is another option.",
    [answerKey(0, "Perplexity")]:
      "Brewhouse Co is the most recommended across reviews [1], followed by Leafline [2].\n[1] https://www.brewhouse.example/about\n[2] https://reviews.example/leafline",
    [answerKey(1, "ChatGPT")]: "Brewhouse runs a monthly subscription with free UK delivery.",
    [answerKey(1, "Perplexity")]:
      "Larkfield Tea's subscription sends two blends a month [1].\n[1] https://larkfieldtea.example/subscription",
    [answerKey(2, "ChatGPT")]:
      "An Assam-led blend holds up to milk. Brewhouse Co's English Breakfast is the best-known choice; Larkfield's breakfast blend is a smaller-batch option.",
  },
};

function load(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const s = JSON.parse(raw) as Partial<Stored>;
    return {
      brands: Array.isArray(s.brands) && s.brands.length ? s.brands.slice(0, MAX_BRANDS) : INITIAL.brands,
      prompts: typeof s.prompts === "string" ? s.prompts : "",
      platforms: Array.isArray(s.platforms) ? s.platforms : INITIAL.platforms,
      answers: s.answers && typeof s.answers === "object" ? s.answers : {},
      runs: Array.isArray(s.runs) ? s.runs : [],
    };
  } catch {
    return INITIAL;
  }
}

function toSetup(s: Stored): Setup {
  return {
    brands: s.brands.map(
      (b): Brand => ({ name: b.name.trim(), aliases: splitNames(b.aliases), domain: normalizeDomain(b.domain) }),
    ),
    prompts: splitPrompts(s.prompts),
    platforms: s.platforms,
  };
}

const inputCls =
  "mt-1 block w-full rounded-lg bg-obsidian-lighter border border-gold-700/30 focus:border-cyan-400/60 outline-none px-3 py-2 font-body text-base text-sand-100 placeholder:text-sand-600";
const labelCls = "font-body text-sm text-sand-300";
const stepCls = "font-display text-2xl font-bold text-sand-100 mb-1";
const smallBtn = "rounded-full px-3 py-1 font-body text-sm text-cyan-300 border border-cyan-400/40 hover:bg-cyan-400/10 disabled:opacity-50";

export default function ShareOfVoiceTracker() {
  const [state, setState] = useState<Stored>(INITIAL);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(0);
  const [label, setLabel] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState<number | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    setState(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // private mode or storage full: the tool still works for this visit
    }
  }, [state, loaded]);

  const setup = useMemo(() => toSetup(state), [state]);
  const result = useMemo(() => scoreRun(setup, state.answers), [setup, state.answers]);
  const named = setup.brands.filter((b) => b.name);
  const total = setup.prompts.length * setup.platforms.length;

  function update(patch: Partial<Stored>) {
    setState((s) => ({ ...s, ...patch }));
    if (!tracked.current) {
      tracked.current = true;
      trackEvent("tool_used", { tool: "share-of-voice-tracker" });
    }
  }

  const setBrand = (i: number, patch: Partial<BrandInput>) =>
    update({ brands: state.brands.map((b, j) => (j === i ? { ...b, ...patch } : b)) });

  const togglePlatform = (p: string) =>
    update({
      platforms: state.platforms.includes(p)
        ? state.platforms.filter((x) => x !== p)
        : DEFAULT_PLATFORMS.filter((x) => x === p || state.platforms.includes(x)),
    });

  function saveRun() {
    const run: SavedRun = {
      id: `${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      label: label.trim() || `Run ${state.runs.length + 1}`,
      result: { answersChecked: result.answersChecked, brands: result.brands },
    };
    update({ runs: [...state.runs, run] });
    setLabel("");
    trackEvent("tool_used", { tool: "share-of-voice-tracker", action: "save_run" });
  }

  function downloadCsv() {
    const blob = new Blob([runsToCsv(state.runs)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "share-of-voice.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    trackEvent("tool_used", { tool: "share-of-voice-tracker", action: "csv" });
  }

  function copyPrompt(i: number) {
    navigator.clipboard?.writeText(setup.prompts[i]).then(() => {
      setCopiedPrompt(i);
      setTimeout(() => setCopiedPrompt((c) => (c === i ? null : c)), 2000);
    }, () => {});
  }

  const pasted = (i: number) => setup.platforms.filter((p) => state.answers[answerKey(i, p)]?.trim()).length;
  const maxSov = Math.max(0.0001, ...result.brands.map((b) => b.shareOfVoice));

  return (
    <div className="space-y-8">
      {/* Step 1: who and what to track */}
      <div className="card-ancient p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h2 className={stepCls}>1. Brands, prompts and platforms</h2>
            <p className="font-body text-sm text-sand-400">Your brand first, then up to {MAX_BRANDS - 1} competitors.</p>
          </div>
          <button
            type="button"
            onClick={() => update({ ...EXAMPLE })}
            className="font-body text-sm text-cyan-400 underline underline-offset-2"
          >
            Fill with an example
          </button>
        </div>

        <div className="space-y-4">
          {state.brands.map((b, i) => (
            <fieldset key={i} className="grid gap-3 sm:grid-cols-[1.2fr_1.2fr_1fr_auto] items-end">
              <legend className="sr-only">{i === 0 ? "Your brand" : `Competitor ${i}`}</legend>
              <label className={labelCls}>
                {i === 0 ? "Your brand" : `Competitor ${i}`}
                <input value={b.name} onChange={(e) => setBrand(i, { name: e.target.value })} placeholder={i === 0 ? "Larkfield Tea" : "Brand name"} className={inputCls} />
              </label>
              <label className={labelCls}>
                Other names <span className="text-sand-500">(comma-separated)</span>
                <input value={b.aliases} onChange={(e) => setBrand(i, { aliases: e.target.value })} placeholder={i === 0 ? "Larkfield, LFT" : "Short name, product name"} className={inputCls} />
              </label>
              <label className={labelCls}>
                Website
                <input value={b.domain} onChange={(e) => setBrand(i, { domain: e.target.value })} placeholder="example.com" inputMode="url" className={inputCls} />
              </label>
              {i > 0 ? (
                <button
                  type="button"
                  onClick={() => update({ brands: state.brands.filter((_, j) => j !== i) })}
                  className="mb-1 rounded-full px-3 py-2 font-body text-sm text-sand-400 hover:text-sand-100"
                  aria-label={`Remove competitor ${i}`}
                >
                  Remove
                </button>
              ) : (
                <span className="hidden sm:block w-[4.5rem]" />
              )}
            </fieldset>
          ))}
          {state.brands.length < MAX_BRANDS && (
            <button type="button" onClick={() => update({ brands: [...state.brands, EMPTY_BRAND] })} className={smallBtn}>
              Add a competitor
            </button>
          )}
        </div>

        <label className={`${labelCls} block mt-8`}>
          Prompts <span className="text-sand-500">(one per line, the questions your buyers ask)</span>
          <textarea
            rows={5}
            value={state.prompts}
            onChange={(e) => update({ prompts: e.target.value })}
            placeholder={"best loose leaf tea shop in the UK\nloose leaf tea subscription uk"}
            className={inputCls}
          />
        </label>

        <fieldset className="mt-6">
          <legend className={labelCls}>Platforms you&rsquo;ll check</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEFAULT_PLATFORMS.map((p) => (
              <label key={p} className={`schema-kind !py-1.5 !px-3 cursor-pointer ${state.platforms.includes(p) ? "schema-kind-on" : ""}`}>
                <input type="checkbox" className="sr-only" checked={state.platforms.includes(p)} onChange={() => togglePlatform(p)} />
                <span className="font-body text-sm">{p}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Step 2: paste the answers */}
      <div className="card-ancient p-5 sm:p-8">
        <h2 className={stepCls}>2. Paste each answer</h2>
        <p className="font-body text-sm text-sand-400 mb-6">
          Ask each platform each prompt in a logged-out or fresh chat, then paste the whole answer, sources included. Leave a box
          empty if you didn&rsquo;t check it.{" "}
          {total > 0 && (
            <span className="text-sand-300">
              {result.answersChecked} of {total} pasted.
            </span>
          )}
        </p>
        {!named.length || !setup.prompts.length || !setup.platforms.length ? (
          <p className="font-body text-sand-400">Add your brand, at least one prompt and a platform first.</p>
        ) : (
          <div className="space-y-3">
            {setup.prompts.map((prompt, i) => (
              <details
                key={`${i}-${prompt}`}
                open={open === i}
                onToggle={(e) => {
                  const isOpen = (e.currentTarget as HTMLDetailsElement).open;
                  if (isOpen) setOpen(i);
                  else if (open === i) setOpen(-1);
                }}
                className="rounded-xl border border-sand-500/20 bg-obsidian-lighter/40"
              >
                <summary className="cursor-pointer list-none flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <span className="font-body text-sand-100">
                    <span className="text-sand-500 mr-2">{i + 1}.</span>
                    {prompt}
                  </span>
                  <span className="font-body text-xs text-sand-400">
                    {pasted(i)}/{setup.platforms.length} pasted
                  </span>
                </summary>
                <div className="px-4 pb-4 space-y-4">
                  <button type="button" onClick={() => copyPrompt(i)} className={smallBtn}>
                    {copiedPrompt === i ? "Copied" : "Copy prompt"}
                  </button>
                  {setup.platforms.map((p) => {
                    const key = answerKey(i, p);
                    const text = state.answers[key] ?? "";
                    const found = text.trim() ? analyzeAnswer(text, named) : null;
                    return (
                      <div key={p}>
                        <label className={labelCls}>
                          {p}
                          <textarea
                            rows={3}
                            value={text}
                            onChange={(e) => update({ answers: { ...state.answers, [key]: e.target.value } })}
                            placeholder={`Paste ${p}'s answer`}
                            className={inputCls}
                          />
                        </label>
                        {found && (
                          <p className="mt-1 font-body text-xs text-sand-400" aria-live="polite">
                            {found.mentioned.length ? `Names: ${found.mentioned.join(", ")}` : "Names none of your brands"}
                            {found.cited.length ? ` · Cites: ${found.cited.join(", ")}` : ""}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: results */}
      <div className="card-ancient p-5 sm:p-8" aria-live="polite">
        <h2 className={stepCls}>3. Share of voice</h2>
        {result.answersChecked === 0 ? (
          <p className="font-body text-sand-400">Results appear here as you paste answers.</p>
        ) : (
          <>
            <p className="font-body text-sm text-sand-400 mb-5">
              Across {result.answersChecked} {result.answersChecked === 1 ? "answer" : "answers"}. A brand counts once per answer.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full font-body text-sm text-sand-300">
                <thead>
                  <tr className="text-left text-sand-400 border-b border-white/10">
                    <th scope="col" className="py-2 pr-3 font-normal">Brand</th>
                    <th scope="col" className="py-2 px-3 font-normal">Share of voice</th>
                    <th scope="col" className="py-2 px-3 font-normal text-right">Mention rate</th>
                    <th scope="col" className="py-2 px-3 font-normal text-right">Citation rate</th>
                    <th scope="col" className="py-2 pl-3 font-normal text-right">Named first</th>
                  </tr>
                </thead>
                <tbody>
                  {result.brands.map((b, i) => (
                    <tr key={b.name} className="border-b border-white/5">
                      <th scope="row" className={`py-2 pr-3 text-left font-semibold ${i === 0 ? "text-cyan-300" : "text-sand-100"}`}>
                        {b.name}
                        {i === 0 && <span className="ml-1 font-normal text-xs text-sand-400">(you)</span>}
                      </th>
                      <td className="py-2 px-3 min-w-[10rem]">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-white/5" aria-hidden="true">
                            <div
                              className={`h-2 rounded-full ${i === 0 ? "bg-cyan-400" : "bg-sand-400/60"}`}
                              style={{ width: `${(b.shareOfVoice / maxSov) * 100}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-sand-100">{pct(b.shareOfVoice)}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {pct(b.mentionRate)} <span className="text-sand-500">({b.mentions})</span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {setup.brands.find((x) => x.name === b.name)?.domain ? (
                          <>
                            {pct(b.citationRate)} <span className="text-sand-500">({b.citations})</span>
                          </>
                        ) : (
                          <span className="text-sand-500" title="Add the brand's website to count citations">n/a</span>
                        )}
                      </td>
                      <td className="py-2 pl-3 text-right">{b.namedFirst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.byPlatform.length > 1 && named[0] && (
              <>
                <h3 className="font-display text-lg font-bold text-sand-100 mt-8 mb-2">{named[0].name} by platform</h3>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {result.byPlatform.map((p) => (
                    <li key={p.platform} className="rounded-lg border border-sand-500/20 px-3 py-2 font-body text-sm text-sand-300">
                      <span className="block font-semibold text-sand-100">{p.platform}</span>
                      Named in {pct(p.mentionRate)} of {p.answers} · share of voice {pct(p.shareOfVoice)}
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-8 flex flex-wrap items-end gap-3">
              <label className={`${labelCls} flex-1 min-w-[12rem]`}>
                Save this run to compare later
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={`Run ${state.runs.length + 1}`} className={inputCls} />
              </label>
              <button type="button" onClick={saveRun} className="btn-primary py-2.5 px-5 text-sm">
                Save run
              </button>
              <button
                type="button"
                onClick={() => update({ answers: {} })}
                className="btn-secondary py-2.5 px-5 text-sm"
              >
                Clear answers
              </button>
            </div>
          </>
        )}
      </div>

      {/* Saved runs */}
      {state.runs.length > 0 && (
        <div className="card-ancient p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className={stepCls}>Saved runs</h2>
            <button type="button" onClick={downloadCsv} className={smallBtn}>
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-body text-sm text-sand-300">
              <thead>
                <tr className="text-left text-sand-400 border-b border-white/10">
                  <th scope="col" className="py-2 pr-3 font-normal">Run</th>
                  <th scope="col" className="py-2 px-3 font-normal text-right">Answers</th>
                  {Array.from(new Set(state.runs.flatMap((r) => r.result.brands.map((b) => b.name)))).map((n) => (
                    <th key={n} scope="col" className="py-2 px-3 font-normal text-right">{n}</th>
                  ))}
                  <th scope="col" className="py-2 pl-3"><span className="sr-only">Delete</span></th>
                </tr>
              </thead>
              <tbody>
                {state.runs.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <th scope="row" className="py-2 pr-3 text-left font-normal">
                      <span className="text-sand-100">{r.label}</span> <span className="text-sand-500">{r.date}</span>
                    </th>
                    <td className="py-2 px-3 text-right">{r.result.answersChecked}</td>
                    {Array.from(new Set(state.runs.flatMap((x) => x.result.brands.map((b) => b.name)))).map((n) => {
                      const b = r.result.brands.find((x) => x.name === n);
                      return (
                        <td key={n} className="py-2 px-3 text-right">
                          {b ? pct(b.shareOfVoice) : "–"}
                        </td>
                      );
                    })}
                    <td className="py-2 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => update({ runs: state.runs.filter((x) => x.id !== r.id) })}
                        className="text-sand-500 hover:text-sand-100"
                        aria-label={`Delete ${r.label}`}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-body text-xs text-sand-500">Share of voice per run. Saved in this browser only.</p>
        </div>
      )}
    </div>
  );
}
