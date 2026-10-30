import { useId } from "react";

/**
 * The Learn AEO mark: a magnifier with a gold AI spark in the lens, on navy. The same drawing as
 * public/favicon.svg (which scripts/dev/build-icons.mjs turns into the favicon and app icons).
 * useId keeps the gradient and glow ids unique when the mark appears twice on a page (navbar + footer).
 */
export default function BrandMark({ className }: { className?: string }) {
  const id = useId();
  const glow = `${id}-glow`;
  const bg = `${id}-bg`;
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={className}>
      <defs>
        <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <radialGradient id={bg} cx="40%" cy="40%" r="75%">
          <stop offset="0" stopColor="#0d1a33" />
          <stop offset="1" stopColor="#04060d" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${bg})`} />
      <circle cx="28" cy="28" r="15" fill="none" stroke="#6fe3ff" strokeWidth="5" filter={`url(#${glow})`} opacity="0.85" />
      <circle cx="28" cy="28" r="15" fill="none" stroke="#bff3ff" strokeWidth="4" />
      <path d="M39 39 52 52" stroke="#bff3ff" strokeWidth="6.5" strokeLinecap="round" />
      <path
        d="M28 18.5c.9 5.6 3.9 8.6 9.5 9.5-5.6.9-8.6 3.9-9.5 9.5-.9-5.6-3.9-8.6-9.5-9.5 5.6-.9 8.6-3.9 9.5-9.5Z"
        fill="#6fb2ff"
      />
    </svg>
  );
}
