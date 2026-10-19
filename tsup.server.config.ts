import { defineConfig } from 'tsup';

// Retain dist/next.* and its server-only imports; the UI build already cleans.
export default defineConfig({
  entry: { next: 'src/next.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: false,
  target: 'es2018',
  splitting: false,
  minify: false,
  external: ['react', 'react-dom', 'fs', 'zlib', 'path', 'stream', 'http', 'https', 'os', 'url', 'buffer', 'crypto', 'axios', 'next/server.js', 'node:crypto'],
});
