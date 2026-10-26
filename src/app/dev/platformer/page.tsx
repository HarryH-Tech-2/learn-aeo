import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlatformerClient from "./PlatformerClient";

/**
 * PROTOTYPE, dev only: "The Causeway of Thoth", a 3D platformer look test.
 * Exists under `next dev` and nowhere else; a production build returns 404.
 * Everything it needs is in this folder. To remove it, delete
 * src/app/dev/platformer (see README.md there).
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Causeway prototype", robots: { index: false, follow: false } };

export default function PlatformerPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PlatformerClient />;
}
