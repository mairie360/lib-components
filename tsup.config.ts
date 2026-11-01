import { defineConfig } from 'tsup';
import { uiEntryPoints } from './scripts/ui-entrypoints.mjs';

// Build UI before tsup.server.config.ts: one declaration worker at a time,
// with one clean step and a client boundary that never reaches the server entry.
export default defineConfig({
  // `forms` is the react-hook-form adapter: its own entry so that primitives stay loadable without the optional peers (MAIR-608).
  entry: { index: 'src/index.tsx', forms: 'src/forms/index.ts', ...Object.fromEntries(Object.keys(uiEntryPoints).map(name => [name, `src/entries/${name}.ts`])) },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2018',
  splitting: true,
  minify: false,
  banner: { js: '"use client";' },
  loader: { '.png': 'dataurl' },
  // tsconfig keeps `jsx: preserve` for Next.js; without this esbuild emits classic React.createElement calls that
  // break any component importing only hooks from React (DesktopNavigation in the published 0.10.2, MAIR-578).
  esbuildOptions(options) { options.jsx = 'automatic'; },
  // Components reach the kit through the published entries (module state must stay unique, MAIR-578).
  external: [/^@mairie360\/lib-components\//, 'react', 'react-dom', 'react-hook-form', 'zod', /^@hookform\//, 'fs', 'zlib', 'path', 'stream', 'http', 'https', 'os', 'url', 'buffer', 'crypto', 'axios', 'next/server.js', 'node:crypto'],
});
