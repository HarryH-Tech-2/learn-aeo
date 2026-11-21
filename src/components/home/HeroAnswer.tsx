/**
 * The picture beside the homepage hero copy: a mock AI answer with its question, a short answer carrying numbered
 * citations, and the list of sources it cites, one of them the visitor's own site. Plain server HTML and CSS
 * (no video, no canvas), so the hero is complete at first paint. It is an illustration, so assistive tech gets
 * one label instead of the made-up text.
 */
const SOURCES = [
  { n: 1, host: "yoursite.com", path: "/guides/pricing", yours: true },
  { n: 2, host: "industry-review.example", path: "/best-tools", yours: false },
  { n: 3, host: "docs.vendor.example", path: "/setup", yours: false },
] as const;

export default function HeroAnswer() {
  return (
    <div className="hero-answer" role="img" aria-label="An AI answer that cites three sources, the first of them your site">
      <div className="hero-answer-query" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="hero-answer-query-icon">
          <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <span className="hero-answer-query-text">Which tool should a small team use?</span>
      </div>

      <div className="hero-answer-body" aria-hidden="true">
        <p className="hero-answer-label">Answer</p>
        <p className="hero-answer-text">
          For a small team, the best fit is the one with clear per-seat pricing and a short{" "}
          <span className="whitespace-nowrap">
            setup<sup className="hero-answer-cite hero-answer-cite-yours">1</sup>.
          </span>{" "}
          Independent reviews rate it highly for{" "}
          <span className="whitespace-nowrap">
            support<sup className="hero-answer-cite">2</sup>,
          </span>{" "}
          and it can be running in under an{" "}
          <span className="whitespace-nowrap">
            hour<sup className="hero-answer-cite">3</sup>.
          </span>
        </p>

        <p className="hero-answer-label">Sources</p>
        <ol className="hero-answer-sources">
          {SOURCES.map((s) => (
            <li key={s.n} className="hero-answer-source" data-yours={s.yours || undefined}>
              <span className="hero-answer-source-n">{s.n}</span>
              <span className="hero-answer-source-url">
                <strong>{s.host}</strong>
                {s.path}
              </span>
              {s.yours && <span className="hero-answer-source-tag">Cited</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
