/** One texture per message: the arithmetic of textureMath.ts, off the main thread. */
import { runJob, type TextureJob } from "./textureMath";

const ctx = self as unknown as { onmessage: ((e: MessageEvent<TextureJob>) => void) | null; postMessage(message: unknown, transfer: Transferable[]): void };

ctx.onmessage = (e) => {
  const { color, normal } = runJob(e.data);
  ctx.postMessage({ color, normal }, [color.buffer, normal.buffer]);
};
