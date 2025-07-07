import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  minify: false,
  sourcemap: true,
  clean: true,
  target: "es2018",
  external: [
    "react", "react-dom",
    "fs", "zlib", "path", "stream", "http", "https"
  ],
});
