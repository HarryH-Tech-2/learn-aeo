import { Resend } from "resend";
import { isLicencePlan, type Plan } from "@/lib/plans";
import { lessons } from "@/lib/lessons";
import { ownerEmail } from "@/lib/notify";
import {
  BODY_FONT as FONT,
  EMAIL_COLORS as C,
  button,
  emailLayout,
  esc,
  heading,
  link,
  panel,
  paragraph as p,
  brandFrom,
} from "@/lib/email-layout";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/** "Harry from Learn Hieroglyphics <addr>" unless the env already carries a display name. */
function personalFrom(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

/** The origin the shared layout draws its frieze, mark and header link from. */
function layoutBase(): string {
  return (process.env.NEXTAUTH_URL ?? "https://www.learnhieroglyphics.com").replace(/\/$/, "");
}

/** Gold emphasis inside a paragraph. */
function strong(html: string): string {
  return `<strong style="color:${C.goldLight};">${html}</strong>`;
}

/** A link styled for the small footer line. */
function footLink(href: string, label: string): string {
  return `<a href="${href}" style="color:${C.faint};text-decoration:underline;">${label}</a>`;
}

/** "Learn Hieroglyphics · <contact link>", the line the old emails closed with. */
function contactLine(label = "Reply to this email with any question"): string {
  return `Learn Hieroglyphics &middot; ${footLink(`${process.env.NEXTAUTH_URL}/contact`, label)}`;
}

/** A dashed, centred box holding a code: small label, the code, a muted line under it. */
function codePanel(label: string | null, code: string, under: string): string {
  return panel(
    `${label ? `<p style="margin:0 0 6px;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${C.muted};">${label}</p>` : ""}
    <p style="margin:0 0 6px;font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:2px;color:${C.goldLight};">${esc(code)}</p>
    <p style="margin:0;font-family:${FONT};font-size:13px;color:${C.muted};">${under}</p>`,
    { dashed: true, center: true }
  );
}

/** The plans the purchase welcome covers. */
export type WelcomePlan = "lifetime" | "monthly";

/**
 * Sent by the Stripe webhook after a Lifetime or Expedition Pass (monthly) purchase. Opens with a short
 * thank-you from Harry; replies go to the owner inbox (CONTACT_TO_EMAIL, see notify.ts).
 */
export async function sendWelcomeEmail(
  name: string | null | undefined,
  email: string,
  plan: WelcomePlan = "lifetime"
): Promise<void> {
  const displayName = name || "Scholar";
  const greetingName = name?.trim().split(/\s+/)[0] || "there";
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
  const accountUrl = `${process.env.NEXTAUTH_URL}/account`;
  const lessonCount = lessons.length;
  const monthly = plan === "monthly";

  const thanks = monthly
    ? `Thank you for picking up the Expedition Pass. It genuinely means a lot: Learn Hieroglyphics is just me, and every pass helps keep it going.`
    : `Thank you for buying the course. It genuinely means a lot: Learn Hieroglyphics is just me, and every purchase helps keep it going.`;
  const access = monthly
    ? `Your Expedition Pass is active, so every lesson, exercise and reading practice is open to you for as long as the pass runs.`
    : `Your lifetime access is active, so every lesson, exercise and reading practice is yours to keep, forever.`;
  const footer = monthly
    ? `Expedition Pass: renews monthly, cancel any time. Your progress is kept if you come back.`
    : `One-time payment. Lifetime access.`;

  const bullet = `<span style="color:${C.gold};">&#9670;</span>&nbsp;`;
  const result = await getResend().emails.send({
    from: personalFrom(),
    to: email,
    replyTo: ownerEmail(),
    subject: monthly ? `Thank you, ${displayName}: your Expedition Pass is active 𓂀` : `Thank you, ${displayName}: welcome to the Academy 𓂀`,
    html: emailLayout({
      baseUrl: layoutBase(),
      preheader: access,
      body: `${heading(`Thank you, ${esc(displayName)}`)}
        ${p(`Hi ${esc(greetingName)},`)}
        ${p(thanks)}
        ${p(access)}
        ${p("If anything is confusing, broken, or you just want to say hello, reply to this email. It comes straight to me and I read every one.")}
        ${panel(
          `<p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.8;color:${C.sand};">
            ${strong("What you've unlocked:")}<br/>
            ${bullet}All ${lessonCount} lessons, from the alphabet to pharaohs' names and monumental texts<br/>
            ${bullet}Interactive exercises with instant feedback<br/>
            ${bullet}Reading practices with real inscriptions
          </p>`
        )}
        ${button(dashboardUrl, "Begin Your Studies")}`,
      reason: `You are getting this because you ${monthly ? "picked up the Expedition Pass" : "bought the course"} at learnhieroglyphics.com.<br/>${footer}<br/>${footLink(accountUrl, "Manage your account")}`,
    }),
    text: [
      `Hi ${greetingName},`,
      "",
      thanks,
      "",
      access,
      "",
      "If anything is confusing, broken, or you just want to say hello, reply to this email. It comes straight to me and I read every one.",
      "",
      "Harry",
      "",
      `Begin your studies: ${dashboardUrl}`,
      "",
      `${footer} Manage your account: ${accountUrl}`,
    ].join("\n"),
  });

  if (result.error) {
    console.error("[email:welcome] Resend error:", result.error);
    throw new Error(`Failed to send welcome email: ${result.error.message}`);
  }
  console.log(`[email:welcome] ${plan} welcome email sent to:`, email);
}


/* ── Offer emails ──────────────────────────────────────────────────── */

type OfferEmailInput = {
  name?: string | null;
  email: string;
  code: string;
  expiresAt: Date;
  percentOff: number;
};

/** The footer the offer emails share, after the reason line. */
const OFFER_FOOT = "One-time payment. Lifetime access. No subscription.";

function fmtExpiry(d: Date): string {
  return d.toLocaleString("en-GB", { weekday: "long", hour: "numeric", minute: "2-digit", timeZone: "Europe/London" });
}

/** Sent when the free lesson is completed by someone who hasn't bought. */
export async function sendNextChamberEmail(input: OfferEmailInput): Promise<void> {
  const displayName = input.name || "Scholar";
  const checkoutUrl = `${process.env.NEXTAUTH_URL}/get-started?next=checkout`;
  const result = await getResend().emails.send({
    from: brandFrom(),
    to: input.email,
    subject: `You read your first inscription, ${displayName}. The next chamber is open (${input.percentOff}% off until ${fmtExpiry(input.expiresAt)})`,
    html: emailLayout({
      baseUrl: layoutBase(),
      preheader: `You finished the whole 25-sign alphabet. Here is ${input.percentOff}% off the next chamber.`,
      body: `${heading("The Outer Courtyard awaits")}
        ${p(`${esc(displayName)}, you just finished ${strong("The Expedition Begins")}, the whole 25-sign alphabet.
          Most people never get that far. You can now sound out names, and you are one lesson away from reading real words:
          the animal and plant signs of the Outer Courtyard.`)}
        ${codePanel(`Your ${input.percentOff}% off code`, input.code, `Applied automatically at checkout &middot; expires ${fmtExpiry(input.expiresAt)}`)}
        ${p("Lifetime access unlocks all 8 lessons, the Tomb Wall and Sign Hunt 3D games, your certificate, and everything added later.")}
        ${button(checkoutUrl, "Unlock the next chamber")}`,
      reason: `You are getting this because you finished the free lesson at learnhieroglyphics.com.<br/>${OFFER_FOOT}<br/>${contactLine()}`,
    }),
  });
  if (result.error) console.error("[email:next-chamber] Resend error:", result.error);
}

/** Sent when a Checkout Session expires unpaid. Returns whether Resend accepted it. */
export async function sendCheckoutRecoveryEmail(input: OfferEmailInput): Promise<boolean> {
  const displayName = input.name || "Scholar";
  const checkoutUrl = `${process.env.NEXTAUTH_URL}/get-started?next=checkout`;
  const result = await getResend().emails.send({
    from: brandFrom(),
    to: input.email,
    subject: `Your place in the Academy is still open: ${input.percentOff}% off for 48 hours`,
    tags: [{ name: "checkout", value: "recovery" }],
    html: emailLayout({
      baseUrl: layoutBase(),
      preheader: `Your place in the Academy is still open, with ${input.percentOff}% off for the next two days.`,
      body: `${heading(`Still want in, ${esc(displayName)}?`)}
        ${p(`You started checking out for lifetime access but didn't finish. No problem. If something put you off, just reply and tell me;
          I read every message. And if it was the price, here is ${input.percentOff}% off for the next two days.`)}
        ${codePanel(null, input.code, `Applied automatically at checkout &middot; expires ${fmtExpiry(input.expiresAt)}`)}
        ${p("One payment, all 8 lessons, the 3D games and your certificate, forever. Apple Pay and Google Pay now work at checkout.")}
        ${button(checkoutUrl, "Finish unlocking the Academy")}`,
      reason: `You are getting this because you started a checkout at learnhieroglyphics.com.<br/>${OFFER_FOOT}<br/>${contactLine()}`,
    }),
  });
  if (result.error) {
    console.error("[email:checkout-recovery] Resend error:", result.error);
    return false;
  }
  return true;
}

/**
 * The plain reminder after an unpaid checkout expires (src/lib/checkout-reminder.ts): no discount, just what the plan
 * includes, the guarantee, their own price and a way back. Returns whether Resend accepted it.
 */
export async function sendCheckoutReminderEmail(input: {
  email: string;
  name: string | null | undefined;
  plan: Plan;
  /** what Stripe asked them to pay, e.g. "$13.39"; null leaves the price out */
  price: string | null;
  checkoutUrl: string;
  unsubscribeUrl: string;
}): Promise<boolean> {
  const displayName = esc(input.name || (isLicencePlan(input.plan) ? "Teacher" : "Scholar"));
  const planName = esc(input.plan.name);
  // the guarantee gets its own paragraph below, so it is left out of the list
  const features = input.plan.features.filter((f) => !/guarantee/i.test(f));
  const terms = input.plan.mode === "subscription" ? `Renews each ${input.plan.interval ?? "period"} until you cancel, from your account page.` : "One payment, no subscription.";
  const result = await getResend().emails.send({
    from: brandFrom(),
    to: input.email,
    subject: `Your ${input.plan.name} checkout, with a 14-day money-back guarantee`,
    tags: [{ name: "checkout", value: "reminder" }],
    headers: { "List-Unsubscribe": `<${input.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    html: emailLayout({
      baseUrl: layoutBase(),
      preheader: `What the ${input.plan.name} includes, with a 14-day money-back guarantee.`,
      body: `${heading(`Still thinking it over, ${displayName}?`)}
        ${p(`You got as far as checkout for the ${planName} but didn't finish. No pressure. Here is what it includes, in case it helps you decide.
          If something put you off or didn't work, just reply and tell me; I read every message.`)}
        ${panel(
          `<p style="margin:0 0 12px;font-family:${FONT};font-size:18px;font-weight:600;color:${C.goldLight};">${planName}${input.price ? ` &middot; ${esc(input.price)}` : ""}</p>
          ${features.map((f) => `<p style="margin:0 0 6px;font-family:${FONT};font-size:14px;line-height:1.5;color:${C.sand};"><span style="color:${C.gold};">&#10003;</span>&nbsp; ${esc(f)}</p>`).join("")}
          <p style="margin:12px 0 0;font-family:${FONT};font-size:13px;color:${C.muted};">${esc(terms)}</p>`
        )}
        ${p(`${strong("14-day money-back guarantee.")} If it isn't for you, email us within 14 days for a full refund, no questions asked.
          Card, Apple Pay and Google Pay all work at checkout.`)}
        ${button(input.checkoutUrl, "Return to checkout")}`,
      reason: `You are getting this because you started a checkout at learnhieroglyphics.com.<br/>${contactLine()}`,
      unsubscribeUrl: input.unsubscribeUrl,
    }),
  });
  if (result.error) {
    console.error("[email:checkout-reminder] Resend error:", result.error);
    return false;
  }
  return true;
}
