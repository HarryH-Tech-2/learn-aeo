/**
 * Which discount a visitor will actually get at checkout: their offer code or their purchasing-power price,
 * whichever is larger (src/app/api/stripe/create-checkout/route.ts). An offer no larger than the parity
 * discount is never used, so it is not shown either. Shared by the offer banner and the sealed panel.
 */
export function usableOffer<T extends { percentOff: number; expiresAt: string }>(
  offer: T | null | undefined,
  pppPercentOff: number | null | undefined,
  now: number = Date.now()
): T | null {
  if (!offer) return null;
  if (new Date(offer.expiresAt).getTime() <= now) return null;
  if (pppPercentOff != null && pppPercentOff >= offer.percentOff) return null;
  return offer;
}

/**
 * When an offer ends, in words: "today at 14:05", "tomorrow at 09:00", or "Wed 22 Oct at 14:05".
 * Shown on the dashboard's "still open" card. Locale and time zone default to the viewer's.
 */
export function offerEndsLabel(
  expiresAt: string | Date,
  now: Date = new Date(),
  opts: { locale?: string; timeZone?: string } = {}
): string {
  const { locale, timeZone } = opts;
  const end = new Date(expiresAt);
  const day = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const time = new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric", minute: "2-digit" }).format(end);
  if (day(end) === day(now)) return `today at ${time}`;
  if (day(end) === day(new Date(now.getTime() + 86_400_000))) return `tomorrow at ${time}`;
  const date = new Intl.DateTimeFormat(locale, { timeZone, weekday: "short", day: "numeric", month: "short" }).format(end);
  return `${date} at ${time}`;
}
