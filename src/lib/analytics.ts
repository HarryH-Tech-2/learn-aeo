/**
 * Thin GA4 event helper. gtag is loaded in src/app/layout.tsx; every event
 * automatically carries page_location, so lesson identity comes from the URL.
 *
 * Custom parameters must be registered as event-scoped custom dimensions in
 * GA4 (Admin → Custom definitions) to appear in reports:
 *   exercise, question_type, question, correct, score, total, pct, attempts
 *
 * Conversion events (mark these as Key events in GA4 → Admin → Events):
 *   sign_up          — account creation started on /get-started (method: google | email)
 *   login            — returning sign-in on /login (method)
 *   lesson_complete  — Site Report submitted at the end of a lesson (lesson_id, score, total)
 *   begin_checkout   — Stripe Checkout session requested (value, currency); from the translator's print card with location "translator" and plan = the format's product id
 *   purchase         — landed on /dashboard?checkout=success (transaction_id, value, currency)
 *
 * Funnel events added 2026-08-24:
 *   translator_to_lesson — "Learn the other N signs" clicked on the translator (sign_count)
 *   name_sign_flip       — first flip card turned on the translator
 *   offer_shown / offer_click — discount offer rendered / claimed (offer_source, location). Never name a param
 *     "source", "medium" or "campaign": GA4 reads them as the traffic source and starts a new session with it
 *     (found 2026-10-16: "section-complete / (not set)" sessions).
 *
 * Funnel events added 2026-08-31 (guest-lesson funnel: hero/nav → guest lesson → wall → sign-up):
 *   free_lesson_cta      — guest "First Lesson" CTA clicked (location: hero | nav | nav_mobile | blog)
 *   signup_wall_shown / signup_wall_click — guest hit / clicked the in-lesson sign-in wall (location)
 *   signup_modal_shown   — sign-up popup opened on the page (next: checkout | a path | dashboard)
 *   login_modal_shown    — sign-in popup opened (navbar / certificate "Sign In")
 *
 * Unprompted sign-up card added 2026-09-07 (src/components/AuthPromptCard.tsx):
 *   signup_prompt_shown / signup_prompt_click / signup_prompt_dismissed
 *     (trigger: blog_scroll). Shown at most once per
 *     browser per 30 days, never to signed-in users, never in the first 10 s.
 *
 * Lesson sections (2026-09-17, lesson 1 in three sections, src/lib/content/lesson-sections.ts):
 *   lesson_section_complete — a section's last quick check finished (lesson_id, section)
 *   lesson_section_continue — "Continue to section N" pressed on the break screen (lesson_id, section)
 *   lesson_section_resume   — returned later and picked up at a saved section (lesson_id, section)
 *   upgrade_panel_shown / upgrade_panel_click — upgrade screen at a section end or the outro
 *     (location: section_1 | section_2 | lesson_outro; offer: 0|1; target: checkout | pricing)
 *
 * Game events (2026-09-08, Cartouche of the Day + Decipher, src/app/daily):
 *   game_start          — a game began (game: daily | decipher | sign-hunt | tomb-wall …; puzzle, chapter)
 *   daily_complete      — today's cartouche finished (puzzle, won, attempts, hints, streak)
 *   daily_share         — share grid sent (puzzle, method: native | clipboard)
 *   decipher_chapter_complete — a Decipher chapter finished (chapter, signs)
 *   decipher_share      — result card shared (signs)
 *   hint_used           — a hint taken (game, question)
 *   stela_museum_mode   — Stela Reader museum mode toggled (on); stela_share — phrase shared (object, phrase)
 *   scribe_share        — Scribe's Hand session shared (avg)
 *   descent_share       — Scribe's Descent run shared (floors, won)
 *   class_room_created / class_host_action (action, question) / class_join / class_answer (question) /
 *   exercise_answer / exercise_complete use ExerciseKind "daily" and "decipher".
 *
 * The Causeway (Lesson 1 as a game, 2026-09-21; src/app/dev/platformer/game/telemetry.ts):
 *   game_level_start / game_level_complete / game_quit (exercise: causeway-N; question_type: who is playing, or the
 *   station reached; question: the sign wanted), and exercise_answer with exercise "causeway" for every pick.
 *   Before the run (2026-10-25): game_title_view (title playable; seconds since the page opened), game_load_quit
 *   (left while it said Loading…; seconds waited), game_brief_view (briefing card up). Funnel: title → brief → start.
 *
 * Guest-play banner (2026-09-23, src/components/GuestPlayBanner.tsx; opened the Causeway game until 2026-10-01,
 * the written Lesson 1 since, with the dig-site picture in place of the game clip):
 *   guest_play_banner_view  — banner half on screen, once per page view (location; question_type: card | strip)
 *   guest_play_banner_click — banner clicked (location; question_type: card | strip | blog_footer)
 *   Translator, 2026-10-20: the same two events from "Now read {Name} yourself" straight under the cartouche
 *   (src/components/NameLessonAsk.tsx; question_type name_card, named 1); the Causeway card lower down is game_card.
 *   CTR per post = click users / view users, split by pagePath and question_type.
 *
 * Hieroglyphics keyboard (2026-10-05, src/app/hieroglyphics-keyboard):
 *   keyboard_first_key   — first sign typed in a page view (method: keys | screen)
 *   keyboard_copy / keyboard_image — signs copied as text / saved as a PNG (total: signs typed)
 *   keyboard_to_lesson / keyboard_to_translator — the links under the keys (total)
 *   The lesson card on the page is a GuestPlayBanner with location "keyboard".
 *   English page, 2026-10-16 (src/components/CardKeep.tsx): keyboard_style, keyboard_template,
 *   keyboard_keep_open (reason), keyboard_email (lead "keyboard"), keyboard_hd_click / keyboard_hd_member,
 *   keyboard_print_open, keyboard_read_back_open, keyboard_share (method), keyboard_word_found (word);
 *   secret-message page: keyboard_message_view / _guess / _reveal / _reply / _lesson.
 * Name translator, 2026-10-16: "Make it a picture" (src/components/NameCardStudio.tsx) translator_style, translator_template,
 *   translator_keep_open, translator_image, translator_share, translator_email, translator_hd_click / _hd_member;
 *   since 2026-10-20 the box leads with its own HD button: _hd_click / _hd_member carry at (studio | panel, the keep
 *   panel) and, from the button, page; the folded print line's tap is cartouche_print_expand (name_length, currency, page);
 *   under the cartouche (src/components/TranslatorExtras.tsx) translator_email_early, translator_title_view,
 *   translator_title_share (method), translator_keep_bar_click (phones).
 *
 * Sign questions on the free tool pages (2026-10-10, src/lib/sign-quiz.ts):
 *   exercise_answer / exercise_complete with exercise "read-back" (translator, under the cartouche)
 *     and "alphabet-test" (the self-test under the alphabet chart)
 *   read_back_cta      — a way on to the lesson from the read-back (question_type: signup | google | email | guest |
 *                        lesson; step: result | more; score, total). "signup" is the result card's direct ask.
 *   "Learn 3 more signs right here" after the read-back (2026-10-16, src/components/ReadItBack.tsx; exercise
 *   "read-back-more", custom events only, not exercise_answer):
 *     read_back_more_start    — offer tapped (known: signs of the name; total: new signs)
 *     read_back_more_answer   — each new-sign question (question_type: sign | sound; sign: the glyph; correct 1/0)
 *     read_back_more_complete — last one answered (score, total, known: signs known after the three)
 *   alphabet_test_view — the self-test half on screen, once per page view
 *   alphabet_test_cta  — a button on its result (question_type: signup | lesson | continue; score)
 *   class_strip_view / class_strip_click — the strip shown to visits from a school's learning platform
 *     (src/lib/class-visit.ts; question_type: the platform; target: worksheet | class | licence)
 *
 * Marketing events (no custom params beyond the ones noted):
 *   worksheet_print     — /teachers/worksheet printed or saved as PDF
 *   alphabet_print      — /hieroglyphic-alphabet/print printed or saved as PDF
 *   coffee_view         — the Buy Me a Coffee seal (bottom right) shown on a page, with page          [2026-10-21]
 *   coffee_hover        — its note opened (once per page), with page                                  [2026-10-21]
 *   coffee_click        — (removed) the corner coffee seal, with page; CTR = click / view [2026-10-21]
 *   worksheet_email     — "Email it to me" submitted on the worksheet (lead source "worksheet")       [2026-10-05]
 *   worksheet_offer_click — class quiz / Classroom licence pressed on the worksheet (target: class | licence) [2026-10-05]
 *   teachers_contact    — "Contact us" clicked on /teachers (location)
 *   cartouche_download  — cartouche PNG downloaded on the translator (name_length)
 *   cartouche_share     — cartouche shared from the print card's Share window (name_length, theme, method: native_file | native) [theme + method 2026-09-26]
 *   cartouche_share_open — the Share window opened on the print card (name_length, theme) [2026-09-26]
 *   cartouche_email     — "email me my cartouche" submitted (name_length)
 *   cartouche_link_copy — share link copied on the translator (name_length)  [2026-09-07]
 *   embed_copy          — embed code copied on the translator (theme)          [2026-09-07]
 *   embed_view / embed_click_through — the iframe translator loaded on another
 *                         site (referrer hostname) / its credit link clicked
 *   cartouche_print_click   — "Get the print" pressed on the translator (name_length, currency, theme, format) [2026-09-24; theme + format 2026-09-25; names, the count on a family print, 2026-10-16]
 *   cartouche_print_view    — the print card was a third on screen, once per name (name_length, currency) [2026-10-15]
 *   cartouche_print_format  — a format picked on the print card: framed / print / image (format, name_length) [2026-09-25; digital dropped from the card 2026-09-26; image, the $3.99 HD picture, 2026-10-15]
 *   cartouche_print_theme   — a paper swatch picked on the print card (theme, name_length) [2026-09-25]
 *   cartouche_print_add_name — "Add another name" pressed on the print card (names: names on the print once the
 *                             new box is filled, 2–4) [2026-10-16]; the card's begin_checkout carries names too
 *   cartouche_print_success — the buyer reached the download page after paying (name_length);
 *                             the sale itself is recorded server-side as `purchase` with item cartouche-print
 */

