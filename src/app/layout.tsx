import type { Metadata, Viewport } from "next";
import { THEME_INIT_SCRIPT, THEME_COLOR } from "@/lib/theme";
import { gaCountryBlockScript, trafficTypeScript } from "@/lib/traffic-type";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import Script from "next/script";
import Providers from "@/components/Providers";
import CampaignTracker from "@/components/CampaignTracker";
import CookieScroll from "@/components/CookieScroll";
import LastPathTracker from "@/components/LastPathTracker";
import { analyticsAllowedScript } from "@/lib/consent";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthModalProvider from "@/components/AuthModal";
import { SITE, absoluteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/schema";
import "@/styles/globals.css";

const GA_MEASUREMENT_ID = SITE.gaId ?? "";
// Only the live site reports to GA4. Local dev and Vercel previews used to
// send page views, sign-ups and checkouts to the production property (28
// localhost sessions in the 90 days to 2026-09-11), inflating every funnel
// number. trackEvent() guards on window.gtag, so nothing else changes.
const GA_ENABLED =
  Boolean(GA_MEASUREMENT_ID) && process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";

const figtree = Figtree({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-figtree",
  display: "swap",
});

// variable weight and optical size: tighter, crisper letterforms at headline sizes (no italic exists)
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description:
    "An online course in answer engine optimization for marketers who know SEO. Learn how ChatGPT, Perplexity and Google AI Overviews pick their sources, and how to get your pages cited. Lesson 1 is free.",
  openGraph: {
    title: `${SITE.name} | ${SITE.tagline}`,
    description:
      "A hands-on answer engine optimization course for marketers who know SEO: how AI answers choose sources, how to let AI crawlers in, and how to write passages they can cite.",
    type: "website",
    locale: "en_US",
    siteName: SITE.name,
    images: [
      {
        // PNG (not WebP: Messenger shows no picture for a WebP preview); built by scripts/dev/build-icons.mjs
        url: absoluteUrl("/og-default.png"),
        type: "image/png",
        width: 1200,
        height: 630,
        alt: `${SITE.name}: ${SITE.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.tagline}`,
    description:
      "Hands-on answer engine optimization lessons for marketers who know SEO. Lesson 1 is free.",
    images: [absoluteUrl("/og-default.png")],
  },
  robots: {
    index: true,
    follow: true,
    // let Google show big image thumbnails and full snippets in results
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  // Bing Webmaster Tools ownership (Google Search Console is verified by a DNS TXT record)
  verification: { other: { "msvalidate.01": "0578EA2042A6AAF6820BD9761C19E082" } },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${figtree.variable} ${bricolage.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-64.png" type="image/png" sizes="64x64" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
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
            <LastPathTracker />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
