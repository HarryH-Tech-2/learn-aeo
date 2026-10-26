import type { Metadata } from "next";
import { Suspense } from "react";
import JoinContent from "./JoinContent";

export const metadata: Metadata = {
  title: "Join your class | Learn Hieroglyphics",
  description: "Enter the class code from your teacher to unlock the full hieroglyphics course.",
  robots: { index: false, follow: false },
};

export default function JoinPage() {
  return (
    <Suspense>
      <JoinContent />
    </Suspense>
  );
}
