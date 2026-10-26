/**
 * The 14-day guarantee, under every upgrade button outside /pricing. Nobody who reached checkout came from the
 * pricing page (GA4, May–Oct 2026): they bought from the dashboard, lessons and games, so the reassurance has to
 * sit where they click. Same look as GuaranteeLine in PricingSection.
 */
export default function GuaranteeNote({
  plan = "lifetime",
  included,
  align = "center",
  className = "",
}: {
  /** "monthly" leads with cancelling, the pass's own reassurance */
  plan?: "lifetime" | "monthly";
  /** an optional one-line "what's included" above the guarantee */
  included?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const justify = align === "left" ? "justify-start text-left" : "justify-center text-center";
  return (
    <div className={`mt-3 ${className}`}>
      {included && <p className={`font-body text-xs text-sand-400 ${align === "left" ? "text-left" : "text-center"}`}>{included}</p>}
      <p className={`font-body text-xs text-gold-400/90 flex items-center gap-1.5 mt-1 ${justify}`}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
        {plan === "monthly" ? "Cancel any time · 14-day money-back guarantee" : "14-day money-back guarantee"}
      </p>
    </div>
  );
}
