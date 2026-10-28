/**
 * Copy and rendering for the nurture sequence (src/lib/nurture.ts).
 *
 * Written for marketers who know SEO basics, in the City of Answers voice: the course is a walk through
 * eight districts, one per lesson, starting at The Gate (Lesson 1, free). District names, titles and
 * which lessons are live come from the catalog (src/lib/lesson-catalog.ts), so the copy never drifts
 * from the course. The look is the shared one in src/lib/email-layout.ts.
 *
 * Prices are never written into the copy: they differ by country (GBP for the UK, purchasing-power
 * prices elsewhere), so emails link to /pricing or checkout, which show the visitor's own price.
 * Discounts are a percentage. No numbers or claims about answer engines here: the lessons carry those,
 * with their sources.
 */
import { FIRST_LESSON_PATH, LESSON_CATALOG } from "@/lib/lesson-catalog";
import { LEVEL_THRESHOLDS } from "@/lib/gamification";
import { NO_NAME, type NurtureStepKey } from "@/lib/nurture";
import {
  BODY_FONT as FONT,
  EMAIL_COLORS as C,
  button,
  emailLayout,
  esc,
  eyebrow,
  heading,
  link,
  panel,
  paragraph as p,
} from "@/lib/email-layout";

export type NurtureEmailContext = {
  firstName: string;
  baseUrl: string;
  unsubscribeUrl: string;
  lesson1Completed: boolean;
  /** Answered at least one Lesson 1 exercise (door-sealed: "your place is saved" instead of "Lesson 1 is waiting") */
  lesson1Started: boolean;
  offer: { code: string; expiresAt: Date; percentOff: number } | null;
  /** The free-unlock test's free group (src/lib/access-test.ts): the course is open to them, nothing to sell */
  freeUnlock?: boolean;
};

export type RenderedEmail = { subject: string; html: string; text: string };

/** utm_source on every link in these emails; the campaign is the step key. */
export const NURTURE_UTM_SOURCE = "nurture";

const GATE = LESSON_CATALOG[0];
/** The seven districts after The Gate, in course order. */
const AHEAD = LESSON_CATALOG.slice(1);
const NEXT = AHEAD[0];
const FIRST_LEVEL = LEVEL_THRESHOLDS[0].title;
const TOP_LEVEL = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].title;
const MINUTES = LESSON_CATALOG.map((l) => l.minutes);
const MIN_MINUTES = Math.min(...MINUTES);
const MAX_MINUTES = Math.max(...MINUTES);

function fmtExpiry(d: Date): string {
  return d.toLocaleString("en-GB", { weekday: "long", hour: "numeric", minute: "2-digit", timeZone: "Europe/London" });
}

// ── building blocks (the shared ones are in src/lib/email-layout.ts) ─────────

/** The districts after The Gate, with which are open now and which are coming soon. */
function districtList(title = "The districts ahead"): string {
  const rows = AHEAD.map(
    (l) => `<tr>
      <td valign="top" style="padding:7px 12px 7px 0;font-family:${FONT};font-size:13px;font-weight:700;color:${C.gold};width:22px;">${l.order}</td>
      <td style="padding:7px 0;font-family:${FONT};font-size:15px;line-height:1.45;color:${C.sand};"><strong style="font-weight:600;">${esc(l.district)}</strong>${l.status === "coming-soon" ? ` <span style="font-size:12px;color:${C.faint};">&middot; coming soon</span>` : ""}<br><span style="color:${C.muted};font-size:14px;">${esc(l.title)}</span></td>
    </tr>`
  ).join("");
  return panel(
    `<p style="margin:0 0 8px;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">${esc(title)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">${rows}</table>`
  );
}

function districtText(): string {
  return AHEAD.map((l) => `${l.order}. ${l.district}: ${l.title}${l.status === "coming-soon" ? " (coming soon)" : ""}`).join("\n");
}

/** A short list of points inside a panel. */
function points(items: string[]): string {
  return panel(
    items
      .map(
        (t) =>
          `<p style="margin:0 0 10px;font-family:${FONT};font-size:15px;line-height:1.55;color:${C.sand};"><span style="color:${C.gold};">&#9670;</span>&nbsp; ${t}</p>`
      )
      .join("")
  );
}

