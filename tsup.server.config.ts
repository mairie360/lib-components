import { defineConfig } from 'tsup';

const external = ['react', 'react-dom', 'fs', 'zlib', 'path', 'stream', 'http', 'https', 'os', 'url', 'buffer', 'crypto', 'axios', 'next/server.js', 'node:crypto'];

// Retain dist/next.* and its server-only imports; the UI build already cleans.
// MAIR-126: the shared front kit is one entry per module (no shared chunk), so a
// front only bundles the modules it imports and never the UI root.
export default defineConfig([
  {
    entry: { next: 'src/next.ts', guard: 'src/kit/guard.ts', browser: 'src/kit/browser.ts', shared: 'src/kit/shared.ts', theme: 'src/kit/theme.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2018',
    splitting: false,
    minify: false,
    external,
  },
  {
    // Client providers: the only kit entry with a React client boundary.
    entry: { react: 'src/kit/react.tsx' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    target: 'es2018',
    splitting: false,
    minify: false,
    banner: { js: '"use client";' },
    // The tsconfig keeps `jsx: preserve` for Next.js; without this esbuild would emit classic
    // `React.createElement` calls with no React import (0.10.0 shipped that way).
    esbuildOptions(options) { options.jsx = 'automatic'; },
    external,
  },
]);
