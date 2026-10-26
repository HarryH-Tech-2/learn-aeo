/**
 * The Ancient Egypt Writing Unit's two emails (server only):
 *   - the bought unit, PDF attached (webhook, lead source "unit-pack")
 *   - the free sample, Lesson 1, PDF attached (the sample box, lead source "unit-pack-sample")
 * In the shared email look (src/lib/email-layout.ts), from Harry, replies to the owner's inbox.
 * No hieroglyphs in the text: most mail clients have no font for them.
 */
import { Resend } from "resend";
import { ownerEmail } from "@/lib/notify";
import { button, emailLayout, heading, link, paragraph } from "@/lib/email-layout";
import { UNIT_PACK, UNIT_PACK_PAGE, unitPackFilename, type Paper } from "@/lib/unit-pack/product";

const SITE = () => process.env.NEXTAUTH_URL || "https://www.learnhieroglyphics.com";

function fromAddress(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Harry from Learn Hieroglyphics <${raw}>`;
}

/** The shared layout, with these emails' footer line and Harry's sign-off. */
function layout(o: { preheader: string; body: string }): string {
  return emailLayout({
    baseUrl: SITE().replace(/\/$/, ""),
    preheader: o.preheader,
    body: o.body,
    signature: "Founder, Learn Hieroglyphics",
    reason: "Learn Hieroglyphics &middot; reply to this email with any question, it comes straight to me.",
  });
}

const p = (html: string) => paragraph(html);
const paperLabel = (paper: Paper) => (paper === "letter" ? "US Letter" : "A4");

/** Pure: the bought unit's email, for the webhook and its test. */
export function renderUnitPackEmail(input: { paper: Paper; downloadUrl: string; otherPaperUrl: string }) {
  const site = SITE();
  const classUrl = `${site}/teachers/class`;
  const body = [
    heading("Your Ancient Egypt Writing Unit"),
    p(`Thank you for buying the unit. The PDF is attached (${paperLabel(input.paper)}): five lesson plans with timings and teacher prompts, a worksheet for every lesson, the end-of-unit quiz and the answer key at the back.`),
    p("If the attachment goes missing, or you would rather print on the other paper size, these links build it again:"),
    button(input.downloadUrl, `Download (${paperLabel(input.paper)})`, { center: true }),
    button(input.otherPaperUrl, `Download (${paperLabel(input.paper === "letter" ? "a4" : "letter")})`, { secondary: true, center: true }),
    p(`Lesson 5 ends with a live class quiz on the whiteboard; it is free to try for 7 days: ${link(classUrl, classUrl.replace(/^https?:\/\//, ""))}.`),
    p("If anything in a lesson does not work for your class, reply and tell me: I read every email and I will fix it."),
  ].join("");
  const html = layout({ preheader: `Your ${UNIT_PACK.name} is attached as a PDF.`, body });
  const text = [
    `Thank you for buying the ${UNIT_PACK.name}. The PDF (${paperLabel(input.paper)}) is attached: five lesson plans, a worksheet for every lesson, the end-of-unit quiz and the answer key.`,
    `If the attachment goes missing: ${input.downloadUrl}`,
    `The other paper size: ${input.otherPaperUrl}`,
    `The live class quiz for Lesson 5, free for 7 days: ${classUrl}`,
    "If anything does not work for your class, reply and tell me.\n\nHarry",
  ].join("\n\n");
  return { subject: `Your ${UNIT_PACK.name} (PDF attached)`, html, text };
}

/** Pure: the free sample's email. */
export function renderUnitPackSampleEmail(input: { paper: Paper; price: string }) {
  const site = SITE();
  const pageUrl = `${site}${UNIT_PACK_PAGE}?utm_source=unit-pack-sample&utm_medium=email&utm_campaign=unit-pack`;
  const body = [
    heading("Lesson 1, ready to teach"),
    p(`Here is the free sample of the ${UNIT_PACK.name}, attached: Lesson 1, what hieroglyphs are and how the Rosetta Stone let us read them again, with the teacher plan, the pupil worksheet and the answers.`),
    p(`The full unit carries the class on for four more lessons: writing their names in a cartouche, reading Tutankhamun's and Cleopatra's cartouches, real Egyptian words, and an end-of-unit quiz with a creative task. It is ${input.price}, one PDF, yours to keep.`),
    button(pageUrl, "See the full unit", { center: true }),
  ].join("");
  const html = layout({ preheader: "Lesson 1 of the unit, with the teacher plan, the pupil worksheet and the answers.", body });
  const text = [
    `Here is the free sample of the ${UNIT_PACK.name} (attached): Lesson 1, with the teacher plan, the pupil worksheet and the answers.`,
    `The full unit has four more lessons, an end-of-unit quiz and a creative task, ${input.price}: ${pageUrl}`,
    "Harry",
  ].join("\n\n");
  return { subject: "Your free hieroglyphs lesson: Lesson 1 of the Ancient Egypt Writing Unit", html, text };
}

async function send(to: string, mail: { subject: string; html: string; text: string }, pdf: Uint8Array, filename: string, tag: { name: string; value: string }) {
  const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: fromAddress(),
    to,
    replyTo: ownerEmail(),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: [{ filename, content: Buffer.from(pdf) }],
    tags: [tag],
  });
  if (result.error) throw new Error(`Resend: ${result.error.message}`);
}

export async function sendUnitPackEmail(to: string, pdf: Uint8Array, input: { paper: Paper; downloadUrl: string; otherPaperUrl: string }) {
  await send(to, renderUnitPackEmail(input), pdf, unitPackFilename(input.paper), { name: "purchase", value: UNIT_PACK.id });
}

export async function sendUnitPackSampleEmail(to: string, pdf: Uint8Array, input: { paper: Paper; price: string }) {
  await send(to, renderUnitPackSampleEmail(input), pdf, unitPackFilename(input.paper, true), { name: "lead", value: "unit-pack-sample" });
}
