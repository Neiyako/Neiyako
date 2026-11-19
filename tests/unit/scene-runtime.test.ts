import * as THREE from 'three/webgpu';
import { describe, expect, it, vi } from 'vitest';

import { disposeSceneResources } from '../../src/scenes/runtime';

describe('disposeSceneResources', () => {
  it('releases shared geometry, material textures, and materials exactly once', () => {
    const scene = new THREE.Scene();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const texture = new THREE.Texture();
    const material = new THREE.MeshBasicMaterial({ map: texture });

    scene.add(new THREE.Mesh(geometry, material));
    scene.add(new THREE.Mesh(geometry, material));

    const geometryDispose = vi.spyOn(geometry, 'dispose');
    const textureDispose = vi.spyOn(texture, 'dispose');
    const materialDispose = vi.spyOn(material, 'dispose');

    disposeSceneResources(scene);

    expect(geometryDispose).toHaveBeenCalledTimes(1);
    expect(textureDispose).toHaveBeenCalledTimes(1);
    expect(materialDispose).toHaveBeenCalledTimes(1);
  });
});
