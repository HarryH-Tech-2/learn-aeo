/**
 * The keyboard's two emails (server only):
 *   - "Email it to me": the free share-size picture on a finish, for an email address (lead source "keyboard")
 *   - the bought HD picture (webhook, lead source "keyboard-image")
 * In the shared email look (src/lib/email-layout.ts), from Harry, replies to the owner's inbox.
 */
import { Resend } from "resend";
import { BODY_FONT, EMAIL_COLORS, button, emailLayout, esc, heading, heroImage, panel, paragraph } from "@/lib/email-layout";
import { ownerEmail } from "@/lib/notify";
import { guestPlayHref } from "@/lib/guest-play";
import {
  keyboardImageFilename,
  keyboardImagePath,
  keyboardRestorePath,
  keyboardStyleById,
  printableName,
  type CardSpell,
  type KeyboardStyleId,
  type KeyboardTemplateId,
} from "@/lib/keyboard-card";

const SITE = () => process.env.NEXTAUTH_URL || "https://www.learnhieroglyphics.com";

function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

/** The shared layout, with these emails' footer line and Harry's sign-off. */
function layout(o: { preheader: string; hero?: string; body: string }): string {
  return emailLayout({
    baseUrl: SITE().replace(/\/$/, ""),
    preheader: o.preheader,
    hero: o.hero,
    body: o.body,
    signature: "Founder, Learn Hieroglyphics",
    reason: "Learn Hieroglyphics &middot; reply to this email with any question, it comes straight to me.",
  });
}

type Card = { typed: string[]; style: KeyboardStyleId; template: KeyboardTemplateId; spell?: CardSpell; letters?: boolean };

/** `joinUrl`: on a name whose sender didn't tick the box, the one-click "yes" to the name follow-up (src/lib/name-drip.ts). */
export async function sendKeyboardKeepEmail(to: string, card: Card, file: Buffer, opts: { joinUrl?: string } = {}): Promise<void> {
  const site = SITE();
  const style = keyboardStyleById(card.style);
  const text = card.typed.join("").trim().toUpperCase();
  const hdUrl = site + keyboardRestorePath(card, { keep: "hd" });
  const name = printableName(card.typed);
  const printUrl = name ? site + keyboardRestorePath(card, { keep: "print" }) : null;
  const lessonUrl = site + guestPlayHref();
  const imgUrl = site + keyboardImagePath(card);

  const body = [
    heading(`Your hieroglyphs, on ${esc(style.label.toLowerCase())}`),
    paragraph(`Here is the picture you made${card.spell === "name" ? "" : " on the hieroglyphics keyboard"}. It is attached too, ready to share or set as a background.`),
    paragraph(
      `It reads <strong style="color:${EMAIL_COLORS.goldLight};">${esc(text)}</strong>: ${
        card.spell === "name" ? "spelled by its sounds, in a cartouche, the oval that held a pharaoh's name." : "one sign for each letter, the way the Egyptians spelled out foreign names."
      }`
    ),
    button(hdUrl, "Get it in HD, without our address", { center: true }),
    printUrl ? button(printUrl, "See it as a framed print", { secondary: true, center: true }) : "",
    button(lessonUrl, "Learn to read it yourself: Lesson 1 is free", { secondary: true, center: true }),
    opts.joinUrl
      ? panel(
          `${paragraph(`Want to know what each sign in <strong style="color:${EMAIL_COLORS.goldLight};">${esc(text)}</strong> is a picture of? I can send you three short emails about it, and tell you when Christmas prints open.`, { size: 15 })}
          <a href="${opts.joinUrl}" style="font-family:${BODY_FONT};font-size:14px;font-weight:700;color:${EMAIL_COLORS.goldLight};text-decoration:none;">Yes, send me the three emails</a>`
        )
      : "",
  ].join("");
  const html = layout({
    preheader: `Here is the picture you made. It reads ${text}.`,
    hero: heroImage(imgUrl, `${text} in hieroglyphs`),
    body,
  });

  const plain = [
    `Here is the picture you made${card.spell === "name" ? "" : " on the hieroglyphics keyboard"} (attached).`,
    `It reads ${text}.`,
    "",
    `HD, without our address: ${hdUrl}`,
    printUrl ? `As a framed print: ${printUrl}` : "",
    `Learn to read it yourself, Lesson 1 is free: ${lessonUrl}`,
    opts.joinUrl ? `\nWant three short emails about what each sign in ${text} is a picture of? Yes, send them: ${opts.joinUrl}` : "",
    "",
    "Harry",
  ]
    .filter((l) => l !== null)
    .join("\n");

  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: fromAddress(),
    to,
    replyTo: ownerEmail(),
    subject: `Your hieroglyphs: ${text.slice(0, 40)}`,
    html,
    text: plain,
    attachments: [{ filename: keyboardImageFilename(card.typed, card.style), content: file }],
    tags: [{ name: "lead", value: card.spell === "name" ? "cartouche" : "keyboard" }],
  });
  if (result.error) throw new Error(`Resend: ${result.error.message}`);
}

export async function sendKeyboardHdEmail(to: string, card: Card, file: Buffer, downloadUrl: string): Promise<void> {
  const site = SITE();
  const text = card.typed.join("").trim().toUpperCase();
  const name = printableName(card.typed);
  const printUrl = name ? site + keyboardRestorePath(card, { keep: "print" }) : null;

  const body = [
    heading("Thank you. Your HD picture is attached"),
    paragraph(
      `Thank you for buying the HD copy of <strong style="color:${EMAIL_COLORS.goldLight};">${esc(text)}</strong>. It is attached at 2400 × 1260, without our web address. If the attachment goes missing, this link builds it again:`
    ),
    button(downloadUrl, "Download the HD picture", { center: true }),
    printUrl ? button(printUrl, "Want it on the wall? See it as a framed print", { secondary: true, center: true }) : "",
    paragraph("If anything is wrong with it, just reply."),
  ].join("");
  const html = layout({ preheader: `Your HD copy of ${text} is attached.`, body });

  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: fromAddress(),
    to,
    replyTo: ownerEmail(),
    subject: `Your HD hieroglyphs: ${text.slice(0, 40)}`,
    html,
    text: `Thank you for buying the HD copy of ${text}. It is attached. If it goes missing: ${downloadUrl}\n\nHarry`,
    attachments: [{ filename: keyboardImageFilename(card.typed, card.style, true), content: file }],
    tags: [{ name: "purchase", value: "keyboard-image" }],
  });
  if (result.error) throw new Error(`Resend: ${result.error.message}`);
}
