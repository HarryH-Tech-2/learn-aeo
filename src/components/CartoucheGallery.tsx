import Link from "next/link";
import { galleryImages } from "@/lib/cartouche-gallery";

/**
 * Famous and popular names as real cartouche images under the translator (src/lib/cartouche-gallery.ts).
 * Plain <img>: the images come from the /cartouche-image route at 1200×630 and are already the right size.
 */
export default function CartoucheGallery() {
  const images = galleryImages();
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" aria-labelledby="cartouche-gallery-heading">
      <h2 id="cartouche-gallery-heading" className="font-display text-2xl md:text-3xl font-semibold text-sand-100 text-center mb-3">
        Famous names in hieroglyphics
      </h2>
      <p className="font-body text-sm md:text-base text-sand-400 text-center max-w-2xl mx-auto mb-10">
        Royal names from ancient Egypt, and some of today&apos;s most popular names, each spelled sign by sign in a cartouche.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {images.map((img) => (
          <li key={img.name}>
            <Link href={img.href} className="group block border border-gold-700/25 hover:border-gold-500/60 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} width={1200} height={630} loading="lazy" decoding="async" className="block w-full h-auto" />
              <span className="block font-body text-sm text-sand-300 group-hover:text-gold-400 px-4 py-3">{img.name} in hieroglyphics</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
