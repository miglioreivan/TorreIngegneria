import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          game: ['./src/game/Game.js'],
          entities: ['./src/game/Player.js', './src/game/Platform.js'],
          rendering: ['./src/game/Background.js', './src/ui/UI.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
