/**
 * One look for every email the site sends (2026-10-20): the site's obsidian and gold, a band of hieroglyphs
 * across the top and foot (public/email/frieze.png, drawn by scripts/dev/build-email-art.mjs, because mail
 * clients have no font for the signs), the name in Cinzel, and the body inside a double gold frame like the
 * translator's name box.
 *
 * Table layout and inline styles throughout so it holds up in Gmail and Outlook. Cinzel and Open Sans load from
 * Google Fonts where the client allows it (Apple Mail, iOS); elsewhere Georgia and Segoe UI / Helvetica stand in.
 * Hieroglyphs only ever appear inside images.
 */

export const EMAIL_COLORS = {
  page: "#04060d",
  panel: "#12121a",
  card: "#1a1a26",
  line: "#2e2a1c",
  frame: "#6b5520",
  gold: "#d4a832",
  goldLight: "#e8c460",
  goldDeep: "#b8892a",
  sand: "#f0e8d8",
  muted: "#b09070",
  faint: "#7a6a58",
  ink: "#1a1408",
} as const;

const C = EMAIL_COLORS;
export const BODY_FONT = "'Open Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
export const DISPLAY_FONT = "'Cinzel', Georgia, 'Times New Roman', serif";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── building blocks ─────────────────────────────────────────────────────────

export function paragraph(html: string, opts: { size?: number; color?: string; align?: "left" | "center" } = {}): string {
  return `<p style="margin:0 0 16px;font-family:${BODY_FONT};font-size:${opts.size ?? 16}px;line-height:1.65;color:${opts.color ?? C.sand};${opts.align ? `text-align:${opts.align};` : ""}">${html}</p>`;
}

export function link(href: string, label: string): string {
  return `<a href="${href}" style="color:${C.goldLight};text-decoration:underline;">${label}</a>`;
}

/** Small gold capitals above a heading. */
export function eyebrow(text: string): string {
  return `<p style="margin:0 0 12px;font-family:${BODY_FONT};font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${C.gold};">${text}</p>`;
}

export function heading(html: string): string {
  return `<h1 style="margin:0 0 20px;font-family:${DISPLAY_FONT};font-size:28px;line-height:1.3;font-weight:600;letter-spacing:0.5px;color:${C.sand};">${html}</h1>`;
}

export function subheading(html: string): string {
  return `<h2 style="margin:28px 0 12px;font-family:${DISPLAY_FONT};font-size:19px;line-height:1.35;font-weight:600;color:${C.goldLight};">${html}</h2>`;
}

/** Bulletproof button: a table cell, so Outlook draws the background; a gold gradient where the client allows it. */
export function button(href: string, label: string, opts: { secondary?: boolean; center?: boolean } = {}): string {
  const cell = opts.secondary
    ? `style="border:1px solid ${C.gold};border-radius:3px;"`
    : `bgcolor="${C.gold}" style="border-radius:3px;background:${C.gold};background-image:linear-gradient(180deg,${C.goldLight} 0%,${C.gold} 55%,${C.goldDeep} 100%);box-shadow:0 6px 18px -8px rgba(212,168,50,0.7);"`;
  const color = opts.secondary ? C.goldLight : C.ink;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ${opts.center ? 'align="center" ' : ""}style="margin:10px ${opts.center ? "auto" : "0"} 26px;">
  <tr><td ${cell}>
    <a href="${href}" style="display:inline-block;padding:15px 32px;font-family:${BODY_FONT};font-size:14px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${color};text-decoration:none;border-radius:3px;">${label}</a>
  </td></tr></table>`;
}

/** A boxed panel (dashed gold for a code or an offer). */
export function panel(inner: string, opts: { dashed?: boolean; center?: boolean } = {}): string {
  const border = opts.dashed ? `1px dashed ${C.gold}` : `1px solid ${C.line}`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;">
  <tr><td ${opts.center ? 'align="center" ' : ""}style="background:${C.card};border:${border};border-left:${opts.dashed ? border : `3px solid ${C.gold}`};border-radius:4px;padding:20px 22px;">${inner}</td></tr></table>`;
}

