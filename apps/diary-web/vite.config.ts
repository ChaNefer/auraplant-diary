import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@monodiary/ui-shared/styles/timeline.css": path.resolve(
        __dirname,
        "../../packages/ui-shared/src/styles/timeline.css",
      ),
      "@monodiary/ui-shared": path.resolve(
        __dirname,
        "../../packages/ui-shared/src/index.ts",
      ),
    },
  },

  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
