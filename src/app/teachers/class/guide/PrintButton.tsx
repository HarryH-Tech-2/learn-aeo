"use client";

import { trackEvent } from "@/lib/analytics";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        trackEvent("class_guide_print", {});
        window.print();
      }}
      className="font-body text-sm bg-[#8a6610] text-white px-4 py-2"
    >
      Print this page
    </button>
  );
}
