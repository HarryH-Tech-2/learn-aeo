/**
 * "My name in hieroglyphs" follow-up (2026-10-20): three short emails for people who asked for their name's
 * picture by email (the translator's "Email me my cartouche", the keep panel on the translator, pet, tattoo and
 * couple pages) AND said yes to more: the tick box under the form, or the one-click "yes" link in the picture's
 * own email. Anyone who only asked for the picture is never written to again.
 *
 * Opting in records an EmailLead with source "name-drip" (name = the name they typed). Each step is marked sent
 * with its own source ("name-drip-sent:<step>"). Stops for good on the "no-more" lead (one-click unsubscribe) or an
 * account that unsubscribed.
 *
 *   day 1  signs  what each sign in their name is a picture of        → HD picture ($3.99) or a print
 *   day 3  read   reading it yourself: Lesson 1 is free, starts with it → the free lesson (skipped for course owners)
 *   day 6  gift   a present with a name on it                          → posted print, gift a course, the name puzzle
 *                                                                        (skipped once they bought a print)
 *
 * Pure rules and rendering here (tested); the send is in src/lib/name-drip-run.ts, from the daily cron.
 * Prices are never written into the copy (they differ by country); the pages they link to show the visitor's own.
 */
import { christmasNotice } from "@/lib/cartouche-print";
import {
  BODY_FONT,
  EMAIL_COLORS as C,
  button,
  divider,
  emailLayout,
  esc,
  eyebrow,
  heading,
  heroImage,
  link,
  panel,
  paragraph as p,
  subheading,
} from "@/lib/email-layout";
import { GIFT_PATH } from "@/lib/gift-course";
import { guestPlayHref } from "@/lib/guest-play";
import { transliterateName } from "@/lib/hieroglyph-translator";
import { cleanName, keyboardImagePath, keyboardMessagePath, keyboardRestorePath, printableName } from "@/lib/keyboard-card";

/** EmailLead source of an opt-in. */
export const NAME_DRIP_SOURCE = "name-drip";
/** EmailLead source marking one step sent. */
export const nameDripSentSource = (step: NameDripStepKey) => `name-drip-sent:${step}`;

/** The tick box's words under every "email it to me" form that sends a name. */
export const NAME_DRIP_LABEL = "Also send me 3 short emails about my name in hieroglyphs, and when Christmas prints open (unsubscribe any time)";

export type NameDripStepKey = "signs" | "read" | "gift";
export const NAME_DRIP_STEPS: { key: NameDripStepKey; day: number }[] = [
  { key: "signs", day: 1 },
  { key: "read", day: 3 },
  { key: "gift", day: 6 },
];
/** Leads older than this are not picked up again (a missed step is skipped, never sent late in a bunch). */
export const NAME_DRIP_LAST_DAY = 10;

const DAY_MS = 86_400_000;

export type DripLead = {
  email: string;
  name: string | null;
  optedInAt: Date;
  /** steps already sent */
  sent: NameDripStepKey[];
  optedOut: boolean;
  /** owns the course (an ACTIVE account) */
  member: boolean;
  /** bought a posted or digital Cartouche Print */
  boughtPrint: boolean;
};

/**
 * The one step due for a lead now, or null. Steps go in order; a step that no longer applies (member, bought a
 * print) is passed over. One email per run at most, and nothing once the last day has gone.
 */
export function dueStep(lead: DripLead, now: Date): NameDripStepKey | null {
  if (lead.optedOut) return null;
  const age = (now.getTime() - lead.optedInAt.getTime()) / DAY_MS;
  if (age > NAME_DRIP_LAST_DAY) return null;
  for (const step of NAME_DRIP_STEPS) {
    if (lead.sent.includes(step.key)) continue;
    if (step.key === "read" && lead.member) continue;
    if (step.key === "gift" && lead.boughtPrint) continue;
    return age >= step.day ? step.key : null;
  }
  return null;
}

export type NameDripEmail = { subject: string; html: string; text: string };

/** The name as the picture and the print spell it, or null when it can't be drawn (non-Latin, too long). */
function dripName(raw: string | null): string | null {
  if (!raw) return null;
  return printableName(cleanName(raw));
}

