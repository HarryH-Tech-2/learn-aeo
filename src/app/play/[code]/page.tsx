import type { Metadata } from "next";
import PlayContent from "./PlayContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join the class quiz | Learn Hieroglyphics",
  description: "Join your teacher's live hieroglyph quiz with the room code on the screen.",
  robots: { index: false, follow: false },
};

export default async function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PlayContent code={code} />;
}
