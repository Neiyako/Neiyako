import { defineConfig } from 'vitest/config';

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  build: {
    target: 'es2022',
    sourcemap: false,
    // The Three.js WebGPU runtime is a known, lazy-loaded vendor chunk.
    chunkSizeWarningLimit: 900,
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});

