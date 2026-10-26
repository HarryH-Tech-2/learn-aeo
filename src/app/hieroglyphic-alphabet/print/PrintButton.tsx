"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function PrintButton() {
  useEffect(() => {
    // Fires for the button, Ctrl/Cmd+P and the browser menu alike.
    const onBeforePrint = () => trackEvent("alphabet_print");
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, []);

  return (
    <button type="button" onClick={() => window.print()} className="btn-primary py-3 px-6 text-sm">
      Print / Save as PDF
    </button>
  );
}
