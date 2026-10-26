import { NextResponse } from "next/server";
import { recordLead, isValidEmail, normaliseEmail } from "@/lib/leads";
import { notifyOwner } from "@/lib/notify";
import { prisma } from "@/lib/db";
import { allowSend, clientIp } from "@/lib/send-limit";
import { cleanText, isKeyboardStyle, isKeyboardTemplate, keyboardStyleById } from "@/lib/keyboard-card";
import { renderKeyboardJpeg } from "@/lib/keyboard-image";
import { sendKeyboardKeepEmail } from "@/lib/keyboard-email";
import { nameDripJoinUrl } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/keyboard-image/email  { email, keys, style, template, spell?, letters?, updates? }  (spell "name": the translator, lead source "cartouche")
 * "Email it to me" on the keyboard: the share-size picture on the chosen finish, sent to the visitor, who is
 * kept as a lead (EmailLead source "keyboard"). The picture is drawn here from the keys, so nothing but
 * letters on our own card can be sent. `updates: true` (the tick box, never ticked for them) also records the
 * "Christmas prints are open" opt-in (src/lib/gift-updates.ts).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!isValidEmail(body?.email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const spell = body?.spell === "name" ? "name" : "keys";
  const typed = cleanText(typeof body?.keys === "string" ? body.keys : "", spell);
  if (typed.length === 0) return NextResponse.json({ error: "Type something on the wall first" }, { status: 400 });
  const style = isKeyboardStyle(body?.style) ? body.style : "plain";
  const template = isKeyboardTemplate(body?.template) ? body.template : "none";
  const letters = body?.letters === true;
  const to = normaliseEmail(body.email);

  // Anyone can type any address here, so cap it: 6 an hour from one visitor, 3 a day to one inbox.
  if (!allowSend(`ip:${clientIp(request)}`, 6, 60 * 60 * 1000) || !allowSend(`to:${to}`, 3, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "That's a few already. Please try again later." }, { status: 429 });
  }

  const source = spell === "name" ? "cartouche" : "keyboard";
  // The owner hears about a new lead once, not on every picture they send themselves.
  const known = await prisma.emailLead
    .findUnique({ where: { email_source: { email: to, source } }, select: { id: true } })
    .catch(() => null);

  // A name from the translator is a "cartouche" lead, as the translator's older email box was.
  await recordLead({ email: to, source, name: typed.join("").trim().slice(0, 60) });
  if (body?.updates === true) await recordLead({ email: to, source: "gift-updates", name: typed.join("").trim().slice(0, 60) });
  // On a name the same box also asks for the three-email follow-up (src/lib/name-drip.ts).
  if (body?.updates === true && spell === "name") await recordLead({ email: to, source: "name-drip", name: typed.join("").trim().slice(0, 60) });
  if (!known) void notifyOwner({
    subject: `${spell === "name" ? "Translator" : "Keyboard"} lead: ${to}`,
    text: `${to} asked for their ${spell === "name" ? "name" : "keyboard"} picture by email: "${typed.join("").trim()}" on ${keyboardStyleById(style).label}${template !== "none" ? ` (${template} card)` : ""}.${body?.updates === true ? (spell === "name" ? " Opted in to the name follow-up and the Christmas prints email." : " Opted in to the Christmas prints email.") : ""}`,
    replyTo: to,
  });

  try {
    const file = await renderKeyboardJpeg(typed, style, template, "share", spell, letters);
    // A name sent without the box ticked: offer the follow-up once more, as a one-click link in the email itself.
    const joinUrl = spell === "name" && body?.updates !== true ? nameDripJoinUrl(to, typed.join("").trim()) : undefined;
    await sendKeyboardKeepEmail(to, { typed, style, template, spell, letters }, file, { joinUrl });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[keyboard-image:email] failed:", err);
    return NextResponse.json({ error: "Could not send the email" }, { status: 500 });
  }
}
