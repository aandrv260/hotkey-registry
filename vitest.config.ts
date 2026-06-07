import { defineConfig } from 'vitest/config'

// Unit tests cover the framework-agnostic core/utils, so no React plugin is needed.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
