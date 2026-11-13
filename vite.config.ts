/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function manualChunks(id: string) {
  if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
  if (id.includes('framer-motion') || id.includes('motion-dom')) return 'motion';
  if (id.includes('node_modules')) return 'vendor';
}

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      // chunking only applies to the browser bundle; the SSR build is a single Node module
      output: isSsrBuild ? {} : { manualChunks },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));