/** First letter capitalised, the rest as typed: "harry" → "Harry". */
function display(name: string): string {
  return name.replace(/(^|[\s-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());
}

export function renderNameDripEmail(step: NameDripStepKey, lead: { name: string | null }, baseUrl: string, unsubscribeUrl: string, now: Date = new Date()): NameDripEmail {
  const base = baseUrl.replace(/\/$/, "");
  const utm = (path: string) => `${base}${path}${path.includes("?") ? "&" : "?"}utm_source=name-drip&utm_medium=email&utm_campaign=${step}`;
  const name = dripName(lead.name);
  const shown = name ? display(name) : null;
  const typed = name ? cleanName(name) : [];
  const card = { typed, style: "pyramids" as const, spell: "name" as const, letters: true };
  const translatorUrl = utm("/translate-name-to-hieroglyphics");
  const hdUrl = name ? utm(keyboardRestorePath(card, { keep: "hd" })) : translatorUrl;
  const printUrl = name ? utm(keyboardRestorePath(card, { keep: "print" })) : translatorUrl;
  const cartoucheImg = name ? `${base}/cartouche-image?name=${encodeURIComponent(shown!)}` : `${base}/email/door.jpg`;
  const cartoucheAlt = name ? `${shown} written in hieroglyphs inside a royal cartouche` : "A sealed temple door carved with hieroglyphs";
  const reason = `You asked for more emails about your name in hieroglyphs on learnhieroglyphics.com. Three in all; this is ${
    step === "signs" ? "the first" : step === "read" ? "the second" : "the last"
  }.`;
  const textFooter = ["Harry", "Founder, Learn Hieroglyphics (just reply, I read every email)", "", `${reason} Unsubscribe: ${unsubscribeUrl}`];

  if (step === "signs") {
    const signs = name ? transliterateName(name) : [];
    // letters the scribe left out (most vowels, a doubled letter written once)
    const dropped = !!name && signs.reduce((n, r) => n + r.input.length, 0) < name.replace(/[^p{L}]/gu, "").length;
    const rows = signs
      .map(
        (r) => `<tr>
      <td valign="top" style="padding:9px 14px 9px 0;font-family:'Cinzel',Georgia,serif;font-size:18px;font-weight:600;color:${C.goldLight};width:34px;">${esc(r.input.toUpperCase())}</td>
      <td style="padding:9px 0;border-bottom:1px solid ${C.line};font-family:${BODY_FONT};font-size:15px;line-height:1.5;color:${C.sand};"><strong style="font-weight:600;">${esc(r.mapping.signName)}</strong><br><span style="font-size:14px;color:${C.muted};">${esc(r.mapping.note)}</span></td>
    </tr>`
      )
      .join("");
    const body = [
      eyebrow("Your name, sign by sign"),
      heading(shown ? `What the signs in <span style="color:${C.goldLight};">${esc(shown)}</span> really are` : "What the signs in a name really are"),
      p(
        "Every sign in a cartouche is a little picture that stands for a sound. A scribe would have known each one by sight, the way you know the letters of your own name. Here is what yours are pictures of:"
      ),
      rows ? panel(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`) : "",
      dropped ? p("Some letters of your name have no sign of their own. That is not a mistake: Egyptian left out most vowels, and a sound said once is written once, just as a scribe would have done.") : "",
      divider(),
      subheading("Keep it the way it deserves"),
      p(
        `The free picture carries our web address along the bottom. The HD version is twice the size, with nothing on it but ${
          shown ? esc(shown) : "the name"
        } on the background you chose: good for a phone wallpaper, a printout or a frame.`
      ),
      button(hdUrl, "Get it in HD"),
      p(`Or have it ${link(printUrl, "printed on fine-art paper and posted")}, framed if you like.`, { size: 15 }),
    ].join("");
    return {
      subject: shown ? `What the signs in ${shown} really are` : "What the signs in your name really are",
      html: emailLayout({ baseUrl: base, preheader: "A sign-by-sign look at your name, the way a scribe would have read it.", hero: heroImage(cartoucheImg, cartoucheAlt, translatorUrl), body, reason, unsubscribeUrl }),
      text: [
        shown ? `Here is what the signs in ${shown} are pictures of:` : "Here is what the signs in your name are pictures of:",
        signs.map((r) => `${r.input.toUpperCase()}: ${r.mapping.signName}. ${r.mapping.note}`).join("\n"),
        dropped ? "Some letters have no sign of their own: Egyptian left out most vowels, and a sound said once is written once." : "",
        `Get it in HD, without our web address: ${hdUrl}`,
        `Or as a posted fine-art print: ${printUrl}`,
        "",
        ...textFooter,
      ].join("\n\n"),
    };
  }

  if (step === "read") {
    const lessonUrl = utm(guestPlayHref(shown ?? ""));
    const body = [
      eyebrow("No translator needed"),
      heading(shown ? `${esc(shown)}, could you read it on your own?` : "Could you read it on your own?"),
      p(
        "The translator did the work for you. But the signs in your name are part of an alphabet of just 25, and once you know them you can spell any name, and start picking words out of real temple walls."
      ),
      p(
        `Lesson 1 is free and takes about ten minutes a part. It starts with ${
          shown ? `<strong style="color:${C.goldLight};">${esc(shown)}</strong>` : "your own name"
        } carved on a sealed temple door: brush off the sand, read the signs, and the door opens. No account needed to start.`
      ),
      button(lessonUrl, "Open the sealed door"),
      p(`Prefer to play? The same lesson is a 3D game: ${link(utm(`${guestPlayHref(shown ?? "")}&mode=game`), "walk the Causeway of Thoth")}.`, { size: 15 }),
    ].join("");
    return {
      subject: shown ? `${shown}, could you read it without the translator?` : "Could you read it without the translator?",
      html: emailLayout({ baseUrl: base, preheader: "Lesson 1 is free, and it starts with your own name on a sealed door.", hero: heroImage(`${base}/email/door.jpg`, "A sealed temple door carved with hieroglyphs", lessonUrl), body, reason, unsubscribeUrl }),
      text: [
        "The signs in your name are part of an alphabet of just 25. Once you know them you can spell any name.",
        `Lesson 1 is free and starts with ${shown ?? "your own name"} on a sealed temple door. No account needed to start: ${lessonUrl}`,
        "",
        ...textFooter,
      ].join("\n\n"),
    };
  }

  // gift
  const notice = christmasNotice("print", now);
  const orderBy = notice?.kind === "order-by" ? notice.text : null;
  const giftUrl = utm(GIFT_PATH);
  const puzzleUrl = name ? utm(keyboardMessagePath(typed, "pyramids", "name")) : translatorUrl;
  const body = [
    eyebrow("A present with a name on it"),
    heading("Someone you know would love their name in hieroglyphs"),
    p(
      "A name in a pharaoh's cartouche makes a lovely present: personal, a little mysterious, and it starts a conversation every time someone sees it. Three ways to give one:"
    ),
    panel(
      `<p style="margin:0 0 6px;font-family:${BODY_FONT};font-size:16px;font-weight:600;color:${C.sand};">A print for the wall</p>
       <p style="margin:0 0 10px;font-family:${BODY_FONT};font-size:14px;line-height:1.55;color:${C.muted};">Any name, giclée-printed on fine-art paper over the pyramids, the Nile or a temple wall, posted to them, framed if you like.${
         orderBy ? ` <span style="color:${C.goldLight};">${esc(orderBy)}.</span>` : ""
       }</p>
       <a href="${printUrl}" style="font-family:${BODY_FONT};font-size:14px;font-weight:700;color:${C.goldLight};text-decoration:none;">See the prints</a>`
    ),
    panel(
      `<p style="margin:0 0 6px;font-family:${BODY_FONT};font-size:16px;font-weight:600;color:${C.sand};">The whole course, as a gift</p>
       <p style="margin:0 0 10px;font-family:${BODY_FONT};font-size:14px;line-height:1.55;color:${C.muted};">Lifetime access to every lesson, with a gift certificate showing their name in a cartouche. They learn to read it themselves.</p>
       <a href="${giftUrl}" style="font-family:${BODY_FONT};font-size:14px;font-weight:700;color:${C.goldLight};text-decoration:none;">Give the course</a>`
    ),
    panel(
      `<p style="margin:0 0 6px;font-family:${BODY_FONT};font-size:16px;font-weight:600;color:${C.sand};">Free: send it as a puzzle</p>
       <p style="margin:0 0 10px;font-family:${BODY_FONT};font-size:14px;line-height:1.55;color:${C.muted};">Send a friend ${
         shown ? esc(shown) : "a name"
       } in hieroglyphs and let them work out what it says, with a key to help.</p>
       <a href="${puzzleUrl}" style="font-family:${BODY_FONT};font-size:14px;font-weight:700;color:${C.goldLight};text-decoration:none;">Send the puzzle</a>`
    ),
    button(printUrl, "Make one for someone"),
  ].join("");
  return {
    subject: orderBy ? `A present with a name on it (${orderBy.replace(/ for Christmas delivery$/, " for Christmas")})` : "A present with a name on it",
    html: emailLayout({ baseUrl: base, preheader: "A print for the wall, the course as a gift, or a free name puzzle.", hero: name ? heroImage(`${base}${keyboardImagePath(card)}`, `${shown} in hieroglyphs over the pyramids`, printUrl) : undefined, body, reason, unsubscribeUrl }),
    text: [
      "A name in a pharaoh's cartouche makes a lovely present. Three ways to give one:",
      `A posted fine-art print, framed if you like${orderBy ? ` (${orderBy})` : ""}: ${printUrl}`,
      `The whole course as a gift: ${giftUrl}`,
      `Free: send a name as a puzzle: ${puzzleUrl}`,
      "",
      ...textFooter,
    ].join("\n\n"),
  };
}
