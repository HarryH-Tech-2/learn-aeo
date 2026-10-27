/** The hero button's inside (.hero-cta, globals.css): the call to action over a reassuring line. */
export default function HeroCtaInside({ label, sub }: { label: string; sub: string }) {
  return (
    <span className="hero-cta-text">
      <span className="hero-cta-label">{label}</span>
      <span className="hero-cta-sub">{sub}</span>
    </span>
  );
}
