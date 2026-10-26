/** Where each kind of level is played. Level 1 (the causeway) is mounted by Game.tsx itself. */
import { lazy, type ComponentType } from "react";
import type { Layout } from "../lesson";
import type { GameTextures } from "../textures";

export type PlaceProps = { tex: GameTextures };

// Each place is fetched when a level first needs it, so Lesson 1 on the site
// (the causeway alone) does not download the other seven.
export const PLACES: Record<Exclude<Layout, "causeway">, ComponentType<PlaceProps>> = {
  felucca: lazy(() => import("./Felucca")),
  workshop: lazy(() => import("./Workshop")),
  tomb: lazy(() => import("./Tomb")),
  market: lazy(() => import("./Market")),
  brush: lazy(() => import("./BrushWall")),
  passage: lazy(() => import("./Passage")),
  wall: lazy(() => import("./GreatWall")),
};
