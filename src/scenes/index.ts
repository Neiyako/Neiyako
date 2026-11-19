import type { MountScenesOptions } from './contracts';

/**
 * Mounts the Three.js canvases when they are visible. The implementation is
 * provided in `scenes/index.ts` by the scene workstream.
 */
export function mountScenes(_options: MountScenesOptions): () => void {
  return () => undefined;
}

