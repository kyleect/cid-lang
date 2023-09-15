/// <reference types="vitest" />
// vite.config.ts
import { defineConfig } from "vite";
export default defineConfig({
  test: {
    globals: true,
    coverage: {
      reporter: ["text", "html"],
      provider: "v8",
      exclude: ["node_modules/", "docs", "dist"],
    },
  },
});
