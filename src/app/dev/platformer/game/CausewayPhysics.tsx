"use client";

/**
 * Everything on the causeway that needs the physics engine: the course and
 * the player. Kept in a file of its own so Game.tsx can load it lazily. The
 * engine is the largest download of the game (about 800 KB, its WebAssembly
 * is inlined), and the title does not need it: it arrives while the learner
 * reads the title and types a name.
 */
import { Physics } from "@react-three/rapier";
import type { GameTextures } from "./textures";
import Level from "./Level";
import Player from "./Player";
import { Compile } from "./Post";

export default function CausewayPhysics({ tex, run, paused }: { tex: GameTextures; run: number; paused: boolean }) {
  return (
    <Physics gravity={[0, -28, 0]} paused={paused} timeStep="vary">
      <Level tex={tex} run={run} />
      <Player />
      <Compile />
    </Physics>
  );
}
