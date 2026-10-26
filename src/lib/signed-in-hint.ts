/**
 * A note on this device that the visitor was signed in last time we knew.
 *
 * The session cookie is httpOnly, so the page cannot tell it is there until
 * /api/auth/session answers (a database lookup, 0.3–1.5 s). Pages that would
 * otherwise sit on a spinner for that long can read this and start on the
 * signed-in view at once. It is only ever a guess: what the session check
 * says replaces it, and nothing private is shown on the strength of it.
 */
const KEY = "lh_signed_in";

export function signedInHint(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSignedInHint(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
}
