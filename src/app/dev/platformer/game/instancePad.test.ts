import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { padInstances } from "./instancePad";

describe("padInstances", () => {
  it("adds one undrawn slot holding a valid matrix, keeps what was set, and does it once", () => {
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), 3);
    const at = new THREE.Matrix4();
    for (let i = 0; i < 3; i++) mesh.setMatrixAt(i, at.makeTranslation(i + 1, 0, 0));
    mesh.setColorAt(2, new THREE.Color(1, 0, 0));
    const scene = new THREE.Scene().add(mesh);

    expect(padInstances(scene)).toBe(1);
    expect(mesh.count).toBe(3);
    expect(mesh.instanceMatrix.count).toBe(4);
    expect(mesh.instanceColor!.count).toBe(4);
    mesh.getMatrixAt(1, at);
    expect(at.elements[12]).toBe(2);
    // the spare is a copy of the last real matrix, and later writes still land
    expect(Array.from(mesh.instanceMatrix.array.slice(48, 64))).toEqual(Array.from(mesh.instanceMatrix.array.slice(32, 48)));
    mesh.setMatrixAt(0, at.makeTranslation(9, 0, 0));
    expect(mesh.instanceMatrix.array[12]).toBe(9);

    expect(padInstances(scene)).toBe(0);
    expect(mesh.instanceMatrix.count).toBe(4);
  });

  it("leaves a colour buffer that already has room to spare where it is, so its owner's writes still show", () => {
    const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial(), 2);
    const own = new THREE.InstancedBufferAttribute(new Float32Array(3 * 3), 3);
    mesh.instanceColor = own;
    padInstances(new THREE.Scene().add(mesh));
    expect(mesh.instanceColor).toBe(own);
  });
});