type Gtag = (...args: unknown[]) => void;

const MAX_QUESTION_LENGTH = 100;

/** Clip to at most `max` UTF-16 units without splitting a surrogate pair
 *  (hieroglyphs are astral code points, 2 units each). */
function clip(s: string, max: number): string {
  if (s.length <= max) return s;
  let out = "";
  for (const ch of s) {
    if (out.length + ch.length > max) break;
    out += ch;
  }
  return out;
}

/**
 * Tie a signed-in visitor's events to their account, so GA4 keeps one user across the
 * sign-in round trip (an email link opened in another browser, a second device). The id
 * is the opaque database id, never an email. gtag loads lazily: if it is not there yet,
 * the id waits on window.__lhUserId and the gtag-init script in layout.tsx sends it with
 * the config call.
 */
export function setAnalyticsUserId(id: string): void {
  if (typeof window === "undefined" || !id) return;
  const w = window as unknown as { gtag?: Gtag; __lhUserId?: string };
  if (w.__lhUserId === id) return;
  w.__lhUserId = id;
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("set", { user_id: id });
  } catch {
    // Analytics must never break the page.
  }
}

/**
 * A GA4 user property (registered as a user-scoped custom dimension to report on). Like the user id, it waits on
 * window.__lhUserProps when gtag has not loaded yet; the gtag-init script in layout.tsx sends those with the config call.
 */
