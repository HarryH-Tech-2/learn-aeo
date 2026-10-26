/** The keyboard, for every place: it writes the same `input` the touch stick writes. */
import { useEffect } from "react";
import { input } from "./store";

const KEY_MAP: Record<string, "up" | "down" | "left" | "right" | "jump"> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "jump",
};

export function useKeyboard() {
  useEffect(() => {
    const held = { up: false, down: false, left: false, right: false };
    const sync = () => {
      input.x = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      input.y = (held.up ? 1 : 0) - (held.down ? 1 : 0);
    };
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    const down = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.code];
      // leave the name box alone: W, A, S, D and Space are letters there
      if (!k || typing(e)) return;
      e.preventDefault();
      if (k === "jump") {
        if (!e.repeat) {
          input.jumpHeld = true;
          input.jumpPressedAt = performance.now();
        }
        return;
      }
      held[k] = true;
      sync();
    };
    const up = (e: KeyboardEvent) => {
      const k = KEY_MAP[e.code];
      if (!k) return;
      if (k === "jump") input.jumpHeld = false;
      else {
        held[k] = false;
        sync();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
}
