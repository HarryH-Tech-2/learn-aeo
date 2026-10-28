import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { lessonsIncludedLine, type Plan } from "@/lib/plans";
import { FIRST_LESSON_ID, LESSON_CATALOG, lessonMeta, lessonPath, nextLessonMeta, titleMidSentence } from "@/lib/lesson-catalog";
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

/** "Learn AEO <addr>" unless the env already carries a display name. */
function personalFrom(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Learn AEO <${raw}>`;
}

/** The origin the shared layout draws its header image, mark and header link from. */
function layoutBase(): string {
  return (process.env.NEXTAUTH_URL ?? SITE.url).replace(/\/$/, "");
}

/** Gold emphasis inside a paragraph. */
function strong(html: string): string {
  return `<strong style="color:${C.goldLight};">${html}</strong>`;
}

/** A link styled for the small footer line. */
function footLink(href: string, label: string): string {
  return `<a href="${href}" style="color:${C.faint};text-decoration:underline;">${label}</a>`;
}

/** "Learn AEO · <contact link>", the line the old emails closed with. */
function contactLine(label = "Reply to this email with any question"): string {
  return `Learn AEO &middot; ${footLink(`${process.env.NEXTAUTH_URL}/contact`, label)}`;
}

/** A dashed, centered box holding a code: small label, the code, a muted line under it. */
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
 * Sent by the Stripe webhook after a Lifetime or Monthly purchase. Opens with a short
 * thank-you from the Learn AEO team; replies go to the owner inbox (CONTACT_TO_EMAIL, see notify.ts).
 */
export async function sendWelcomeEmail(
  name: string | null | undefined,
  email: string,
  plan: WelcomePlan = "lifetime"
): Promise<void> {
  const displayName = name?.trim() || null;
  const greetingName = displayName?.split(/\s+/)[0] || "there";
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;
  const accountUrl = `${process.env.NEXTAUTH_URL}/account`;
  const firstTitle = titleMidSentence(LESSON_CATALOG[0].title);
  const lastTitle = titleMidSentence(LESSON_CATALOG[LESSON_CATALOG.length - 1].title);
  const monthly = plan === "monthly";

  const thanks = monthly
    ? `Thank you for starting the monthly plan. It genuinely means a lot: Learn AEO is a small independent team, and every subscriber helps keep it going.`
    : `Thank you for buying the course. It genuinely means a lot: Learn AEO is a small independent team, and every purchase helps keep it going.`;
  const access = monthly
    ? `Your monthly plan is active, so every lesson is open to you for as long as it runs, including new ones as they are released.`
    : `Your lifetime access is active, so every lesson is yours to keep, forever, including new ones as they are released.`;
  const footer = monthly
    ? `Monthly plan: renews monthly, cancel any time. Your progress is kept if you come back.`
    : `One-time payment. Lifetime access.`;

  const bullet = `<span style="color:${C.gold};">&#9670;</span>&nbsp;`;
  const result = await getResend().emails.send({
    from: personalFrom(),
    to: email,
    replyTo: ownerEmail(),
    subject: `Thank you${displayName ? `, ${displayName}` : ""}: ${monthly ? "your monthly plan is active" : "welcome to Learn AEO"}`,
    html: emailLayout({
      baseUrl: layoutBase(),
      preheader: access,
      body: `${heading(displayName ? `Thank you, ${esc(displayName)}` : "Thank you")}
        ${p(`Hi ${esc(greetingName)},`)}
        ${p(thanks)}
        ${p(access)}
        ${p("If anything is confusing, broken, or you just want to say hello, reply to this email. It comes straight to me and I read every one.")}
        ${panel(
          `<p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.8;color:${C.sand};">
            ${strong("What you've unlocked:")}<br/>
            ${bullet}${esc(lessonsIncludedLine())}, from ${esc(firstTitle)} to ${esc(lastTitle)}<br/>
            ${bullet}Quick checks and hands-on exercises with instant feedback<br/>
            ${bullet}A certificate when you finish
          </p>`
        )}
        ${button(dashboardUrl, "Go to your dashboard")}`,
      reason: `You are getting this because you ${monthly ? "started the monthly plan" : "bought the course"} at learnaeo.com.<br/>${footer}<br/>${footLink(accountUrl, "Manage your account")}`,
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
      "The Learn AEO team",
      "",
      `Go to your dashboard: ${dashboardUrl}`,
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

/** First name for a greeting, or null when there is none. */
function firstNameOf(name: string | null | undefined): string | null {
  return name?.trim().split(/\s+/)[0] || null;
}

/**
 * Sent when a learner who hasn't bought passes a lesson (today only the free one, from
 * src/app/api/progress/complete/route.ts): names the lesson they passed and the next district,
 * with their offer code. `lessonId` is the lesson passed; it defaults to the first lesson.
 */
export async function sendLessonCompleteEmail(input: OfferEmailInput & { lessonId?: string }): Promise<void> {
  const first = firstNameOf(input.name);
  const base = process.env.NEXTAUTH_URL;
  const passed = lessonMeta(input.lessonId ?? FIRST_LESSON_ID) ?? LESSON_CATALOG[0];
  const next = nextLessonMeta(passed.id);
  const checkoutUrl = `${base}/get-started?next=checkout`;
  const nextUrl = next ? `${base}${lessonPath(next.id)}` : `${base}/pricing`;
  const expiry = fmtExpiry(input.expiresAt);
  const nextLine = next
    ? `Next is ${strong(esc(next.district))}: ${esc(next.title)}. ${esc(next.summary)}${next.status === "coming-soon" ? " It is coming soon, and included when it opens." : ""}`
    : "That was the last district, so the whole course is behind you.";
  const result = await getResend().emails.send({
    from: brandFrom(),
    to: input.email,
    subject: `You passed ${passed.title}${next ? `. Next: ${next.district}` : ""} (${input.percentOff}% off until ${expiry})`,
    html: emailLayout({
      baseUrl: layoutBase(),
      preheader: `You passed ${passed.district}. Here is ${input.percentOff}% off the rest of the course.`,
      body: `${heading(next ? `${esc(next.district)} is next` : "You finished the course")}
        ${p(`${first ? `${esc(first)}, you` : "You"} passed ${strong(`${esc(passed.district)}: ${esc(passed.title)}`)}.`)}
        ${p(nextLine)}
        ${codePanel(`Your ${input.percentOff}% off code`, input.code, `Applied automatically at checkout &middot; expires ${expiry}`)}
        ${p("Lifetime access opens every lesson, including each new one as it is released, and your certificate when you finish.")}
        ${button(checkoutUrl, next ? `Unlock ${esc(next.district)}` : "Unlock the course")}
        ${p(link(nextUrl, next ? `See what ${esc(next.district)} covers` : "See the plans"), { size: 14 })}`,
      reason: `You are getting this because you passed a lesson at learnaeo.com.<br/>${OFFER_FOOT}<br/>${contactLine()}`,
    }),
  });
  if (result.error) console.error("[email:lesson-complete] Resend error:", result.error);
}

/** Sent when a Checkout Session expires unpaid. Returns whether Resend accepted it. */
export async function sendCheckoutRecoveryEmail(input: OfferEmailInput): Promise<boolean> {
  const first = firstNameOf(input.name);
  const checkoutUrl = `${process.env.NEXTAUTH_URL}/get-started?next=checkout`;
  const result = await getResend().emails.send({
    from: brandFrom(),
    to: input.email,
    subject: `Your place in Learn AEO is still open: ${input.percentOff}% off for 48 hours`,
    tags: [{ name: "checkout", value: "recovery" }],
    html: emailLayout({
      baseUrl: layoutBase(),
      preheader: `Your place in Learn AEO is still open, with ${input.percentOff}% off for the next two days.`,
      body: `${heading(first ? `Still want in, ${esc(first)}?` : "Still want in?")}
        ${p(`You started checking out for lifetime access but didn't finish. No problem. If something put you off, just reply and tell me;
          I read every message. And if it was the price, here is ${input.percentOff}% off for the next two days.`)}
        ${codePanel(null, input.code, `Applied automatically at checkout &middot; expires ${fmtExpiry(input.expiresAt)}`)}
        ${p("One payment opens every lesson, including each new one as it is released, and your certificate when you finish.")}
        ${button(checkoutUrl, "Finish checking out")}`,
      reason: `You are getting this because you started a checkout at learnaeo.com.<br/>${OFFER_FOOT}<br/>${contactLine()}`,
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
  const displayName = esc(input.name || "there");
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
        ${p(`${strong("14-day money-back guarantee.")} If it isn't for you, email us within 14 days for a full refund.
          Card, Apple Pay and Google Pay all work at checkout.`)}
        ${button(input.checkoutUrl, "Return to checkout")}`,
      reason: `You are getting this because you started a checkout at learnaeo.com.<br/>${contactLine()}`,
      unsubscribeUrl: input.unsubscribeUrl,
    }),
  });
  if (result.error) {
    console.error("[email:checkout-reminder] Resend error:", result.error);
    return false;
  }
  return true;
}
