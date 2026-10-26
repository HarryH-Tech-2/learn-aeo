/**
 * Marks visits that should not count in GA4: bots, and our own.
 *
 * About 30% of the "users" GA4 reported in Aug–Sep 2026 were automated
 * browsers (64 from Singapore on one odd 1280×1200 screen, ~30 Android
 * WebViews from China, headless Chrome on square screens), none of them with
 * a second of engagement. They fire no events but inflate the user count and
 * drag every rate down. GA4 cannot delete what it has recorded, so visits are
 * marked as they happen: the page view is sent with `traffic_type` set, and a
 * data filter in GA4 (Admin → Data filters, "internal traffic" type, one per
 * value) drops it. The filter can sit in Testing first, where the marked
 * visits show up under the "Test data filter name" dimension instead.
 *
 * Our own visits: open any page once with ?aeo_internal=1 on each browser you
 * use (?aeo_internal=0 undoes it).
 *
 * classifyTraffic runs inside an inline script before gtag's config call
 * (see trafficTypeScript), so it must stay self-contained: no imports, no
 * helpers, nothing newer than ES5 syntax.
 */
import { COOKIE_PREFIX } from "@/lib/site";

export type TrafficType = "bot" | "internal" | null;

export type TrafficSignals = {
  webdriver: boolean;
  userAgent: string;
  /** navigator.languages.length (0 in many headless browsers) */
  languages: number;
  screenWidth: number;
  screenHeight: number;
  outerWidth: number;
  outerHeight: number;
  /** the page is on screen: not a background tab, not prerendered by Chrome from a Google result */
  onScreen: boolean;
  /** the visitor has marked this browser as ours */
  internal: boolean;
};

export function classifyTraffic(s: TrafficSignals): TrafficType {
  if (s.internal) return "internal";
  if (s.webdriver) return "bot";
  // ("bot/" as in Googlebot/2.1, not a bare "bot": there are phones called Cubot)
  if (/HeadlessChrome|PhantomJS|Lighthouse|[a-z]bot\/|crawler|spider/i.test(s.userAgent)) return "bot";
  if (s.languages === 0) return "bot";
  // a desktop window with no size is a browser nobody is looking at (phones are left out: iOS web views report 0 too).
  // Only on screen: Chrome also reports 0 for a background tab and for a page it prerenders from a Google
  // result, and in Sept 2026 that marked real searchers (minutes of engagement) as bots.
  if (s.onScreen && s.outerWidth === 0 && s.outerHeight === 0 && !/Mobi|Android|iPhone|iPad/.test(s.userAgent)) return "bot";
  var w = s.screenWidth;
  var h = s.screenHeight;
  // no monitor or phone is square; and the one desktop size behind 61 silent Singapore visits
  if (w >= 800 && w === h) return "bot";
  if (w === 1280 && h === 1200) return "bot";
  // an in-app WebView is normal (Facebook, Instagram); one reporting a desktop-era 800×600, or the single
  // 393×851 every silent visit from China came on, is not
  if (/; wv\)/.test(s.userAgent) && ((w === 800 && h === 600) || (w === 393 && h === 851))) return "bot";
  return null;
}

/**
 * Countries GA4 hears nothing from (2026-10-05). Singapore and China kept sending silent visits on ordinary
 * screens that the rules above cannot tell from people, about one "user" in seven. The few real learners
 * there go uncounted in GA4 too; accounts and purchases are still in our own database.
 */
export const GA_BLOCKED_COUNTRIES = ["SG", "CN", "CO"];

/**
 * Inline script, run before gtag's config call: switches GA4 off for this page (gtag's own
 * `ga-disable-<id>` flag) when the middleware's country cookie (aeo_cc, src/middleware.ts) names a blocked country.
 */
export function gaCountryBlockScript(measurementId: string): string {
  return (
    "(function(){try{" +
    "var c=(document.cookie.match(/(?:^|; )aeo_cc=([A-Za-z]{2})/)||[])[1];" +
    `if(c&&${JSON.stringify(GA_BLOCKED_COUNTRIES)}.indexOf(c.toUpperCase())>-1){window['ga-disable-${measurementId}']=true}` +
    "}catch(e){}})();"
  );
}

export const INTERNAL_KEY = `${COOKIE_PREFIX}internal`;

/**
 * Inline script: works out the traffic type and leaves it on window.__lhTraffic for the gtag config call.
 * Any failure leaves it unset, which counts the visit as a normal one.
 */
export function trafficTypeScript(): string {
  return (
    "(function(){try{" +
    "var m=/[?&]aeo_internal=([01])/.exec(location.search);" +
    `if(m){if(m[1]==='1'){localStorage.setItem('${INTERNAL_KEY}','1')}else{localStorage.removeItem('${INTERNAL_KEY}')}}` +
    `var i=false;try{i=localStorage.getItem('${INTERNAL_KEY}')==='1'}catch(e){}` +
    `window.__lhTraffic=(${classifyTraffic.toString()})({` +
    "webdriver:navigator.webdriver===true,userAgent:navigator.userAgent||''," +
    "languages:(navigator.languages||[]).length,screenWidth:screen.width,screenHeight:screen.height," +
    "outerWidth:window.outerWidth,outerHeight:window.outerHeight," +
    "onScreen:typeof document==='undefined'||(document.visibilityState!=='hidden'&&!document.prerendering),internal:i})" +
    "}catch(e){}})();"
  );
}
