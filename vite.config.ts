import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: path.resolve(__dirname, "src/main/index.ts"),
        vite: {
          build: {
            outDir: path.resolve(__dirname, "dist-electron/main"),
            rollupOptions: {
              external: ["sql.js", "pdfkit"]
            }
          }
        }
      },
      {
        entry: path.resolve(__dirname, "src/preload/index.ts"),
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: path.resolve(__dirname, "dist-electron/preload")
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "src/shared"),
      "@main": path.resolve(__dirname, "src/main"),
      "@renderer": path.resolve(__dirname, "src/renderer/src")
    }
  },
  root: "src/renderer",
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true
  }
});
