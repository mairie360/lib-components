import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  external: ["zlib", "fs", "path"],
  noExternal: ["react"],
  clean: true,
});
