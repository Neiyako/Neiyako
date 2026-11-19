export interface SceneOptions {
  compact: boolean;
  reducedMotion: boolean;
}

export interface SceneController {
  dispose(): void;
  setActive(active: boolean): void;
}

export type SceneInitializer = (
  canvas: HTMLCanvasElement,
  options: SceneOptions,
) => Promise<SceneController>;

export interface MountScenesOptions {
  reducedMotion: boolean;
}

