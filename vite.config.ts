import { defineConfig } from 'vitest/config';

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});

