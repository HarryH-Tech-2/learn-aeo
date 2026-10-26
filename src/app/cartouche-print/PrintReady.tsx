"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/** Records that a buyer reached the download page (once per page view). */
export default function PrintReady({ name }: { name: string }) {
  useEffect(() => {
    trackEvent("cartouche_print_success", { name_length: name.length });
  }, [name]);
  return null;
}
