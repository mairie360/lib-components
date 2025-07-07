import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "es2018",
  splitting: false,
  minify: false,
  external: [
    "react",
    "react-dom",
    "fs",
    "zlib",
    "path",
    "stream",
    "http",
    "https",
    "os",
    "url",
    "buffer",
    "crypto",
    "axios"
  ]
});
