/**
 * One follow-up to a teacher who asked for the worksheet by email (EmailLead source "worksheet"): a few days
 * later, an invitation to run the live class quiz free for 7 days. Sent once per lead by the daily cron
 * (src/lib/worksheet-followup-run.ts), in the same look as the worksheet email (src/lib/worksheet-email.ts):
 * no prices, no hieroglyphs in the text, opt-out by replying "no more".
 *
 * Pure rules and the email here (tested); the send is in worksheet-followup-run.ts.
 */
import { button, emailLayout, heading, link, paragraph } from "@/lib/email-layout";

/** Days after the worksheet email, so the lesson has had a chance to happen. */
export const FOLLOWUP_DAY = 3;
/** Older leads are left alone: past this, the trial reads as cold mail. */
export const FOLLOWUP_LAST_DAY = 30;

/**
 * Leads from before this date were told "I will write again only when a new worksheet is ready", so they
 * never get this email. Set it to the day the new worksheet-email footer (which mentions the follow-up) went live.
 */
export const FOLLOWUP_FROM = new Date("2026-10-16T00:00:00Z");

/** EmailLead source that marks a lead as sent (the unique email+source pair stops a second send). */
export const FOLLOWUP_SENT_SOURCE = "worksheet-followup";
/** EmailLead source for a lead who replied "no more": add a row by hand and no further email goes to them. */
export const OPTED_OUT_SOURCE = "no-more";

const DAY_MS = 86_400_000;

export type FollowUpLead = { email: string; createdAt: Date };

export type FollowUpContext = {
  /** emails already sent the follow-up */
  sent: Set<string>;
  /** emails that asked for no more mail (a "no-more" lead row, or an account that unsubscribed) */
  optedOut: Set<string>;
  /** emails whose account holds any licence or trial already: nothing to offer */
  hasLicence: Set<string>;
};

export function followUpDue(lead: FollowUpLead, ctx: FollowUpContext, now = new Date(), opts: { includeEarlier?: boolean } = {}): boolean {
  const email = lead.email.toLowerCase();
  if (ctx.sent.has(email) || ctx.optedOut.has(email) || ctx.hasLicence.has(email)) return false;
  if (!opts.includeEarlier && lead.createdAt < FOLLOWUP_FROM) return false;
  const age = now.getTime() - lead.createdAt.getTime();
  return age >= FOLLOWUP_DAY * DAY_MS && age <= FOLLOWUP_LAST_DAY * DAY_MS;
}

/** The leads due today, one per address. */
export function selectFollowUps(leads: FollowUpLead[], ctx: FollowUpContext, now = new Date(), opts: { includeEarlier?: boolean } = {}): FollowUpLead[] {
  const seen = new Set<string>();
  return leads.filter((l) => {
    const email = l.email.toLowerCase();
    if (seen.has(email) || !followUpDue(l, ctx, now, opts)) return false;
    seen.add(email);
    return true;
  });
}

export type FollowUpEmail = { subject: string; html: string; text: string };

/** utm_source on every link, so clicks show on /admin/marketing and in GA4. */
export const FOLLOWUP_UTM_SOURCE = "worksheet-email";
export const FOLLOWUP_UTM_CAMPAIGN = "worksheet-trial";

export function renderFollowUpEmail(baseUrl: string): FollowUpEmail {
  const base = baseUrl.replace(/\/$/, "");
  const tagged = (path: string) => {
    const [p, query = ""] = path.split("?");
    return `${base}${p}?${query ? `${query}&` : ""}utm_source=${FOLLOWUP_UTM_SOURCE}&utm_medium=email&utm_campaign=${FOLLOWUP_UTM_CAMPAIGN}`;
  };
  // ?trial=1: a signed-in teacher's trial starts on arrival; anyone else signs in first and comes back to it
  const trialUrl = tagged("/teachers/class?trial=1");
  const guideUrl = tagged("/teachers/class/guide");

  const p = (html: string) => paragraph(html);
  const a = link;

  const body = [
    heading("Try the live class quiz free for a week"),
    p("I hope the hieroglyphs lesson went well. If your class enjoyed writing their names, the live quiz is a good way to see what stuck."),
    p("Put a room code on the whiteboard and teams join from any phone or tablet with a team name. There are ten questions on the alphabet signs and royal cartouches, with a countdown, sound and a podium at the end. It takes about eight minutes and pupils need no accounts."),
    button(trialUrl, "Start the free 7-day trial"),
    p(`No card is needed, and nothing is charged when the week ends. There is a ${a(guideUrl, "one-page guide")} to running a session, if you want it beside you.`),
    p("If the class wants more afterwards, the Classroom licence keeps the quiz open for a year and gives you and 30 pupils the full course, with their progress on one page."),
  ].join("");

  const html = emailLayout({
    baseUrl: base,
    preheader: "Ten questions on the whiteboard, teams on any phone, no pupil accounts.",
    body,
    signature: "Founder, Learn Hieroglyphics. Reply and tell me how the lesson went: I read every email.",
    reason:
      'You asked for the worksheet at learnhieroglyphics.com. This is the one follow-up I mentioned; after it I will write only when a new worksheet is ready. Reply with "no more" and I will not email you again.',
  });

  const text = [
    "I hope the hieroglyphs lesson went well. If your class enjoyed writing their names, the live quiz is a good way to see what stuck.",
    "Put a room code on the whiteboard and teams join from any phone or tablet with a team name. Ten questions on the alphabet signs and royal cartouches, with a countdown, sound and a podium at the end. About eight minutes; pupils need no accounts.",
    `Start the free 7-day trial: ${trialUrl}`,
    `No card is needed, and nothing is charged when the week ends. One-page guide to running a session: ${guideUrl}`,
    "If the class wants more afterwards, the Classroom licence keeps the quiz open for a year and gives you and 30 pupils the full course, with their progress on one page.",
    "Harry\nFounder, Learn Hieroglyphics (reply and tell me how the lesson went)",
    'You asked for the worksheet at learnhieroglyphics.com. This is the one follow-up I mentioned; after it I will write only when a new worksheet is ready. Reply with "no more" and I will not email you again.',
  ].join("\n\n");

  return { subject: "Your class vs. the hieroglyphs: a free week of the live quiz", html, text };
}