/** A thin gold rule with a diamond in the middle, between sections. */
export function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
  <tr>
    <td width="45%" style="border-top:1px solid ${C.frame};font-size:0;line-height:0;">&nbsp;</td>
    <td width="10%" align="center" style="font-family:${BODY_FONT};font-size:10px;line-height:10px;color:${C.gold};">&#9670;</td>
    <td width="45%" style="border-top:1px solid ${C.frame};font-size:0;line-height:0;">&nbsp;</td>
  </tr></table>`;
}

/** A full-width picture row above the framed body (pass to `hero`). */
export function heroImage(src: string, alt: string, href?: string): string {
  const img = `<img src="${src}" width="600" alt="${esc(alt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;">`;
  return `<tr><td style="padding:0 24px 20px;">${href ? `<a href="${href}">${img}</a>` : img}</td></tr>`;
}

/** The team sign-off. */
export function signature(line = "Learn AEO &middot; just reply, we read every email"): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
  <tr>
    <td valign="middle" style="padding-right:12px;"><div style="width:40px;height:2px;background:${C.gold};font-size:0;line-height:0;">&nbsp;</div></td>
    <td valign="middle" style="font-family:${DISPLAY_FONT};font-size:18px;font-weight:600;color:${C.sand};">The Learn AEO team</td>
  </tr>
  <tr><td></td><td style="padding-top:4px;font-family:${BODY_FONT};font-size:13px;line-height:1.5;color:${C.muted};">${line}</td></tr>
  </table>`;
}

// ── the document ────────────────────────────────────────────────────────────

export type EmailLayoutOptions = {
  /** Absolute site origin, for the frieze, the mark and the header link. */
  baseUrl: string;
  /** The grey line inboxes show after the subject. */
  preheader: string;
  /** Rows from heroImage(), shown between the header and the framed body. */
  hero?: string;
  body: string;
  /** The team sign-off under the body (default on); a string replaces its second line. */
  signature?: boolean | string;
  /** Why they got it, in the footer (plain text or simple HTML). */
  reason: string;
  unsubscribeUrl?: string;
};

export function emailLayout(o: EmailLayoutOptions): string {
  const sig = o.signature === false ? "" : signature(typeof o.signature === "string" ? o.signature : undefined);
  const frieze = `<img src="${o.baseUrl}/email/frieze.png" width="600" height="36" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;">`;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&amp;family=Open+Sans:wght@400;600;700&amp;display=swap" rel="stylesheet">
<style>@media (max-width:620px){.wrap{width:100%!important}.pad{padding:28px 20px!important}.frame{padding:3px!important}}</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.page};">${esc(o.preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page};">
<tr><td align="center" style="padding:24px 10px 32px;">
  <table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="width:600px;max-width:600px;background:${C.panel};">
    <tr><td style="padding:0;">${frieze}</td></tr>
    <tr><td align="center" style="padding:22px 24px 20px;">
      <a href="${o.baseUrl}" style="text-decoration:none;">
        <img src="${o.baseUrl}/email/mark.png" width="36" height="36" alt="" style="display:block;margin:0 auto 10px;border:0;">
        <span style="font-family:${DISPLAY_FONT};font-size:15px;font-weight:600;letter-spacing:5px;text-transform:uppercase;color:${C.gold};">Learn AEO</span>
      </a>
    </td></tr>
    ${o.hero ?? ""}
    <tr><td class="frame" style="padding:0 24px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.frame};">
        <tr><td style="padding:4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.line};background:${C.panel};">
            <tr><td class="pad" style="padding:36px 36px 32px;">${o.body}${sig}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:0;">${frieze}</td></tr>
    <tr><td align="center" style="padding:18px 32px 22px;font-family:${BODY_FONT};font-size:12px;line-height:1.7;color:${C.faint};">
      ${o.reason}${o.unsubscribeUrl ? `<br><a href="${o.unsubscribeUrl}" style="color:${C.faint};text-decoration:underline;">Unsubscribe</a>` : ""}
      <br><a href="${o.baseUrl}" style="color:${C.muted};text-decoration:none;letter-spacing:1px;">learnaeo.com</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

/**
 * "Learn AEO <addr>" for sign-in links, receipts and other site emails. The bare address showed up in
 * inboxes as just "hello". Left alone when the env already carries a display name.
 */
export function brandFrom(): string {
  const raw = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  return raw.includes("<") ? raw : `Learn AEO <${raw}>`;
}
