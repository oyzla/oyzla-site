import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Output is committed to ../assets/bits/ and served as-is by GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: { 'motion/react': fileURLToPath(new URL('./src/motion-lite.js', import.meta.url)) }
  },
  publicDir: false,
  build: {
    outDir: '../assets/bits',
    emptyOutDir: true,
    target: 'es2019',
    sourcemap: false,
    modulePreload: false,
    codeSplitting: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        format: 'es',
        entryFileNames: 'oyzla-bits.js',
        chunkFileNames: 'oyzla-bits-[name].js',
        assetFileNames: 'oyzla-bits-[name][extname]'
      }
    }
  }
});
