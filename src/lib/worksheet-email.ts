/**
 * The email a teacher asks for on /teachers/worksheet: the worksheet, the 50-minute lesson plan and the
 * live class quiz, with the Classroom licence mentioned once at the end. Sent by /api/worksheet-email.
 *
 * As in the nurture emails (src/lib/nurture-emails.ts): no prices (they differ by country, so the email
 * links to the page that shows the reader's own), and no hieroglyphs in the text (most mail clients have
 * no font for them).
 */

import { BODY_FONT, EMAIL_COLORS, emailLayout, heading, link, paragraph } from "@/lib/email-layout";

export type WorksheetEmail = { subject: string; html: string; text: string };

/** utm_source on every link, so clicks show on /admin/marketing and in GA4. */
export const WORKSHEET_EMAIL_SOURCE = "worksheet-email";

const C = EMAIL_COLORS;

export function renderWorksheetEmail(baseUrl: string): WorksheetEmail {
  const base = baseUrl.replace(/\/$/, "");
  const tagged = (path: string) => {
    const [p, hash = ""] = path.split("#");
    return `${base}${p}?utm_source=${WORKSHEET_EMAIL_SOURCE}&utm_medium=email&utm_campaign=worksheet${hash ? `#${hash}` : ""}`;
  };
  const worksheetUrl = tagged("/teachers/worksheet");
  const planUrl = tagged("/teachers");
  const quizUrl = tagged("/teachers/class");
  const guideUrl = tagged("/teachers/class/guide");
  const translatorUrl = tagged("/translate-name-to-hieroglyphics");
  const licenceUrl = tagged("/pricing#teachers");

  const p = (html: string) => paragraph(html);
  const a = link;
  const item = (href: string, title: string, line: string) =>
    `<tr><td style="padding:0 0 18px;font-family:${BODY_FONT};">
      <a href="${href}" style="font-size:17px;font-weight:600;color:${C.goldLight};text-decoration:none;">${title}</a>
      <div style="margin-top:3px;font-size:15px;line-height:1.55;color:${C.muted};">${line}</div>
    </td></tr>`;

  const body = `${heading("Your hieroglyphics lesson, ready to print")}
      ${p("Here is everything for a 50-minute lesson on writing names in hieroglyphs. All of it is free to copy for your class.")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 6px;">
        ${item(worksheetUrl, "The worksheet", "Three A4 pages: the alphabet chart, four activities and your answer key. Open it and press Print, or save it as a PDF.")}
        ${item(planUrl, "The 50-minute lesson plan", "Starter, main activity and plenary, timed, with an extension for fast finishers.")}
        ${item(quizUrl, "A live class quiz", `Free for 7 days, then with a Classroom licence: open a room on the whiteboard, and pupils join from any device with a team name. No pupil accounts. There is a ${a(guideUrl, "one-page guide")} to running it.`)}
        ${item(translatorUrl, "The name translator", "For the starter: type a volunteer's name and the class works out the rules from what appears.")}
      </table>
      ${p(`If the lesson goes well and you want the class to carry on, a ${a(licenceUrl, "Classroom licence")} gives you and 30 pupils the full course, with their progress on one page.`)}`;

  const html = emailLayout({
    baseUrl: base,
    preheader: "Everything for a 50-minute lesson on writing names in hieroglyphs, free to copy for your class.",
    body,
    signature: "Founder, Learn Hieroglyphics. Reply if anything in the lesson does not work for your class: I read every email.",
    reason:
      'You asked for this on the worksheet page at learnhieroglyphics.com. I will write once more in a few days, about trying the live class quiz free, and after that only when a new worksheet is ready. Reply with "no more" and I will not email you again.',
  });

  const text = [
    "Here is everything for a 50-minute lesson on writing names in hieroglyphs. All of it is free to copy for your class.",
    `The worksheet (three A4 pages: alphabet chart, activities, answer key): ${worksheetUrl}`,
    `The 50-minute lesson plan: ${planUrl}`,
    `A live class quiz (free for 7 days, then with a Classroom licence; pupils need no accounts): ${quizUrl}\nOne-page guide: ${guideUrl}`,
    `The name translator, for the starter: ${translatorUrl}`,
    `If you want the class to carry on, a Classroom licence gives you and 30 pupils the full course: ${licenceUrl}`,
    "Harry\nFounder, Learn Hieroglyphics (reply if anything does not work for your class)",
    'You asked for this on the worksheet page. I will write once more in a few days, about trying the live class quiz free, and after that only when a new worksheet is ready. Reply with "no more" and I will not email you again.',
  ].join("\n\n");

  return { subject: "Your hieroglyphics worksheet and lesson plan", html, text };
}
