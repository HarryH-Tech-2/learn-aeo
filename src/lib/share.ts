/**
 * Shareable cartouche links and the embeddable translator.
 *
 * A share link is /translate-name-to-hieroglyphics/<name>. The page renders
 * the translator with that name already written, carries a social-preview
 * image (/cartouche-image?name=…) and is noindex with a canonical back to the
 * translator, so the names never bloat the index. Everything here is pure so
 * it can be unit-tested; the components import from it.
 */

export const SITE_ORIGIN = "https://www.learnhieroglyphics.com";
export const TRANSLATOR_PATH = "/translate-name-to-hieroglyphics";
export const EMBED_PATH = "/embed/cartouche";
export const OG_IMAGE_PATH = "/cartouche-image";

/** Same ceiling as the translator input's maxLength. */
export const MAX_SHARE_NAME_LENGTH = 30;

// Letters from any script, combining marks, spaces, hyphens and apostrophes.
// Must start with a letter. Nothing that could smuggle markup into a title.
const NAME_RE = /^\p{L}[\p{L}\p{M}' \-]*$/u;

/**
 * Turn a raw path segment or query value into a display-safe name, or null if
 * it isn't one. Decodes percent-encoding, trims and collapses whitespace.
 */
export function normaliseShareName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw;
  try {
    s = decodeURIComponent(raw);
  } catch {
    return null;
  }
  s = s.replace(/\+/g, " ").replace(/\s+/g, " ").trim();
  if (s.length === 0 || s.length > MAX_SHARE_NAME_LENGTH) return null;
  if (!NAME_RE.test(s)) return null;
  return s;
}

export function cartoucheSharePath(name: string): string {
  return `${TRANSLATOR_PATH}/${encodeURIComponent(name.trim())}`;
}

export function cartoucheShareUrl(name: string): string {
  return SITE_ORIGIN + cartoucheSharePath(name);
}

export function cartoucheImagePath(name: string): string {
  return `${OG_IMAGE_PATH}?name=${encodeURIComponent(name.trim())}`;
}

export function cartoucheImageUrl(name: string): string {
  return SITE_ORIGIN + cartoucheImagePath(name);
}

export type EmbedTheme = "dark" | "light";

export function embedUrl(theme: EmbedTheme = "dark"): string {
  return `${SITE_ORIGIN}${EMBED_PATH}${theme === "light" ? "?theme=light" : ""}`;
}

/**
 * The HTML a site owner pastes to embed the translator. The credit line sits
 * outside the iframe on purpose: a link inside a frame passes nothing to the
 * embedding page's readers or to search engines, a caption link does.
 */
export function embedSnippet(theme: EmbedTheme = "dark"): string {
  return [
    `<iframe src="${embedUrl(theme)}" title="Hieroglyphic name translator" width="100%" height="420" style="border:0;max-width:640px" loading="lazy"></iframe>`,
    `<p style="font:14px/1.4 sans-serif">Hieroglyphic name translator by <a href="${SITE_ORIGIN}${TRANSLATOR_PATH}">Learn Hieroglyphics</a></p>`,
  ].join("\n");
}
