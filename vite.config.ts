import { defineConfig } from 'vite';

/**
 * @description Vite 設定：沿用 8080 埠，讓舊版 localStorage 資料（同源）可被遷移
 */
export default defineConfig({
  server: { port: 8080, strictPort: false },
  optimizeDeps: { entries: ['index.html'] },
  build: { outDir: 'dist', target: 'es2022' },
});
