import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.postgres.integration.ts'],
    testTimeout: 15_000,
    hookTimeout: 15_000,
  },
});
