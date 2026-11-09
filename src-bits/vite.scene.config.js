import { defineConfig } from 'vite';

// The 3D background (Three.js) is its own bundle, assets/bits/oyzla-scene.js, so the motion
// layer and the page never wait on it. Runs after the main build (which empties the folder).
export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir: '../assets/bits',
    emptyOutDir: false,
    target: 'es2019',
    sourcemap: false,
    modulePreload: false,
    rollupOptions: {
      input: 'src/scene/scene.js',
      output: { format: 'es', entryFileNames: 'oyzla-scene.js' }
    }
  }
});
