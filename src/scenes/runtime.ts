import * as THREE from 'three/webgpu';

import type {
  SceneController,
  SceneOptions,
} from './contracts';
import { hasWebGPUSupport } from './webgpu-support';

export interface SceneContent {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update?(deltaSeconds: number, elapsedSeconds: number): boolean | void;
  resize?(width: number, height: number): void;
  dispose(): void;
}

export type SceneContentFactory = (
  renderer: THREE.WebGPURenderer,
  options: SceneOptions,
) => SceneContent;

interface RendererInternals {
  _getFallback: unknown;
}

interface BackendIdentity {
  isWebGPUBackend?: boolean;
}

const CANVAS_WIDTH_FALLBACK = 1;
const CANVAS_HEIGHT_FALLBACK = 1;

/**
 * Shared WebGPU scene runtime. It owns one renderer per mounted canvas, but the
 * orchestrator only initializes canvases as they approach the viewport and
 * pauses their animation loops when they are offscreen or hidden.
 */
export async function mountWebGPUScene(
  canvas: HTMLCanvasElement,
  options: SceneOptions,
  createContent: SceneContentFactory,
): Promise<SceneController> {
  // Check the API and adapter before construction so Three.js never has a
  // chance to choose its internal WebGL fallback backend.
  if (!(await hasWebGPUSupport())) {
    throw new Error('WebGPU is unavailable.');
  }

  const renderer = new THREE.WebGPURenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });

  // WebGPURenderer normally swaps to a WebGL backend when adapter/device setup
  // fails. The product contract explicitly requires WebGPU-only behavior.
  (renderer as unknown as RendererInternals)._getFallback = null;

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.setClearColor(0xf6f5f1, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const pixelRatioCap = options.compact ? 1.25 : 1.5;
  let content: SceneContent | null = null;
  let active = false;
  let destroyed = false;
  let completed = false;
  let animationFrame = 0;
  let lastFrameTime = 0;
  let elapsed = 0;
  let width = CANVAS_WIDTH_FALLBACK;
  let height = CANVAS_HEIGHT_FALLBACK;

  const measureSize = (): void => {
    const canvasRect = canvas.getBoundingClientRect();
    const parentRect = canvas.parentElement?.getBoundingClientRect();

    width = Math.max(
      CANVAS_WIDTH_FALLBACK,
      Math.round(canvasRect.width || parentRect?.width || CANVAS_WIDTH_FALLBACK),
    );
    height = Math.max(
      CANVAS_HEIGHT_FALLBACK,
      Math.round(canvasRect.height || parentRect?.height || CANVAS_HEIGHT_FALLBACK),
    );
  };

  const resize = (): void => {
    if (destroyed) return;

    measureSize();
    const pixelRatio = Math.min(
      Math.max(window.devicePixelRatio || 1, 1),
      pixelRatioCap,
    );

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);

    if (content) {
      content.camera.aspect = width / height;
      content.camera.updateProjectionMatrix();
      content.resize?.(width, height);

      if (completed && active) {
        renderer.render(content.scene, content.camera);
      }
    }
  };

  const renderFrame = (): void => {
    if (!content) return;
    renderer.render(content.scene, content.camera);
  };

  const animate = (frameTime: number): void => {
    animationFrame = 0;

    if (destroyed || !active || completed || !content) return;

    if (lastFrameTime === 0) lastFrameTime = frameTime;
    const delta = Math.min((frameTime - lastFrameTime) / 1000, 0.05);
    lastFrameTime = frameTime;
    elapsed += delta;

    const shouldContinue = content.update?.(delta, elapsed);
    renderFrame();

    if (shouldContinue === false) {
      completed = true;
      lastFrameTime = 0;
      return;
    }

    animationFrame = requestAnimationFrame(animate);
  };

  const requestFrame = (): void => {
    if (
      destroyed ||
      !active ||
      animationFrame !== 0 ||
      !content
    ) {
      return;
    }

    if (completed) {
      renderFrame();
      return;
    }

    lastFrameTime = 0;
    animationFrame = requestAnimationFrame(animate);
  };

  measureSize();
  renderer.setPixelRatio(
    Math.min(Math.max(window.devicePixelRatio || 1, 1), pixelRatioCap),
  );
  renderer.setSize(width, height, false);

  try {
    await renderer.init();

    const backend = renderer.backend as unknown as BackendIdentity;
    if (backend.isWebGPUBackend !== true) {
      throw new Error('WebGPU backend was not selected.');
    }

    content = createContent(renderer, options);
    resize();

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(resize);
    const resizeTarget = canvas.parentElement ?? canvas;
    resizeObserver?.observe(resizeTarget);
    window.addEventListener('resize', resize, { passive: true });

    renderFrame();

    const controller: SceneController = {
      setActive(nextActive: boolean): void {
        if (destroyed || active === nextActive) return;
        active = nextActive;

        if (active) {
          requestFrame();
        } else {
          if (animationFrame !== 0) {
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
          }
          lastFrameTime = 0;
        }
      },
      dispose(): void {
        if (destroyed) return;
        destroyed = true;
        active = false;

        if (animationFrame !== 0) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }

        resizeObserver?.disconnect();
        window.removeEventListener('resize', resize);
        content?.dispose();
        content = null;

        void renderer.dispose().catch(() => undefined);
      },
    };

    return controller;
  } catch (error) {
    content?.dispose();
    content = null;
    await renderer.dispose().catch(() => undefined);
    throw error;
  }
}

/**
 * Releases unique geometries, materials and material-owned textures in a scene
 * graph. Shared assets are disposed exactly once.
 */
export function disposeSceneResources(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  root.traverse((object) => {
    const renderable = object as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
      isInstancedMesh?: boolean;
      isBatchedMesh?: boolean;
      dispose?: () => void;
    };

    if (
      (renderable.isInstancedMesh || renderable.isBatchedMesh) &&
      typeof renderable.dispose === 'function'
    ) {
      renderable.dispose();
    }

    if (renderable.geometry) {
      geometries.add(renderable.geometry);
    }

    if (Array.isArray(renderable.material)) {
      for (const material of renderable.material) materials.add(material);
    } else if (renderable.material) {
      materials.add(renderable.material);
    }
  });

  for (const geometry of geometries) geometry.dispose();

  for (const material of materials) {
    const values = Object.values(material) as unknown[];
    for (const value of values) {
      const texture = value as { isTexture?: boolean; dispose?: () => void };
      if (texture?.isTexture && typeof texture.dispose === 'function') {
        texture.dispose();
      }
    }
    material.dispose();
  }
}
