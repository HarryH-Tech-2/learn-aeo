/**
 * Class visits: pupils sent to a free tool page from a school's learning platform.
 *
 * On 8 Oct 2026 a Nashville class arrived on the name translator from a Schoology link: 55 pupils,
 * about 11 hours on the page between them, no sign-ups (pupils will not and should not make
 * accounts). The person worth talking to on such a visit is the teacher who set the link, so the
 * tool pages show a slim strip for them (src/components/ClassVisitStrip.tsx) pointing at the free
 * worksheet, the live class quiz and the Classroom licence.
 *
 * The only signal is the referrer, so it is remembered for the tab: after the first click inside
 * the site the referrer is our own domain.
 */

/** Learning platforms and school portals seen in GA4 referrals, plus the common ones. */
const CLASS_HOSTS = [
  "schoology.com",
  "classroom.google.com",
  "epraise.co.uk",
  "instructure.com", // Canvas
  "seesaw.me",
  "clever.com",
  "classdojo.com",
  "edmodo.com",
  "satchelone.com", // Show My Homework
  "showmyhomework.co.uk",
  "blackboard.com",
  "itslearning.com",
  "managebac.com",
  "sch.gr", // Greek schools' eclass
];

const KEY = "lh_class_visit";

function hostOf(referrer: string): string {
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** The platform a referrer belongs to ("schoology.com"), or null when it is not a class link. */
export function classPlatform(referrer: string | null | undefined): string | null {
  const host = hostOf(referrer ?? "");
  if (!host) return null;
  return CLASS_HOSTS.find((h) => host === h || host.endsWith(`.${h}`)) ?? null;
}

/** This tab's class platform: from the referrer now, or remembered from the page they landed on. */
export function classVisit(referrer: string | null | undefined): string | null {
  const now = classPlatform(referrer);
  try {
    if (now) sessionStorage.setItem(KEY, now);
    return now ?? sessionStorage.getItem(KEY);
  } catch {
    return now;
  }
}
