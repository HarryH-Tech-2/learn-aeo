/**
 * Copy and rendering for the nurture sequence (src/lib/nurture.ts).
 *
 * One look for every step, matching the site: obsidian background, gold
 * accents, Open Sans (loaded from Google Fonts where the client allows it,
 * else Segoe UI / Helvetica / Arial). Table layout and inline styles so it
 * holds up in Gmail and Outlook. Hieroglyphs only ever appear inside images
 * (most mail clients have no font for them): JPEG/PNG files in public/email/
 * plus the live /cartouche-image route for the learner's own name.
 *
 * Prices are never written into the copy: they differ by country (GBP for
 * the UK, purchasing-power prices elsewhere), so emails link to /pricing or
 * checkout, which show the visitor's own price. Discounts are a percentage.
 */
import type { NurtureStepKey } from "@/lib/nurture";
import {
  BODY_FONT as FONT,
  EMAIL_COLORS as C,
  button,
  emailLayout,
  esc,
  eyebrow,
  heading,
  heroImage,
  link,
  panel,
  paragraph as p,
} from "@/lib/email-layout";

export type NurtureEmailContext = {
  firstName: string;
  baseUrl: string;
  unsubscribeUrl: string;
  lesson1Completed: boolean;
  /** Answered at least one Lesson 1 exercise (door-sealed: "your place is saved" instead of "your door is waiting") */
  lesson1Started: boolean;
  offer: { code: string; expiresAt: Date; percentOff: number } | null;
  /** The free-unlock test's free group (src/lib/access-test.ts): the course is open to them, nothing to sell */
  freeUnlock?: boolean;
};

export type RenderedEmail = { subject: string; html: string; text: string };

/** utm_source on every link in these emails; the campaign is the step key. */
export const NURTURE_UTM_SOURCE = "nurture";

/** The seven paid lessons, in course order (titles match src/lib/lessons.ts). */
const CHAMBERS: [string, string][] = [
  ["The Outer Courtyard", "animal and plant signs"],
  ["The Pilgrim's Gallery", "determinatives, the silent signs that carry meaning"],
  ["The Treasury", "Egyptian numerals"],
  ["The Royal Hall", "pharaohs' names in their cartouches"],
  ["The Sacred Chapel", "the offering formula on tombs and stelae"],
  ["The Hypostyle Hall", "a real monumental temple text"],
  ["The Inner Sanctum", "how multi-sound signs build words"],
];

function fmtExpiry(d: Date): string {
  return d.toLocaleString("en-GB", { weekday: "long", hour: "numeric", minute: "2-digit", timeZone: "Europe/London" });
}

