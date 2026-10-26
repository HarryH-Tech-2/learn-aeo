/**
 * One spare slot at the end of every instanced mesh's buffers, never drawn.
 *
 * Samsung's Xclipse GPUs (Galaxy A55, Exynos S-series; Chromium's ANGLE on
 * Vulkan) misread the LAST matrix of an instanced buffer: that one instance
 * comes out as NaN vertices, which rasterise as screen-sized triangles of
 * NaN, and bloom and tone mapping then turn the whole picture black under a
 * HUD that works. Found 2026-09-21 on the phone itself: nine palms drew
 * wrongly, eight of the same nine drew correctly, and whichever palm was put
 * in the last slot was the one that broke. With a slot to spare the driver's
 * misread lands on a matrix nobody draws.
 *
 * A mesh whose buffers already have room to spare is left alone, and code that
 * keeps a buffer of its own to write to (Particles' colours) must make that
 * room itself: a swapped-in copy would never see its writes. It costs 64 bytes a mesh, so it is
 * done everywhere and not only where the fault has been seen.
 */
import * as THREE from "three";

function padded(a: THREE.InstancedBufferAttribute, count: number): THREE.InstancedBufferAttribute {
  const n = a.itemSize;
  const src = a.array as Float32Array;
  const array = new Float32Array((count + 1) * n);
  array.set(src.subarray(0, count * n));
  // (the spare holds a copy of the last real one: a valid matrix, whatever reads it)
  array.set(src.subarray((count - 1) * n, count * n), count * n);
  const b = new THREE.InstancedBufferAttribute(array, n, a.normalized);
  b.setUsage(a.usage);
  return b;
}

/** Give every instanced mesh under `root` its spare slot. Cheap to call again: a mesh already padded is left alone. */
export function padInstances(root: THREE.Object3D): number {
  let done = 0;
  root.traverse((o) => {
    const m = o as THREE.InstancedMesh;
    if (!m.isInstancedMesh || m.count < 1) return;
    if (m.instanceMatrix.count <= m.count) {
      m.instanceMatrix = padded(m.instanceMatrix, m.count);
      done++;
    }
    if (m.instanceColor && m.instanceColor.count <= m.count) m.instanceColor = padded(m.instanceColor, m.count);
  });
  return done;
}
