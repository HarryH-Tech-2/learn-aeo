"use client";

import { useEffect, useMemo, useState } from "react";
import { COOKIE_PREFIX } from "@/lib/site";
import { emptyLlmsForm, generateLlmsTxt, validateLlmsForm, type LlmsForm, type LlmsLink } from "@/lib/llms-generator";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = `${COOKIE_PREFIX}llms-gen`;
const blankLink = (): LlmsLink => ({ title: "", url: "", notes: "" });

const input =
  "w-full bg-obsidian-lighter border border-gold-700/30 focus:border-gold-500/60 outline-none px-3 py-2 font-body text-sm text-sand-100 placeholder:text-sand-600";
const label = "block font-body text-xs tracking-[0.12em] uppercase text-sand-400 mb-1.5";

function LinkRows({
  links,
  prefix,
  errors,
  onChange,
}: {
  links: LlmsLink[];
  prefix: string;
  errors: Set<string>;
  onChange: (links: LlmsLink[]) => void;
}) {
  const set = (i: number, patch: Partial<LlmsLink>) => onChange(links.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div className="space-y-3">
      {links.map((l, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-2 items-start border-l-2 border-gold-700/20 pl-3">
          <input aria-label="Link title" placeholder="Title" value={l.title} onChange={(e) => set(i, { title: e.target.value })} className={`${input} ${errors.has(`${prefix}.${i}.title`) ? "border-gold-400" : ""}`} />
          <input aria-label="Link URL" placeholder="https://…" inputMode="url" value={l.url} onChange={(e) => set(i, { url: e.target.value })} className={`${input} ${errors.has(`${prefix}.${i}.url`) ? "border-gold-400" : ""}`} />
          <input aria-label="Notes" placeholder="Notes (optional)" value={l.notes} onChange={(e) => set(i, { notes: e.target.value })} className={input} />
          <button type="button" onClick={() => onChange(links.filter((_, j) => j !== i))} className="font-body text-xs text-sand-500 hover:text-gold-400 py-2 text-left" aria-label="Remove link">
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...links, blankLink()])} className="font-body text-sm text-cyan-400 hover:text-gold-400">
        + Add link
      </button>
    </div>
  );
}

export default function LlmsGenerator() {
  const [form, setForm] = useState<LlmsForm>(emptyLlmsForm);
  const [copied, setCopied] = useState(false);

  // Restore the last draft (this browser only); failures are fine, the form just starts empty.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setForm({ ...emptyLlmsForm(), ...(JSON.parse(saved) as LlmsForm) });
    } catch {
      /* no storage */
    }
  }, []);
  // Saving is an effect with no state change, so fast typing can't cascade into nested updates.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      /* no storage */
    }
  }, [form]);

  /** Every edit goes through here: the new form, and the Copy button back to "Copy". */
  function update(next: LlmsForm) {
    setForm(next);
    setCopied(false);
  }

  const errors = useMemo(() => validateLlmsForm(form), [form]);
  const errorFields = useMemo(() => new Set(errors.map((e) => e.field)), [errors]);
  const output = useMemo(() => generateLlmsTxt(form), [form]);
  const ready = errors.length === 0;

  function download() {
    const url = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "llms.txt";
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("tool_used", { tool: "llms-txt-generator", action: "download" });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="card-ancient p-5 sm:p-6 space-y-5">
        <label className="block">
          <span className={label}>Site or project name</span>
          <input value={form.name} onChange={(e) => update({ ...form, name: e.target.value })} placeholder="Fernhill Garden Supply" className={`${input} ${errorFields.has("name") && form.name !== "" ? "border-gold-400" : ""}`} />
        </label>
        <label className="block">
          <span className={label}>Summary (one paragraph)</span>
          <textarea value={form.summary} onChange={(e) => update({ ...form, summary: e.target.value })} rows={2} placeholder="What the site is and who it is for, in a sentence or two." className={input} />
        </label>
        <label className="block">
          <span className={label}>More detail (optional)</span>
          <textarea value={form.details} onChange={(e) => update({ ...form, details: e.target.value })} rows={3} placeholder="Anything a model should know before reading the links: what is in scope, how prices are shown…" className={input} />
        </label>

        {form.sections.map((s, i) => (
          <fieldset key={i} className="border-t border-gold-700/20 pt-4">
            <div className="flex items-end gap-2 mb-3">
              <label className="flex-1">
                <span className={label}>Section title</span>
                <input value={s.title} onChange={(e) => update({ ...form, sections: form.sections.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} className={`${input} ${errorFields.has(`sections.${i}.title`) ? "border-gold-400" : ""}`} />
              </label>
              <button type="button" onClick={() => update({ ...form, sections: form.sections.filter((_, j) => j !== i) })} className="font-body text-xs text-sand-500 hover:text-gold-400 py-2 px-2">
                Remove section
              </button>
            </div>
            <LinkRows links={s.links} prefix={`sections.${i}.links`} errors={errorFields} onChange={(links) => update({ ...form, sections: form.sections.map((x, j) => (j === i ? { ...x, links } : x)) })} />
          </fieldset>
        ))}
        <button type="button" onClick={() => update({ ...form, sections: [...form.sections, { title: "", links: [blankLink()] }] })} className="btn-secondary py-2 px-4 text-xs">
          + Add section
        </button>

        <fieldset className="border-t border-gold-700/20 pt-4">
          <span className={label}>Optional links (secondary pages a model can skip)</span>
          <LinkRows links={form.optional} prefix="optional" errors={errorFields} onChange={(optional) => update({ ...form, optional })} />
        </fieldset>
      </div>

      <div className="lg:sticky lg:top-24 self-start w-full min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className={label}>Your llms.txt</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!ready}
              onClick={() =>
                navigator.clipboard?.writeText(output).then(() => {
                  setCopied(true);
                  trackEvent("tool_used", { tool: "llms-txt-generator", action: "copy" });
                }, () => {})
              }
              className="btn-secondary py-1.5 px-4 text-xs disabled:opacity-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" disabled={!ready} onClick={download} className="btn-primary py-1.5 px-4 text-xs disabled:opacity-50">
              Download
            </button>
          </div>
        </div>
        <pre className="bg-obsidian-lighter border border-gold-700/20 p-4 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[13px] text-sand-200 min-h-48">{output}</pre>
        {!ready && (
          <ul className="mt-3 space-y-1 font-body text-xs text-gold-400" aria-live="polite">
            {errors.map((e) => (
              <li key={e.field}>{e.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
