import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// In production the app is served from a GitHub Pages project subpath
// (https://marjc5.github.io/linkedin-frame/), so the base must match the repo
// name. During dev/tests it stays at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/linkedin-frame/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
}))
