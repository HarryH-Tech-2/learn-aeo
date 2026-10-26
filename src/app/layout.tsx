import type { Metadata } from "next";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { gaCountryBlockScript, trafficTypeScript } from "@/lib/traffic-type";
import { Noto_Sans_Cuneiform, Open_Sans } from "next/font/google";
import Script from "next/script";
import Providers from "@/components/Providers";
import CampaignTracker from "@/components/CampaignTracker";
import CookieScroll from "@/components/CookieScroll";
import CoffeeSeal from "@/components/CoffeeSeal";
import LastPathTracker from "@/components/LastPathTracker";
import { analyticsAllowedScript } from "@/lib/consent";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthModalProvider from "@/components/AuthModal";
import { SITE, absoluteUrl } from "@/lib/site";
import "@/styles/globals.css";

const GA_MEASUREMENT_ID = SITE.gaId ?? "";
// Only the live site reports to GA4. Local dev and Vercel previews used to
// send page views, sign-ups and checkouts to the production property (28
// localhost sessions in the 90 days to 2026-09-11), inflating every funnel
// number. trackEvent() guards on window.gtag, so nothing else changes.
const GA_ENABLED =
  Boolean(GA_MEASUREMENT_ID) && process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

// Cuneiform signs in any page's text (the cuneiform name page and blog post, 2026-10-24). Google's CSS limits the
// face to the cuneiform block by unicode-range, and it is not preloaded, so only pages with cuneiform fetch it.
const cuneiform = Noto_Sans_Cuneiform({
  subsets: ["cuneiform"],
  weight: "400",
  variable: "--font-cuneiform",
  display: "swap",
  preload: false,
  // (no metric-matched Arial face: it would sit in the stack ahead of system-ui for every non-Latin letter)
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.name} | ${SITE.tagline}`,
  description:
    "Learn to read and write Egyptian hieroglyphics online. Interactive lessons covering the hieroglyphic alphabet, royal cartouches, temple inscriptions, and the Book of the Dead.",
  openGraph: {
    title: `${SITE.name} | ${SITE.tagline}`,
    description:
      "Interactive online course to read and write Egyptian hieroglyphics. From the alphabet of the gods to temple inscriptions: decode 3,000 years of civilization.",
    type: "website",
    locale: "en_US",
    siteName: SITE.name,
    images: [
      {
        // JPEG: Messenger shows no picture for a WebP preview (scripts/dev/build-og-image.ts)
        url: "/og-homepage.jpg",
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: `${SITE.name}: the name Cleopatra in a cartouche over the pyramids of Giza at sunset`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.tagline}`,
    description:
      "Interactive lessons to read and write Egyptian hieroglyphics. Start free today.",
    images: ["/og-homepage.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    // let Google show big image thumbnails and full snippets in results
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${openSans.variable} ${cuneiform.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-64.png" type="image/png" sizes="64x64" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* The 10 KB hieroglyph subset used above the fold — fetched alongside
            the CSS so the first layout shapes glyphs with it instead of doing
            slow OS font fallback and re-laying out when it lands. */}
        <link
          rel="preload"
          href="/fonts/noto-egyptian-core.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: SITE.name,
              url: SITE.url,
              logo: absoluteUrl("/icon-512.png"),
              description: SITE.description,
              sameAs: SITE.sameAs,
            }),
          }}
        />
        {/* Inline script to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT,
          }}
        />
      </head>
      <body className="bg-obsidian text-sand-100 antialiased transition-colors duration-300">
        {/* lazyOnload: gtag's ~170 KB parse/execute used to land inside the
            Total Blocking Time window; after `load` it no longer competes with
            hydration. trackEvent() guards on window.gtag, so early clicks are
            simply not recorded (same as before while the script was in flight). */}
        {GA_ENABLED && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script id="gtag-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                // UK/EU visitors are measured only after "Accept all" on the cookie scroll, everyone else until
                // "Essentials only" (src/lib/consent.ts); no config call means no hits at all, not even cookieless ones
                ${analyticsAllowedScript()}
                var lhConsented = window.__lhAnalyticsAllowed === true;
                gtag('consent', 'default', { analytics_storage: lhConsented ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
                gtag('js', new Date());
                // nothing is sent from Singapore or China (src/lib/traffic-type.ts)
                ${gaCountryBlockScript(GA_MEASUREMENT_ID)}
                // bots and our own visits are marked, and a GA4 data filter drops them (src/lib/traffic-type.ts)
                ${trafficTypeScript()}
                // started here when allowed, or by the cookie scroll the moment "Accept all" is clicked
                window.__lhGaStart = function () {
                  if (window.__lhGaStarted) return;
                  window.__lhGaStarted = true;
                  var lhConfig = window.__lhTraffic ? { traffic_type: window.__lhTraffic } : {};
                  // a signed-in visitor's account id (set by setAnalyticsUserId before gtag loaded) ties their visits together
                  if (window.__lhUserId) lhConfig.user_id = window.__lhUserId;
                  // the free-unlock test group, from the visitor's first page (src/lib/access-test.ts), and any user
                  // properties set by setAnalyticsUserProperty before gtag loaded
                  var lhAccess = (document.cookie.match(/(?:^|; )aeo_access=(free|paid)/) || [])[1];
                  if (lhAccess) gtag('set', 'user_properties', { access_test: lhAccess });
                  if (window.__lhUserProps) gtag('set', 'user_properties', window.__lhUserProps);
                  // back from Google sign-in or Stripe Checkout: not a new referral, so the visit keeps its real
                  // source (GA4's "unwanted referrals" list has no API; ignore_referrer does the same per hit)
                  var lhRef = document.referrer || '';
                  if (lhRef.indexOf('https://accounts.google.') === 0 || lhRef.indexOf('https://checkout.stripe.com/') === 0 || lhRef.indexOf('https://pay.stripe.com/') === 0) lhConfig.ignore_referrer = 'true';
                  gtag('config', '${GA_MEASUREMENT_ID}', lhConfig);
                };
                if (lhConsented) window.__lhGaStart();
              `}
            </Script>
          </>
        )}
        <Providers>
          <ThemeProvider>
            <AuthModalProvider>{children}</AuthModalProvider>
            <CampaignTracker />
            <CookieScroll />
            <CoffeeSeal />
            <LastPathTracker />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
