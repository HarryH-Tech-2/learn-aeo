import { notFound } from "next/navigation";
import { devBypassAuth } from "@/lib/dev-bypass";
import HotspotEditor from "./HotspotEditor";

/**
 * Dev-only hotspot editor for Stela Reader. Only exists when the dev server
 * runs with LH_DEV_BYPASS_AUTH=1; a production build returns 404.
 */
export const dynamic = "force-dynamic";

export default function StelaEditorPage() {
  if (!devBypassAuth()) notFound();
  return <HotspotEditor />;
}
