import { defineConfig } from "vite";
export default defineConfig({
  publicDir: "public",
  build: { outDir: "dist", sourcemap: false, assetsInlineLimit: 0 },
  server: { port: 5173, strictPort: true },
});
