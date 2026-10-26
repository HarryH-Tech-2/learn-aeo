/**
 * "Tell me when Christmas prints open" (2026-10-18): a box under the "email it to me" forms (the keyboard's and
 * the name translator's keep panel, and "Email me my cartouche"). Ticking it records an EmailLead with source
 * "gift-updates" beside the picture's own lead; nobody who left it unticked is ever written to.
 *
 * One email, sent by hand when the posted prints are ready for Christmas (src/lib/gift-updates-run.ts, through
 * /api/cron/gift-updates): their own name on the pyramids, the order-by date, and a one-click unsubscribe.
 * Pure rules and the email here (tested); the send is in gift-updates-run.ts.
 */
import { christmasNotice } from "@/lib/cartouche-print";
import { cleanName, keyboardImagePath, keyboardRestorePath, printableName } from "@/lib/keyboard-card";
import { EMAIL_COLORS, button, emailLayout, esc, heading, heroImage, paragraph } from "@/lib/email-layout";

/** EmailLead source of an opt-in. */
export const GIFT_UPDATES_SOURCE = "gift-updates";
/** EmailLead source that marks the email as sent (the unique email+source pair stops a second send). */
export const GIFT_UPDATES_SENT_SOURCE = "gift-updates-sent";
/** EmailLead source of anyone who asked for no more mail (one-click unsubscribe, or by hand). */
export const NO_MORE_SOURCE = "no-more";

/** The tick box's words, shared by every form that carries it. */
export const GIFT_UPDATES_LABEL = "Also email me once when Christmas prints open (one email, unsubscribe any time)";

export type GiftLead = { email: string; name: string | null };

/** Opted in, not sent yet, not opted out since. */
export function selectGiftUpdates(leads: GiftLead[], ctx: { sent: Set<string>; optedOut: Set<string> }): GiftLead[] {
  const seen = new Set<string>();
  return leads.filter((l) => {
    const e = l.email.toLowerCase();
    if (seen.has(e) || ctx.sent.has(e) || ctx.optedOut.has(e)) return false;
    seen.add(e);
    return true;
  });
}

export type GiftUpdatesEmail = { subject: string; html: string; text: string };

/**
 * The email for one lead. With a name the print can carry, it shows that name in a cartouche over the pyramids and
 * links straight to its print; otherwise it links to the translator.
 */
export function renderGiftUpdatesEmail(lead: GiftLead, baseUrl: string, unsubscribeUrl: string, now: Date = new Date()): GiftUpdatesEmail {
  const base = baseUrl.replace(/\/$/, "");
  const utm = "utm_source=gift-updates&utm_medium=email&utm_campaign=christmas-prints";
  const name = lead.name ? printableName(cleanName(lead.name)) : null;
  const typed = name ? cleanName(name) : [];
  const card = { typed, style: "pyramids" as const, spell: "name" as const, letters: true };
  const printUrl = name ? `${base}${keyboardRestorePath(card, { keep: "print" })}&${utm}` : `${base}/translate-name-to-hieroglyphics?${utm}`;
  const imgUrl = name ? `${base}${keyboardImagePath(card)}` : null;
  const upper = name ? name.toUpperCase() : null;
  const notice = christmasNotice("print", now);
  const orderBy = notice?.kind === "order-by" ? `${notice.text}.` : "";

  const subject = upper ? `Christmas prints are open: ${upper} in a pharaoh's cartouche` : "Christmas prints are open: a name in a pharaoh's cartouche";
  const reason = 'You ticked "email me when Christmas prints open" on learnhieroglyphics.com. This is the one email.';
  const body = [
    heading(upper ? `${esc(upper)}, printed for the wall` : "A name, printed for the wall"),
    paragraph(
      `You asked me to tell you when the Christmas prints open, so here it is: ${
        upper ? `<strong style="color:${EMAIL_COLORS.goldLight};">${esc(upper)}</strong>` : "any name"
      } in a pharaoh's cartouche, giclée-printed on fine-art paper over the pyramids, the Nile or a temple wall, posted to you and framed if you like.`
    ),
    orderBy ? paragraph(esc(orderBy), { color: EMAIL_COLORS.gold }) : "",
    button(printUrl, "See it as a print", { center: true }),
  ].join("");
  const html = emailLayout({
    baseUrl: base,
    preheader: upper ? `${upper} in a pharaoh's cartouche, printed and posted to you.` : "Any name in a pharaoh's cartouche, printed and posted to you.",
    hero: imgUrl ? heroImage(imgUrl, `${upper} in hieroglyphs over the pyramids`) : undefined,
    body,
    signature: "Founder, Learn Hieroglyphics",
    reason: esc(reason),
    unsubscribeUrl,
  });
  const text = [
    `You asked me to tell you when the Christmas prints open, so here it is: ${upper ?? "any name"} in a pharaoh's cartouche, giclée-printed on fine-art paper, posted to you and framed if you like.`,
    orderBy,
    "",
    `See it as a print: ${printUrl}`,
    "",
    "Harry",
    "",
    `You ticked "email me when Christmas prints open" on learnhieroglyphics.com. This is the one email. Unsubscribe: ${unsubscribeUrl}`,
  ]
    .filter((l, i, all) => l !== "" || all[i - 1] !== "")
    .join("\n");
  return { subject, html, text };
}
