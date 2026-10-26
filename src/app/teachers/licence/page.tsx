import type { Metadata } from "next";
import { Suspense } from "react";
import LicenceContent from "./LicenceContent";

export const metadata: Metadata = {
  title: "Your Classroom licence | Learn Hieroglyphics",
  description: "Class code, pupil progress and billing for your Classroom or School licence.",
  robots: { index: false, follow: false },
};

export default function LicencePage() {
  return (
    <Suspense>
      <LicenceContent />
    </Suspense>
  );
}
