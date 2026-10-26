"use client";

/**
 * A slim strip at the top of the free tool pages, shown only when the visit came from a school's
 * learning platform (Schoology, Google Classroom, epraise…: src/lib/class-visit.ts). It speaks to
 * the teacher who set the link, not the pupils: the free worksheet and lesson plan, the live class
 * quiz, and the Classroom licence. Everyone else never sees it.
 *
 * GA4: class_strip_view once per page view (question_type: the platform) and class_strip_click
 * (question_type: the platform; target: worksheet | class | licence | teacher | short_link | class_set).
 *
 * Pupils (2026-10-21): nearly everyone arriving by a class link is a pupil, and a strip spoken only to the teacher
 * got 0 clicks from ~29 class visits. So it opens with a line for the pupil to pass on, with a short address to read
 * out or type: /teacher, a redirect in next.config.ts tagged utm_source=class-strip.
 *
 * The teacher's email (2026-10-16): pupils arrive by the same link, so the box only opens after "I'm the
 * teacher" and says pupils should not type anything. It sends the worksheet and lesson plan through
 * /api/worksheet-email (lead source "worksheet", the teachers' follow-up included). GA4: class_strip_email.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent, trackEventWhenReady } from "@/lib/analytics";
import { classVisit } from "@/lib/class-visit";

type Props = {
  className?: string;
};

export default function ClassVisitStrip({ className = "" }: Props) {
  const [platform, setPlatform] = useState<string | null>(null);
  const [teacher, setTeacher] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<"" | "busy" | "sent" | "error">("");

  useEffect(() => {
    const p = classVisit(document.referrer);
    if (!p) return;
    setPlatform(p);
    // waits for the lazily loaded gtag: fired straight away it was dropped on landing (2 views logged from ~29 class visits)
    return trackEventWhenReady("class_strip_view", { question_type: p });
  }, []);

  if (!platform) return null;
  const click = (target: "worksheet" | "class" | "licence" | "teacher" | "short_link" | "class_set") => () =>
    trackEvent("class_strip_click", { question_type: platform, target });
  const link = "text-gold-400 underline underline-offset-2 hover:text-gold-300";

  return (
    <aside
      aria-label="For teachers"
      className={`border border-gold-500/40 bg-gold-500/10 px-4 py-3 font-body text-sm leading-relaxed text-sand-200 ${className}`}
    >
      <p className="text-base text-sand-100">
        {/* "free to try": Classroom mode is a 7-day free trial, then a licence (src/app/teachers/class/ClassHost.tsx) */}
        <span className="font-semibold text-gold-300">Doing this in class?</span> Show your teacher: there&rsquo;s a
        hieroglyphs quiz game your whole class can play together, free to try, at{" "}
        <Link
          href="/teacher"
          onClick={click("short_link")}
          className="whitespace-nowrap font-semibold text-gold-300 underline underline-offset-4 hover:text-gold-200"
        >
          learnhieroglyphics.com/teacher
        </Link>
      </p>
      <div className="mt-2 text-xs text-sand-400">
      <span className="mr-2 font-semibold uppercase tracking-[0.18em] text-gold-400">Teachers</span>
      There is a{" "}
      <Link href="/teachers/worksheet" onClick={click("worksheet")} className={link}>
        free printable worksheet and 50-minute lesson plan
      </Link>
      , a{" "}
      <Link href="/teachers/class" onClick={click("class")} className={link}>
        live class quiz
      </Link>{" "}
      to finish on,{" "}
      <Link href="/teachers/class-set?from=class-strip" onClick={click("class_set")} className={link}>
        every pupil&rsquo;s name in a cartouche
      </Link>{" "}
      as one printable PDF, and a{" "}
      <Link href="/pricing#teachers" onClick={click("licence")} className={link}>
        Classroom licence
      </Link>{" "}
      that gives you and 30 pupils the full course.{" "}
      {!teacher ? (
        <button
          type="button"
          onClick={() => {
            setTeacher(true);
            click("teacher")();
          }}
          className="ml-1 border border-gold-500/60 px-2.5 py-0.5 text-xs font-semibold text-gold-300 hover:bg-gold-500/15"
        >
          I&rsquo;m the teacher: email me the free pack
        </button>
      ) : sent === "sent" ? (
        <span role="status" className="ml-1 text-gold-300">
          Sent. The worksheet and lesson plan are on their way to {email}.
        </span>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (sent === "busy") return;
            setSent("busy");
            try {
              const res = await fetch("/api/worksheet-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              if (!res.ok) throw new Error();
              setSent("sent");
              trackEvent("class_strip_email", { question_type: platform });
            } catch {
              setSent("error");
            }
          }}
          className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <label htmlFor="class-strip-email" className="sr-only">
            Your school email
          </label>
          <input
            id="class-strip-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.org"
            className="min-w-0 flex-1 border border-gold-700/40 bg-obsidian px-3 py-1.5 text-sm text-sand-100 placeholder:text-sand-600 focus:border-gold-400 focus:outline-none sm:max-w-xs"
          />
          <button type="submit" disabled={sent === "busy"} className="border border-gold-500 px-3 py-1.5 text-sm font-semibold text-gold-300 hover:bg-gold-500/15 disabled:opacity-50">
            {sent === "busy" ? "Sending…" : "Send the pack"}
          </button>
          <span className="text-xs text-sand-500">
            {sent === "error" ? "Could not send it. Please try again. " : ""}For teachers only. Pupils: please don&rsquo;t type your email here.
          </span>
        </form>
      )}
      </div>
    </aside>
  );
}
