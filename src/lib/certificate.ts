// The certificate background and where the learner's name goes on it. The art is drawn by
// scripts/dev/build-badges.mjs: keep NAME in step with the gold name line there.
// Used by the canvas render on /certificate and the preview on the dashboard.

export const CERTIFICATE = {
  src: "/certificate-aeo.webp",
  /** Name centre, as fractions of the image width and height (the y is the text baseline). */
  nameX: 0.5,
  nameY: 0.57,
  /** Starting font size and the widest the name may run, as fractions of the image width. */
  nameSize: 0.046,
  nameMaxWidth: 0.48,
  nameColour: "#e6ebf5",
  nameFont: "Georgia, 'Times New Roman', serif",
} as const;
