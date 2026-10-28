// The certificate background and where the learner's name, issue date and verification URL go on it. The art is drawn by
// scripts/dev/build-badges.mjs: keep NAME in step with the gold name line there.
// Used by the canvas render on /certificate and the preview on the dashboard.

export const CERTIFICATE = {
  src: "/certificate-aeo-v2.webp",
  /** Name center, as fractions of the image width and height (the y is the text baseline). */
  nameX: 0.5,
  nameY: 0.57,
  /** Starting font size and the widest the name may run, as fractions of the image width. */
  nameSize: 0.046,
  nameMaxWidth: 0.48,
  nameColor: "#e6ebf5",
  nameFont: "Georgia, 'Times New Roman', serif",
  /** Baselines of the "Issued …" and "Verify: …" lines, as fractions of the image height. */
  dateY: 1222 / 1414,
  urlY: 1278 / 1414,
  /** Their font size (fraction of the image width), colors and font. */
  metaSize: 0.014,
  metaColor: "#a9b4cc",
  urlColor: "#6fe3ff",
  metaFont: "Inter, 'Segoe UI', Helvetica, Arial, sans-serif",
} as const;
