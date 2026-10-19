import { defineConfig } from 'tsup';
import { uiEntryPoints } from './scripts/ui-entrypoints.mjs';

// Build UI before tsup.server.config.ts: one declaration worker at a time,
// with one clean step and a client boundary that never reaches the server entry.
export default defineConfig({
  entry: { index: 'src/index.tsx', ...Object.fromEntries(Object.keys(uiEntryPoints).map(name => [name, `src/entries/${name}.ts`])) },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2018',
  splitting: true,
  minify: false,
  banner: { js: '"use client";' },
  loader: { '.png': 'dataurl' },
  external: ['react', 'react-dom', 'fs', 'zlib', 'path', 'stream', 'http', 'https', 'os', 'url', 'buffer', 'crypto', 'axios', 'next/server.js', 'node:crypto'],
});