export function setAnalyticsUserProperty(name: string, value: string): void {
  if (typeof window === "undefined" || !name) return;
  const w = window as unknown as { gtag?: Gtag; __lhUserProps?: Record<string, string> };
  w.__lhUserProps = { ...(w.__lhUserProps ?? {}), [name]: value };
  if (typeof w.gtag !== "function") return;
  try {
    w.gtag("set", "user_properties", { [name]: value });
  } catch {
    // Analytics must never break the page.
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, params);
  } catch {
    // Analytics must never break the lesson.
  }
}

/**
 * trackEvent for something seen as the page opens (a "_view" event fired on mount). gtag loads lazily after the
 * page (layout.tsx), so a mount-time trackEvent on a first page load is dropped, and the view count reads far lower
 * than the clicks that follow it. This waits for gtag, checking every half second for up to 20 s. Without consent
 * gtag never starts and nothing is sent, the same as for clicks. Returns a cancel function for effect cleanup.
 */
export function trackEventWhenReady(name: string, params: Record<string, unknown> = {}): () => void {
  if (typeof window === "undefined") return () => {};
  const ready = () => typeof (window as unknown as { gtag?: Gtag }).gtag === "function";
  if (ready()) {
    trackEvent(name, params);
    return () => {};
  }
  let tries = 0;
  const id = window.setInterval(() => {
    tries += 1;
    if (ready()) trackEvent(name, params);
    if (ready() || tries >= 40) window.clearInterval(id);
  }, 500);
  return () => window.clearInterval(id);
}

export type ExerciseKind =
  | "mini"
  | "quiz"
  | "matching"
  | "drag-drop"
  | "fill-blank"
  | "decode"
  | "site-report"
  | "sign-hunt"
  | "tomb-wall"
  | "daily"
  | "decipher"
  | "stela"
  | "wall"
  | "scribe"
  | "descent"
  // lesson spine
  | "field-notes"
  | "read-it"
  // per-lesson signature mechanics
  | "spell-it"
  | "field-sketchbook"
  | "pick-the-ending"
  | "counting-house"
  | "cartouche-reader"
  | "stela-builder"
  | "walk-the-hall"
  | "word-anatomy"
  // expedition (2026-09-08): story beats and harder passes
  | "choice"
  | "letter"
  | "boss"
  | "second-pass"
  | "audit"
  | "quick-object"
  | "quick-listen"
  | "quick-speed"
  | "quick-silent"
  // free tool pages (2026-10-10, src/lib/sign-quiz.ts)
  | "read-back"
  | "alphabet-test"
  // Lesson 1 word cards: sound it out, pick the reading (2026-10-24)
  | "word-decode";

export function trackExerciseAnswer(input: {
  exercise: ExerciseKind;
  questionType: string;
  /** The glyph / prompt being asked about; clipped for GA4's param limits. */
  question: string;
  correct: boolean;
}): void {
  trackEvent("exercise_answer", {
    exercise: input.exercise,
    question_type: input.questionType,
    question: clip(input.question, MAX_QUESTION_LENGTH),
    correct: input.correct ? 1 : 0,
  });
}

export function trackExerciseComplete(input: {
  exercise: ExerciseKind;
  score: number;
  total: number;
  attempts?: number;
}): void {
  const pct = input.total > 0 ? Math.round((input.score / input.total) * 100) : 0;
  trackEvent("exercise_complete", {
    exercise: input.exercise,
    score: input.score,
    total: input.total,
    pct,
    ...(input.attempts !== undefined ? { attempts: input.attempts } : {}),
  });
}