function codeBox(code: string, percentOff: number, expiresAt: Date): string {
  return panel(
    `<p style="margin:0 0 6px;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.muted};">Your ${percentOff}% off code</p>
    <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:2px;color:${C.goldLight};">${esc(code)}</p>
    <p style="margin:0;font-family:${FONT};font-size:13px;color:${C.muted};">Applied automatically at checkout &middot; ends ${esc(fmtExpiry(expiresAt))} (UK time)</p>`,
    { dashed: true, center: true }
  );
}

/** The full document around one email's body. */
function layout(opts: { preheader: string; body: string; ctx: NurtureEmailContext }): string {
  return emailLayout({
    baseUrl: opts.ctx.baseUrl,
    preheader: opts.preheader,
    body: opts.body,
    reason: "You are getting this because you made a free account at learnaeo.com.",
    unsubscribeUrl: opts.ctx.unsubscribeUrl,
  });
}

/** Plain-text part: the same words, links written out. */
function textOf(lines: string[], ctx: NurtureEmailContext): string {
  return [...lines, "The Learn AEO team\nJust reply, we read every email", `Unsubscribe: ${ctx.unsubscribeUrl}`].join(
    "\n\n"
  );
}

/** What Lesson 1 covers, one line each (matches the lesson's three concept groups). */
const GATE_RECAP = [
  "An answer engine reads pages for the user and writes one answer, with links to a few sources. Being cited (a link to your page) and being mentioned (your name, no link) are different results, so track them separately.",
  "Engines retrieve passages first and then ground the answer in them. Retrieval runs over an index built by crawlers, so a page has to be reachable and indexed before it can be cited.",
  "Query fan-out turns one question into several searches. That widens the pool of candidate pages, but only the passages the answer relies on get cited, so each clearly answered sub-question is another way in.",
];

// ── the emails ──────────────────────────────────────────────────────────────

