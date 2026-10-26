"use client";

import dynamic from "next/dynamic";

const Game = dynamic(() => import("./game/Game"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#140d07] flex items-center justify-center">
      <p className="font-body text-xs tracking-[0.3em] uppercase text-gold-500 animate-pulse">Raising the causeway…</p>
    </div>
  ),
});

export default function PlatformerClient() {
  return <Game />;
}
