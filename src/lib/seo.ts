// Every page's <head> goes through these two helpers, so no page inherits the home page's Open
// Graph card (a child that sets no openGraph would share the home title and URL). The root
// layout's title template adds " | Learn AEO" to `title`; the social cards get the full title.

import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";

const DEFAULT_IMAGE = { url: "/og-default.png", width: 1200, height: 630, type: "image/png" };

export function pageMetadata(o: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** An image path, or null to leave images to a file-based opengraph-image in the route. */
  image?: string | null;
  type?: "website" | "article";
  /** Use `title` as is, without the " | Learn AEO" template (the home page). */
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(o.path);
  const fullTitle = o.absoluteTitle ? o.title : `${o.title} | ${SITE.name}`;
  const images =
    o.image === null ? undefined : o.image ? [{ url: o.image, width: 1200, height: 630, alt: fullTitle }] : [{ ...DEFAULT_IMAGE, alt: fullTitle }];
  return {
    title: o.absoluteTitle ? { absolute: o.title } : o.title,
    description: o.description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: o.description,
      url,
      siteName: SITE.name,
      locale: "en_US",
      type: o.type ?? "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: o.description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
    ...(o.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Signed-in, transactional or one-off pages: kept out of every index, no canonical. */
export function privateMetadata(title: string, description?: string): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    robots: { index: false, follow: false },
  };
}
