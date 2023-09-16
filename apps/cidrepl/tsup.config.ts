import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/cidrepl.ts"],
  format: ["cjs"],
  outDir: "dist/lib",
  dts: true,
  clean: true,
  minify: true,
  shims: true,
  treeshake: "recommended",
  splitting: false,
  ...options,
}));
