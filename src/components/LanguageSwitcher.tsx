import Link from "next/link";
import { LOCALES, LOCALE_NAMES, TOOL_PATHS, type Locale, type ToolPage } from "@/lib/i18n";

/** Links to this tool page in the other languages. Plain links with hreflang, so crawlers find every version too. */
export default function LanguageSwitcher({ page, current, className = "" }: { page: ToolPage; current: Locale; className?: string }) {
  return (
    <nav aria-label={current === "es" ? "Idioma" : current === "fr" ? "Langue" : "Language"} className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-xs text-sand-500 ${className}`}>
      {LOCALES.map((l) =>
        l === current ? (
          <span key={l} aria-current="page" className="text-sand-300">
            {LOCALE_NAMES[l]}
          </span>
        ) : (
          <Link key={l} href={TOOL_PATHS[page][l]} hrefLang={l} lang={l} className="underline underline-offset-4 hover:text-gold-400">
            {LOCALE_NAMES[l]}
          </Link>
        )
      )}
    </nav>
  );
}
