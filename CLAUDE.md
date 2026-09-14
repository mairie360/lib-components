# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@mairie360/lib-components` is the shared React 19 + TypeScript component library for Mairie360 front-ends, styled with Tailwind CSS 4 and DaisyUI 5, developed in Storybook, and published to GitHub Packages (`publishConfig.registry`). Only `dist/` is shipped. See `README_en.md` / `README_fr.md` for consumer-facing docs.

## Commands

```bash
npm ci                                   # install from lockfile (Node 20)
npm run storybook                        # dev environment, http://localhost:6006
npm test                                 # Jest + coverage (the real unit test runner)
npx jest src/__tests__/Button.test.tsx   # single test file
npx jest -t "sorts by size"              # single test by name
npm run lint                             # ESLint (next/core-web-vitals + next/typescript)
npx tsc --noEmit                         # type-check (no npm script for it)
npm run build                            # prebuild (regenerate src/index.tsx) → tsup → dist/styles.css
npm run build-storybook                  # static Storybook in storybook-static/
npm run lighthouse                       # build Storybook + Lighthouse; fails if any story's a11y score < 0.76
```

CI runs the shared reusable workflow `mairie360/CICD/.github/workflows/front-libs-cicd.yml` (see `.github/workflows/cicd.yaml`); its steps are not defined in this repo.

## Architecture

### Public API is generated
`src/index.tsx` is **generated** by `scripts/generate-exports.js` on `prebuild` and overwritten on every build. For each `*.ts(x)` file directly in `src/components/`, it emits `export { <FileName> } from './components/<FileName>'`, plus `mairie360LogoSrc`. Consequences:
- A top-level component file must export a named symbol identical to its filename, or the build breaks.
- Files in subfolders (`src/components/calendar/`, `files/`, `messaging/`, …) are **not** exported. Neither are prop interfaces or types — only the component names.
- Don't hand-edit `src/index.tsx`; if you add a component, run `npm run build` (or the script) so the committed index stays in sync.

### Feature modules vs. primitives
`src/components/` is flat. Primitives (`Button`, `Alert`, `Select`, …) sit alongside feature modules named by prefix: `Administration*`, `Calendar*`/`MonthGrid`/`WeekGrid`/`DaySchedule`, `Dashboard*`, `Elearning*`, `Email*`, `Files*`/`FileCard`, `Messaging*`, `Project*`, `Settings*`. Each feature has a lowercase helper folder (`src/components/<feature>/`) containing:
- `types.ts` — domain types for the module
- `defaultData.ts` — French demo data used when the consumer passes nothing
- `utils.ts` / `styles.ts` / sub-components as needed

The `*Module` components (e.g. `FilesModule`) follow a common pattern: every data prop is optional and falls back to internal state seeded from `defaultData` (`const resolved = files ?? internalFiles`); mutations update internal state only when uncontrolled, and always fire `on*` callbacks so host apps can wire them to an API. Modules compose their sub-panels plus shared pieces like `ConfirmModal`. Components extend the relevant `React.HTMLAttributes` and spread `...props` / accept `className`.

### Language and a11y
User-facing strings, demo data and story names are in **French**, and Jest tests query by that French text and by ARIA roles/labels (`getByRole`, `getByLabelText`, `aria-pressed`, `data-testid`). Changing a label usually means updating tests. Accessibility is enforced via the Lighthouse check on Storybook docs pages.

### Client-only components
Components use hooks but carry no `'use client'` directive; consumers (Next.js App Router) must render them from Client Components.

### Styling and build
- `src/app/globals.css` is the single stylesheet entry (Tailwind + DaisyUI, with DaisyUI's `select` component excluded for Next.js 15.3/Turbopack CSS parsing). It is compiled to `dist/styles.css` and imported by Storybook's `preview.ts`. Components mostly use Tailwind utility classes with arbitrary hex values.
- `src/app/layout.tsx` and `next.config.ts` are Next.js scaffolding; `npm run dev` is not the development workflow — use Storybook.
- `tsup` bundles `src/index.tsx` to ESM + CJS with `.d.ts`; PNGs are inlined as data URLs; React/React DOM are peer deps and external. Keep framework packages (next, storybook, etc.) in `devDependencies`, not runtime `dependencies`.

### Tests and stories
- Jest (`jest.config.cjs`, `ts-jest`, jsdom, `tsconfig.jest.json`) runs `src/__tests__/*.test.tsx`; CSS maps to `identity-obj-proxy`, images to `src/__mocks__/fileMock.ts`; `@/` aliases `src/`.
- Stories live in `src/stories/`, titled `Components/<Feature>/<Name>` with `tags: ['autodocs']`, and use `fn()` from `storybook/test` for callback args. Module stories typically render inside `Sidebar` + `Header` + `Footer` for a full-page layout. `scripts/generate-lhci-urls.js` derives Lighthouse URLs from each story's `title`, so every story file needs a literal `title:`.
- `vitest.config.ts` is only the Storybook Vitest addon (browser tests of stories via Playwright), separate from `npm test`.
