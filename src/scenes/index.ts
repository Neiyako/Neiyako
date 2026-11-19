import type {
  MountScenesOptions,
  SceneController,
  SceneInitializer,
} from './contracts';
import { hasWebGPUSupport } from './webgpu-support';

const SCENE_SELECTOR =
  '[data-scene="kinetic"], [data-scene="flow"], [data-scene="structure"]';

type SceneName = 'kinetic' | 'flow' | 'structure';

const SCENE_INITIALIZERS: Record<SceneName, SceneInitializer> = {
  kinetic: async (canvas, options) => {
    const { createKineticScene } = await import('./kinetic');
    return createKineticScene(canvas, options);
  },
  flow: async (canvas, options) => {
    const { createFlowScene } = await import('./flow');
    return createFlowScene(canvas, options);
  },
  structure: async (canvas, options) => {
    const { createStructureScene } = await import('./structure');
    return createStructureScene(canvas, options);
  },
};

interface SceneRecord {
  canvas: HTMLCanvasElement;
  frame: HTMLElement;
  name: SceneName;
  visible: boolean;
  failed: boolean;
  controller: SceneController | null;
  initialization: Promise<void> | null;
}

function matchesMedia(query: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

function isSceneName(value: string): value is SceneName {
  return value === 'kinetic' || value === 'flow' || value === 'structure';
}

function setSceneState(record: SceneRecord, state: 'ready' | 'fallback'): void {
  record.frame.dataset.sceneState = state;
}

/**
 * Lazy-mounts all three WebGPU scenes. Canvases begin in the static fallback
 * state and only become live when WebGPU is available and their frame enters
 * the viewport.
 */
export function mountScenes(options: MountScenesOptions): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => undefined;
  }

  const records: SceneRecord[] = [];

  for (const canvas of document.querySelectorAll<HTMLCanvasElement>(SCENE_SELECTOR)) {
    const sceneName = canvas.dataset.scene;
    const frame = canvas.closest<HTMLElement>('.scene-frame');
    if (!frame || !sceneName || !isSceneName(sceneName)) continue;

    const record: SceneRecord = {
      canvas,
      frame,
      name: sceneName,
      visible: false,
      failed: false,
      controller: null,
      initialization: null,
    };

    setSceneState(record, 'fallback');
    records.push(record);
  }

  if (records.length === 0) {
    return () => undefined;
  }

  const reduceMotion = options.reducedMotion || matchesMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion) {
    for (const record of records) setSceneState(record, 'fallback');
    return () => undefined;
  }

  const compact = matchesMedia('(max-width: 760px), (pointer: coarse)')
    || window.innerWidth <= 760;

  let disposed = false;
  let webGPUSupported = false;
  let intersectionObserver: IntersectionObserver | null = null;

  const initializeRecord = (record: SceneRecord): void => {
    if (
      disposed ||
      !webGPUSupported ||
      record.failed ||
      record.controller ||
      record.initialization ||
      !record.visible
    ) {
      return;
    }

    record.initialization = SCENE_INITIALIZERS[record.name](
      record.canvas,
      { compact, reducedMotion: false },
    )
      .then((controller) => {
        record.initialization = null;

        if (disposed) {
          controller.dispose();
          return;
        }

        record.controller = controller;
        setSceneState(record, 'ready');
        controller.setActive(record.visible && !document.hidden);
      })
      .catch(() => {
        record.initialization = null;
        record.failed = true;
        setSceneState(record, 'fallback');
      });
  };

  const syncActiveState = (): void => {
    for (const record of records) {
      record.controller?.setActive(record.visible && !document.hidden);
    }
  };

  const handleVisibilityChange = (): void => {
    syncActiveState();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

  void hasWebGPUSupport()
    .then((supported) => {
      if (disposed) return;

      if (!supported) {
        for (const record of records) setSceneState(record, 'fallback');
        return;
      }

      webGPUSupported = true;

      if (typeof IntersectionObserver === 'undefined') {
        for (const record of records) {
          record.visible = true;
          initializeRecord(record);
        }
        return;
      }

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const record = records.find((candidate) => candidate.frame === entry.target);
            if (!record) continue;

            record.visible = entry.isIntersecting;
            if (record.visible) initializeRecord(record);
            record.controller?.setActive(record.visible && !document.hidden);
          }
        },
        {
          rootMargin: '120px 0px',
          threshold: 0.01,
        },
      );

      for (const record of records) intersectionObserver.observe(record.frame);
    })
    .catch(() => {
      if (disposed) return;
      for (const record of records) {
        if (!record.controller) setSceneState(record, 'fallback');
      }
    });

  return () => {
    if (disposed) return;
    disposed = true;

    document.removeEventListener('visibilitychange', handleVisibilityChange);
    intersectionObserver?.disconnect();
    intersectionObserver = null;

    for (const record of records) {
      record.controller?.dispose();
      record.controller = null;
      setSceneState(record, 'fallback');
    }
  };
}