/** A name the cartouche image can spell (Latin letters only), else null. */
function cartoucheName(first: string): string | null {
  return first !== "Scholar" && /^[A-Za-z][A-Za-z' -]{0,19}$/.test(first) ? first : null;
}

function cartoucheSrc(baseUrl: string, name: string): string {
  return `${baseUrl}/cartouche-image?name=${encodeURIComponent(name)}`;
}

// ── building blocks (the shared ones are in src/lib/email-layout.ts) ─────────

/** The learner's name as a scribe would write it (falls back to the door). */
function cartoucheHero(ctx: NurtureEmailContext, href: string): string {
  const name = cartoucheName(ctx.firstName);
  if (!name) return heroImage(`${ctx.baseUrl}/email/door.jpg`, "The sealed door at Base Camp", href);
  return heroImage(cartoucheSrc(ctx.baseUrl, name), `${name}, written in hieroglyphs inside a royal cartouche`, href);
}

function chamberList(): string {
  const rows = CHAMBERS.map(
    ([title, what], i) => `<tr>
      <td valign="top" style="padding:7px 12px 7px 0;font-family:${FONT};font-size:13px;font-weight:700;color:${C.gold};width:22px;">${i + 2}</td>
      <td style="padding:7px 0;font-family:${FONT};font-size:15px;line-height:1.45;color:${C.sand};"><strong style="font-weight:600;">${esc(title)}</strong><br><span style="color:${C.muted};font-size:14px;">${what}</span></td>
    </tr>`
  ).join("");
  return panel(
    `<p style="margin:0 0 8px;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${C.muted};">Behind the next doors</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">${rows}</table>`
  );
}

function chamberText(): string {
  return CHAMBERS.map(([t, w], i) => `${i + 2}. ${t}: ${w}`).join("\n");
}

/** One "free thing" row: thumbnail, title, line, link. */
function featureRow(img: string, alt: string, href: string, title: string, line: string, cta: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
  <tr>
    <td width="160" valign="top" style="padding:0 16px 0 0;"><a href="${href}"><img src="${img}" width="160" alt="${esc(alt)}" style="display:block;width:160px;height:auto;border:0;border-radius:4px;"></a></td>
    <td valign="top" style="font-family:${FONT};">
      <p style="margin:0 0 4px;font-family:${FONT};font-size:16px;font-weight:600;color:${C.sand};">${title}</p>
      <p style="margin:0 0 8px;font-family:${FONT};font-size:14px;line-height:1.5;color:${C.muted};">${line}</p>
      <a href="${href}" style="font-family:${FONT};font-size:14px;font-weight:600;color:${C.goldLight};text-decoration:none;">${cta}</a>
    </td>
  </tr></table>`;
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
function layout(opts: { preheader: string; hero?: string; body: string; ctx: NurtureEmailContext }): string {
  return emailLayout({
    baseUrl: opts.ctx.baseUrl,
    preheader: opts.preheader,
    hero: opts.hero,
    body: opts.body,
    reason: "You are getting this because you made a free account at learnhieroglyphics.com.",
    unsubscribeUrl: opts.ctx.unsubscribeUrl,
  });
}

/** Plain-text part: the same words, links written out. */
function textOf(lines: string[], ctx: NurtureEmailContext): string {
  return [...lines, "Harry\nFounder, Learn Hieroglyphics (just reply, I read every email)", `Unsubscribe: ${ctx.unsubscribeUrl}`].join(
    "\n\n"
  );
}

// ── the emails ──────────────────────────────────────────────────────────────

export function renderNurtureEmail(key: NurtureStepKey, ctx: NurtureEmailContext): RenderedEmail {
  const name = esc(ctx.firstName);
  // Every link says which email it came from: CampaignTracker counts the click (src/lib/campaign.ts,
  // shown on /admin/marketing) and GA4 files the visit under nurture / email / <step>.
  const tagged = (path: string) =>
    `${ctx.baseUrl}${path}${path.includes("?") ? "&" : "?"}utm_source=${NURTURE_UTM_SOURCE}&utm_medium=email&utm_campaign=${key}`;
  const lessonUrl = tagged("/lessons/expedition-begins");
  const gameUrl = tagged("/lessons/expedition-begins?mode=game");
  const pricingUrl = tagged("/pricing");
  const checkoutUrl = tagged("/get-started?next=checkout");
  const translatorUrl = tagged("/translate-name-to-hieroglyphics");
  const dailyUrl = tagged("/daily");
  const ownName = cartoucheName(ctx.firstName);

  switch (key) {
    case "welcome": {
      const body = [
        eyebrow("Your expedition has begun"),
        heading(
          ownName
            ? `This is how a scribe would write <span style="color:${C.goldLight};">${name}</span>`
            : `Welcome, ${name}`
        ),
        p(
          ownName
            ? "Every sign in that oval stands for a sound, and by the end of Lesson 1 you will be able to read each one yourself. No guessing and no secret symbols: just the 25 signs of the hieroglyphic alphabet, the same ones carved on temple walls."
            : "Your account is ready. Lesson 1 teaches the 25 signs of the hieroglyphic alphabet, the same ones carved on temple walls, and by the end you can spell your own name."
        ),
        p("It comes in three short parts. The first starts with your name on a sealed door, and your place is saved after each part, so stop whenever you like."),
        button(lessonUrl, "Open the sealed door"),
        p(`Prefer to play? The same lesson is also a 3D game: ${link(gameUrl, "walk the Causeway of Thoth")}.`),
      ].join("");
      return {
        subject: ownName ? `${ctx.firstName}, here is your name in hieroglyphs` : "Your expedition has begun",
        html: layout({ preheader: "Lesson 1 is free, and it starts with your own name.", hero: cartoucheHero(ctx, lessonUrl), body, ctx }),
        text: textOf(
          [
            `Hi ${ctx.firstName},`,
            ownName
              ? `Here is how a scribe would write your name: ${cartoucheSrc(ctx.baseUrl, ownName)}\nBy the end of Lesson 1 you can read every sign in it yourself.`
              : "Your account is ready. Lesson 1 teaches the 25 signs of the hieroglyphic alphabet, and by the end you can spell your own name.",
            "It comes in three short parts, and your place is saved after each one.",
            `Open the sealed door: ${lessonUrl}`,
            `Prefer to play? The same lesson as a 3D game: ${gameUrl}`,
          ],
          ctx
        ),
      };
    }

    case "door-sealed": {
      // Never started (no exercise answered): the door is still waiting for them.
      // Part-way through: their place is saved, so the ask is to carry on, not to begin.
      if (!ctx.lesson1Started) {
        const body = [
          eyebrow("Lesson 1 · Part 1"),
          heading(`Your door is waiting, ${name}`),
          p("You made an account, but you haven't opened the door at Base Camp yet. Behind it is the first part of the free lesson: the signs of your own name, brushed clear one at a time."),
          p("Part 1 is short. Your name on the door, then your first three real Egyptian words, read by you. No payment, nothing to install."),
          button(lessonUrl, "Open the door"),
          p(`Not in the mood for reading? ${link(gameUrl, "Play the 3D version")}: the same signs, but you cross the Nile on stepping stones.`),
        ].join("");
        return {
          subject: "Your door is waiting",
          html: layout({
            preheader: "Part 1 is short, and it starts with your own name.",
            hero: heroImage(`${ctx.baseUrl}/email/door.jpg`, "The sealed door at Base Camp", lessonUrl),
            body,
            ctx,
          }),
          text: textOf(
            [
              `Hi ${ctx.firstName},`,
              "You made an account, but you haven't opened the door at Base Camp yet. Behind it is the first part of the free lesson: the signs of your own name.",
              "Part 1 is short: your name on the door, then your first three real Egyptian words.",
              `Open the door: ${lessonUrl}`,
              `Or play the 3D version: ${gameUrl}`,
            ],
            ctx
          ),
        };
      }
      const body = [
        eyebrow("Lesson 1 · in progress"),
        heading(`Your place is saved, ${name}`),
        p("You have made a start on Lesson 1, and the expedition kept your place. Pick up where you stopped and the rest of the alphabet comes in short parts, with your place saved after each one."),
        p("By the end of the lesson you can read all 25 alphabet signs, and spell any name the way a scribe would."),
        button(lessonUrl, "Carry on with Lesson 1"),
        p(`Prefer to play? ${link(gameUrl, "Try the 3D version")}: the same signs, but you cross the Nile on stepping stones.`),
      ].join("");
      return {
        subject: "Your place in Lesson 1 is saved",
        html: layout({
          preheader: "Pick up where you stopped: the rest comes in short parts.",
          hero: heroImage(`${ctx.baseUrl}/email/door.jpg`, "The door at Base Camp", lessonUrl),
          body,
          ctx,
        }),
        text: textOf(
          [
            `Hi ${ctx.firstName},`,
            "You have made a start on Lesson 1, and the expedition kept your place. Pick up where you stopped; the rest comes in short parts.",
            "By the end you can read all 25 alphabet signs and spell any name the way a scribe would.",
            `Carry on: ${lessonUrl}`,
            `Or play the 3D version: ${gameUrl}`,
          ],
          ctx
        ),
      };
    }

    case "next-door": {
      if (ctx.freeUnlock) {
        const dashboardUrl = tagged("/dashboard");
        const body = [
          eyebrow("Lesson 1 complete"),
          heading(`You can read hieroglyphs now, ${name}`),
          p("You know all 25 alphabet signs, which is more than most people who walk past the cases in the British Museum. That is the hardest part of starting, and it is done."),
          p("The whole course is open on your account, free. This is what comes next:"),
          chamberList(),
          button(dashboardUrl, "Open the next chamber"),
        ].join("");
        return {
          subject: "The next door is open",
          html: layout({ preheader: "You know the alphabet. The rest of the course is open to you.", body, ctx }),
          text: textOf(
            [
              `Hi ${ctx.firstName},`,
              "You finished Lesson 1, so you know all 25 alphabet signs. That is the hardest part of starting.",
              `The whole course is open on your account, free. What comes next:
${chamberText()}`,
              `Open the next chamber: ${dashboardUrl}`,
            ],
            ctx
          ),
        };
      }
      const body = [
        eyebrow("Lesson 1 complete"),
        heading(`You can read hieroglyphs now, ${name}`),
        p("You know all 25 alphabet signs, which is more than most people who walk past the cases in the British Museum. That is the hardest part of starting, and it is done."),
        p("The alphabet is the key, not the whole house. This is what the rest of the course opens up:"),
        chamberList(),
        p("One payment unlocks all of it for life, along with the 3D practice levels, the Journey and your certificate. If it is not for you, there is a full refund within 14 days."),
        button(pricingUrl, "See what's included"),
      ].join("");
      return {
        subject: "What is behind the next door",
        html: layout({ preheader: "You know the alphabet. Here is what it unlocks.", body, ctx }),
        text: textOf(
          [
            `Hi ${ctx.firstName},`,
            "You finished Lesson 1, so you know all 25 alphabet signs. That is the hardest part of starting.",
            `What the rest of the course opens up:\n${chamberText()}`,
            "One payment unlocks all of it for life, with a full refund within 14 days if it is not for you.",
            `See what's included: ${pricingUrl}`,
          ],
          ctx
        ),
      };
    }

    case "free-stuff": {
      const body = [
        eyebrow("Free, no catch"),
        heading("Three things to try this week"),
        p(`Hi ${name}, all three are free. Pick whichever sounds most fun.`),
        featureRow(
          `${ctx.baseUrl}/email/causeway.jpg`,
          "The Causeway of Thoth, a 3D level on the Nile",
          gameUrl,
          "The Causeway of Thoth",
          "A 3D level on the Nile. Cross the stepping stones by choosing the right sign.",
          "Play it"
        ),
        featureRow(
          cartoucheSrc(ctx.baseUrl, ownName ?? "Cleopatra"),
          "A name written in a royal cartouche",
          translatorUrl,
          "Any name in a cartouche",
          "Write a name the way a pharaoh's was carved, then download or print it. Friends and family included.",
          "Make one"
        ),
        featureRow(
          `${ctx.baseUrl}/email/door.jpg`,
          "A temple door covered in hieroglyphs",
          dailyUrl,
          "Cartouche of the Day",
          "A new royal name to decode every day. Two minutes with your morning coffee.",
          "Today's puzzle"
        ),
        ctx.lesson1Completed
          ? p("Your Lesson 1 progress is saved, so everything you have learned is still there.")
          : p(`And Lesson 1 is still waiting, with your place saved: ${link(lessonUrl, "carry on where you stopped")}.`),
      ].join("");
      return {
        subject: "Three free things to try this week",
        html: layout({ preheader: "A 3D level, a name in a cartouche and a daily puzzle.", body, ctx }),
        text: textOf(
          [
            `Hi ${ctx.firstName}, three free things to try this week:`,
            `1. The Causeway of Thoth, a 3D level on the Nile: ${gameUrl}`,
            `2. Any name in a cartouche: ${translatorUrl}`,
            `3. Cartouche of the Day, a daily puzzle: ${dailyUrl}`,
            ctx.lesson1Completed ? "Your Lesson 1 progress is saved." : `Lesson 1 is still waiting, with your place saved: ${lessonUrl}`,
          ],
          ctx
        ),
      };
    }

    case "offer": {
      const offer = ctx.offer;
      if (!offer) throw new Error("offer step rendered without an offer");
      const body = [
        eyebrow("For the next 60 hours"),
        heading(`${offer.percentOff}% off every lesson, ${name}`),
        p("You have had a free account for a few days. If you have been wondering whether the rest of the course is worth it, this makes it an easier yes."),
        codeBox(offer.code, offer.percentOff, offer.expiresAt),
        chamberList(),
        p("One payment, lifetime access, and everything added later is included. Full refund within 14 days if it is not for you."),
        button(checkoutUrl, "Unlock all 8 lessons"),
      ].join("");
      return {
        subject: `${offer.percentOff}% off lifetime access, for 60 hours`,
        html: layout({
          preheader: `Code ${offer.code}: ${offer.percentOff}% off, applied automatically.`,
          hero: heroImage(`${ctx.baseUrl}/email/causeway.jpg`, "The Causeway of Thoth", checkoutUrl),
          body,
          ctx,
        }),
        text: textOf(
          [
            `Hi ${ctx.firstName},`,
            `Here is ${offer.percentOff}% off lifetime access for the next 60 hours.`,
            `Code ${offer.code}, applied automatically at checkout, ends ${fmtExpiry(offer.expiresAt)} (UK time).`,
            chamberText(),
            "Full refund within 14 days if it is not for you.",
            `Unlock all 8 lessons: ${checkoutUrl}`,
          ],
          ctx
        ),
      };
    }

    case "coffee": {
      const coffeeUrl = "https://buymeacoffee.com/harryhh";
      const dashboardUrl = tagged("/dashboard");
      const body = [
        eyebrow("From Harry"),
        heading(`A small favour, ${name}`),
        p("Your account has the whole course open: all eight lessons, the 3D levels, the Journey and the community board. There is nothing to pay, and that will not change."),
        p("I build and look after Learn Hieroglyphics on my own. If it has been useful to you, a coffee helps me keep building it."),
        button(coffeeUrl, "Buy me a coffee"),
        p(`Or just carry on: ${link(dashboardUrl, "your next chamber is waiting")}. And if something could be better, reply and tell me.`),
      ].join("");
      return {
        subject: "The course is yours. A small favour?",
        html: layout({ preheader: "Everything is open on your account. If it helps, a coffee keeps it going.", body, ctx }),
        text: textOf(
          [
            `Hi ${ctx.firstName},`,
            "Your account has the whole course open: all eight lessons, the 3D levels, the Journey and the community board. There is nothing to pay.",
            `I build and look after Learn Hieroglyphics on my own. If it has been useful to you, a coffee helps me keep building it: ${coffeeUrl}`,
            `Or carry on with your next chamber: ${dashboardUrl}`,
          ],
          ctx
        ),
      };
    }

    case "offer-expires": {
      const offer = ctx.offer;
      if (!offer) throw new Error("offer-expires step rendered without an offer");
      const body = [
        eyebrow("Last call"),
        heading(`Your ${offer.percentOff}% code ends soon`),
        p(`Quick one, ${name}: your code ends ${esc(fmtExpiry(offer.expiresAt))} (UK time).`),
        codeBox(offer.code, offer.percentOff, offer.expiresAt),
        button(checkoutUrl, "Use my code"),
        p("After that the free lesson stays free, and I won't send another discount. If the price is the sticking point, or anything else is, reply and tell me."),
      ].join("");
      return {
        subject: `Your ${offer.percentOff}% code ends soon`,
        html: layout({ preheader: `Code ${offer.code} ends ${fmtExpiry(offer.expiresAt)}.`, body, ctx }),
        text: textOf(
          [
            `Hi ${ctx.firstName},`,
            `Your ${offer.percentOff}% code (${offer.code}) ends ${fmtExpiry(offer.expiresAt)} (UK time). It is applied automatically: ${checkoutUrl}`,
            "After that the free lesson stays free, and I won't send another discount. If the price is the sticking point, reply and tell me.",
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
    offer: { code: "SCRIBE-PREVIEW", expiresAt: new Date(Date.now() + 60 * 3_600_000), percentOff: 33 },
    ...over,
  };
}
