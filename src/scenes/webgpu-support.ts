interface WebGPUAdapter {
  requestAdapter(options?: {
    powerPreference?: 'low-power' | 'high-performance';
  }): Promise<unknown | null>;
}

/**
 * Checks for a usable WebGPU adapter before a renderer is constructed. This
 * prevents Three.js from silently choosing its internal WebGL fallback.
 */
export async function hasWebGPUSupport(): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;

  const gpu = (navigator as Navigator & { gpu?: WebGPUAdapter }).gpu;
  if (!gpu) return false;

  try {
    const adapter = await gpu.requestAdapter({
      powerPreference: 'high-performance',
    });
    return adapter !== null;
  } catch {
    return false;
  }
}
