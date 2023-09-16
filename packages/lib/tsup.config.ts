import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  outDir: "dist",
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  keepNames: true,
  treeshake: "recommended",
  splitting: false,
  ...options,
}));