export function renderNurtureEmail(key: NurtureStepKey, ctx: NurtureEmailContext): RenderedEmail {
  const name = esc(ctx.firstName);
  const hi = p(`Hi ${name},`);
  // Every link says which email it came from: CampaignTracker counts the click (src/lib/campaign.ts,
  // shown on /admin/marketing) and GA4 files the visit under nurture / email / <step>.
  const tagged = (path: string) =>
    `${ctx.baseUrl}${path}${path.includes("?") ? "&" : "?"}utm_source=${NURTURE_UTM_SOURCE}&utm_medium=email&utm_campaign=${key}`;
  const lessonUrl = tagged(FIRST_LESSON_PATH);
  const pricingUrl = tagged("/pricing");
  const checkoutUrl = tagged("/get-started?next=checkout");
  const dashboardUrl = tagged("/dashboard");

  switch (key) {
    case "welcome": {
      const intro = `Your account is ready, and Lesson 1 is free. It starts at ${GATE.district}, the first district of the City of Answers: how answer engines such as Google's AI Overviews, ChatGPT search and Perplexity build an answer, and how they choose which pages to cite.`;
      const what = `You will follow a question from the prompt to the finished answer, through retrieval, grounding and query fan-out, and see the difference between being cited and being mentioned. It takes about ${GATE.minutes} minutes, and your progress is saved as you go.`;
      const body = [
        eyebrow("Welcome to the City of Answers"),
        heading("Your first district is open"),
        hi,
        p(intro),
        p(what),
        button(lessonUrl, "Start Lesson 1"),
      ].join("");
      return {
        subject: "Welcome to the City of Answers",
        html: layout({ preheader: `Lesson 1 is free: how answer engines choose their sources.`, body, ctx }),
        text: textOf([`Hi ${ctx.firstName},`, intro, what, `Start Lesson 1: ${lessonUrl}`], ctx),
      };
    }

    case "door-sealed": {
      // Never started (no exercise answered): Lesson 1 is still waiting for them.
      // Part-way through: their place is saved, so the ask is to carry on, not to begin.
      if (!ctx.lesson1Started) {
        const line1 = `You made an account, but you haven't started Lesson 1 yet. It is free, and it is the base the rest of the course builds on: how an answer engine picks the handful of pages it cites.`;
        const line2 = `It takes about ${GATE.minutes} minutes in short parts, with quick checks as you go. Nothing to install and nothing to pay.`;
        const body = [eyebrow(`Lesson 1 · ${esc(GATE.district)}`), heading("Lesson 1 is waiting for you"), hi, p(line1), p(line2), button(lessonUrl, "Start Lesson 1")].join("");
        return {
          subject: "Lesson 1 is waiting for you",
          html: layout({ preheader: "It's free, and it shows how answer engines pick their sources.", body, ctx }),
          text: textOf([`Hi ${ctx.firstName},`, line1, line2, `Start Lesson 1: ${lessonUrl}`], ctx),
        };
      }
      const line1 = "You have made a start on Lesson 1, and your progress is saved. Pick up where you stopped; the rest comes in short parts.";
      const line2 = "By the end you will be able to trace how an answer engine builds an answer, and say what makes one passage easier to cite than another.";
      const body = [eyebrow("Lesson 1 · in progress"), heading("Your place is saved"), hi, p(line1), p(line2), button(lessonUrl, "Carry on with Lesson 1")].join("");
      return {
        subject: "Your place in Lesson 1 is saved",
        html: layout({ preheader: "Pick up where you stopped: the rest comes in short parts.", body, ctx }),
        text: textOf([`Hi ${ctx.firstName},`, line1, line2, `Carry on: ${lessonUrl}`], ctx),
      };
    }

    case "next-door": {
      const intro = `You finished Lesson 1. Here is what you learned in ${GATE.district}, in three lines:`;
      const nextLine = `Next is ${NEXT.district}: ${NEXT.title}. ${NEXT.summary}`;
      if (ctx.freeUnlock) {
        const open = "The whole course is open on your account, free. This is the road ahead:";
        const body = [
          eyebrow("Lesson 1 complete"),
          heading(`What you learned in ${esc(GATE.district)}`),
          hi,
          p(esc(intro)),
          points(GATE_RECAP.map(esc)),
          p(esc(nextLine)),
          p(open),
          districtList(),
          button(dashboardUrl, "Go to your dashboard"),
        ].join("");
        return {
          subject: `What you learned in ${GATE.district}`,
          html: layout({ preheader: "Three things to keep from Lesson 1, and where to go next.", body, ctx }),
          text: textOf(
            [`Hi ${ctx.firstName},`, intro, GATE_RECAP.map((t) => `- ${t}`).join("\n"), nextLine, `${open}\n${districtText()}`, `Go to your dashboard: ${dashboardUrl}`],
            ctx
          ),
        };
      }
      const pitch = "One payment opens every district, including each new lesson as it is released, and your certificate when you finish. If it is not for you, there is a full refund within 14 days.";
      const body = [
        eyebrow("Lesson 1 complete"),
        heading(`What you learned in ${esc(GATE.district)}`),
        hi,
        p(esc(intro)),
        points(GATE_RECAP.map(esc)),
        p(esc(nextLine)),
        districtList(),
        p(pitch),
        button(pricingUrl, "See the plans"),
      ].join("");
      return {
        subject: `What you learned in ${GATE.district}`,
        html: layout({ preheader: "Three things to keep from Lesson 1, and where to go next.", body, ctx }),
        text: textOf(
          [`Hi ${ctx.firstName},`, intro, GATE_RECAP.map((t) => `- ${t}`).join("\n"), nextLine, `The districts ahead:\n${districtText()}`, pitch, `See the plans: ${pricingUrl}`],
          ctx
        ),
      };
    }

    case "free-stuff": {
      const intro = `Each lesson is one district of the City of Answers and takes ${MIN_MINUTES} to ${MAX_MINUTES} minutes. They all work the same way:`;
      const parts = [
        "Short concept cards, each with why it matters, a common mistake, and links to the sources it draws on.",
        "Quick checks as you read, so you know it has landed.",
        "A hands-on exercise, and a worked example taken apart.",
        "An audit at the end of the lesson to test what you have learned.",
        `XP as you go, ${LEVEL_THRESHOLDS.length} levels from ${FIRST_LEVEL} to ${TOP_LEVEL}, badges, and a certificate when you finish the course.`,
      ];
      const close = ctx.lesson1Completed
        ? { line: "You have already seen it in action in Lesson 1.", label: "Go to your dashboard", url: dashboardUrl }
        : { line: "The quickest way to see it is Lesson 1, which is free, with your place saved as you go.", label: "Start Lesson 1", url: lessonUrl };
      const body = [
        eyebrow("How the course works"),
        heading("What's inside the course"),
        hi,
        p(esc(intro)),
        points(parts.map(esc)),
        districtList(`The districts after ${GATE.district}`),
        p(close.line),
        button(close.url, close.label),
      ].join("");
      return {
        subject: "What's inside the course",
        html: layout({ preheader: "How a lesson works, and the districts on the road ahead.", body, ctx }),
        text: textOf(
          [`Hi ${ctx.firstName},`, intro, parts.map((t) => `- ${t}`).join("\n"), `The districts after ${GATE.district}:\n${districtText()}`, close.line, `${close.label}: ${close.url}`],
          ctx
        ),
      };
    }

    case "offer": {
      const offer = ctx.offer;
      if (!offer) throw new Error("offer step rendered without an offer");
      const line1 = "You have had a free account for a few days. If you have been weighing up the rest of the course, this makes it an easier yes.";
      const line2 = "One payment, lifetime access, and every lesson still to come is included when it is released. Full refund within 14 days if it is not for you.";
      const body = [
        eyebrow("For the next 60 hours"),
        heading(`${offer.percentOff}% off the whole course`),
        hi,
        p(line1),
        codeBox(offer.code, offer.percentOff, offer.expiresAt),
        districtList(),
        p(line2),
        button(checkoutUrl, "Unlock every district"),
      ].join("");
      return {
        subject: `${offer.percentOff}% off lifetime access, for 60 hours`,
        html: layout({ preheader: `Code ${offer.code}: ${offer.percentOff}% off, applied automatically.`, body, ctx }),
        text: textOf(
          [
            `Hi ${ctx.firstName},`,
            line1,
            `Code ${offer.code} takes ${offer.percentOff}% off lifetime access. It is applied automatically at checkout and ends ${fmtExpiry(offer.expiresAt)} (UK time).`,
            `The districts ahead:\n${districtText()}`,
            line2,
            `Unlock every district: ${checkoutUrl}`,
          ],
          ctx
        ),
      };
    }

    case "coffee": {
      const line1 = "Your account has the whole course open: every lesson that is live now, and the rest as they are released. There is nothing to pay.";
      const line2 = "If something could be clearer or is missing, reply to this email and tell us. It is the quickest way to make the course better.";
      const body = [
        eyebrow("Your account"),
        heading("Every district is open to you"),
        hi,
        p(line1),
        p(line2),
        p(`Or just carry on: ${link(dashboardUrl, "your next district is waiting")}.`),
      ].join("");
      return {
        subject: "The course is yours",
        html: layout({ preheader: "Everything is open on your account. Reply with anything that could be better.", body, ctx }),
        text: textOf([`Hi ${ctx.firstName},`, line1, line2, `Or carry on with your next district: ${dashboardUrl}`], ctx),
      };
    }

    case "offer-expires": {
      const offer = ctx.offer;
      if (!offer) throw new Error("offer-expires step rendered without an offer");
      const after = "After that Lesson 1 stays free, and we won't send another discount. If the price is the sticking point, or anything else is, reply and tell us.";
      const body = [
        eyebrow("Last call"),
        heading(`Your ${offer.percentOff}% code ends soon`),
        p(`Quick one${ctx.firstName === NO_NAME ? "" : `, ${name}`}: your code ends ${esc(fmtExpiry(offer.expiresAt))} (UK time).`),
        codeBox(offer.code, offer.percentOff, offer.expiresAt),
        button(checkoutUrl, "Use my code"),
        p(after),
      ].join("");
      return {
        subject: `Your ${offer.percentOff}% code ends soon`,
        html: layout({ preheader: `Code ${offer.code} ends ${fmtExpiry(offer.expiresAt)}.`, body, ctx }),
        text: textOf(
          [
            `Hi ${ctx.firstName},`,
            `Your ${offer.percentOff}% code (${offer.code}) ends ${fmtExpiry(offer.expiresAt)} (UK time). It is applied automatically at checkout: ${checkoutUrl}`,
            after,
          ],
          ctx
        ),
      };
    }
  }
}

/** A stand-in learner for previews. */
export function sampleContext(baseUrl: string, over: Partial<NurtureEmailContext> = {}): NurtureEmailContext {
  return {
    firstName: "Nancy",
    baseUrl,
    unsubscribeUrl: `${baseUrl}/api/email/unsubscribe?u=preview&t=preview`,
    lesson1Completed: false,
    lesson1Started: false,
    offer: { code: "AEO-PREVIEW", expiresAt: new Date(Date.now() + 60 * 3_600_000), percentOff: 33 },
    ...over,
  };
}
