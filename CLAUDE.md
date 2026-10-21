# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@mairie360/lib-components` is the shared React 19 + TypeScript component library for Mairie360 front-ends, styled with Tailwind CSS 4 and DaisyUI 5, developed in Storybook, and published to GitHub Packages (`publishConfig.registry`). Only `dist/` is shipped. See `README_en.md` / `README_fr.md` for consumer-facing docs.

## Figma library

The Figma counterpart of this library is **Mairie360 – lib-components**: https://www.figma.com/design/T7vetUfuzPEXk5TxjHRiO2 (Mairie360 Figma team). One Figma component per **component** export of `src/index.tsx` (same name); non-visual exports such as `mairie360LogoSrc`, `defaultSidebarItems`, `useToast` or the sidebar-preference helpers have no Figma counterpart, and internal helpers are grouped under their module name (e.g. `Calendar/EventPill`), variables `Color/mairie-*` (Light/Dark) mirroring `src/styles/municipal-theme.css`, text/effect styles, and the lucide icons as `Icon/*`. Pages: Cover, Foundations, Index, then one page per component group. Rules: Figma is the source of truth — design and agree the change on the Figma component first, then write the code that matches it (never the other way round); front mock-ups instantiate this library (publish it from Figma, Assets → Publish, after changes) and never redraw shared components.

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

CI runs the shared reusable workflow `mairie360/CICD/.github/workflows/front-libs-cicd.yml` (see `.github/workflows/cicd.yaml`); its steps are not defined in this repo. It runs on pull requests, manual dispatch and pushes to `main` only; the workflow token is read-only by default and only the `CICD` job gets `contents`/`packages`/`pages`/`id-token: write`, the cap the reusable `package` and `storybook` jobs need (MAIR-436, pinned by `src/__tests__/WorkflowPermissions.test.ts`).

## Architecture

### Public API is generated
`src/index.tsx` is **generated** by `scripts/generate-exports.js` on `prebuild` and overwritten on every build. For each `*.ts(x)` file directly in `src/components/`, it emits `export { <FileName> } from './components/<FileName>'`, plus `mairie360LogoSrc`. Consequences:
- A top-level component file must export a named symbol identical to its filename, or the build breaks.
- Files in subfolders (`src/components/shared/`) are **not** exported. Neither are prop interfaces or types — only the component names (plus the explicit `rootExtraExports` of `scripts/ui-entrypoints.mjs`).
- Don't hand-edit `src/index.tsx`; if you add a component, run `npm run build` (or the script) so the committed index stays in sync.

### Charte, tones and sizes (MAIR-608)
`src/styles/municipal-theme.css` carries the charte (`#70c1b3` primary with dark `--mairie-on-action`, `#3c4f76` secondary, `#383f51` text/navigation, `#c8bfc7` borders) in Light and Dark, plus the single size scale as `--mairie-<kind>-<size>` tokens (`control`, `icon`, `avatar`, `text`, `space`, `radius`, `logo` × `xs|s|m|l|xl`). `src/kit/theme.ts` exports the matching `tones` / `Tone`, `sizes` / `Size`, `scale`, `charteTokens`, `scaleVar`; `tests/kit/theme.test.mjs` checks the stylesheet declares every scale token. New colour tokens must be added to `approvedThemeProperties` in `scripts/check-ui-colors.mjs` (the colour guard forbids literals elsewhere). `Icon` and `Logo` are the first components on the scale; every normalised component takes `size?: Size` (and `tone?: Tone` when relevant) and binds the `--mairie-*` tokens rather than hard-coded pixels or colours.

### Buttons, fields and the forms entry (MAIR-608)
`Button` (variant × tone × size × state) is the base; the role presets in `src/components/ButtonPresets.tsx` (`CreateButton`…`LogoutButton`), `IconButton` (presets) and `LinkButton` build on `buttonAppearance` / `buttonSizing`. Fields share `Field` (`src/components/Field.tsx`: label, hint, error, `aria-describedby`) and `controlClass` / `controlStyle`; `TextField` presets live in `FieldPresets.tsx`. A preset ignores `undefined` overrides so `label={maybe}` keeps its default. `src/forms/` is the react-hook-form + zod adapter, built as the separate `forms` entry (tsup + `package.json` exports) with the peers externalised and optional, so `primitives` never imports them. New colour tokens go through `approvedThemeProperties` in `scripts/check-ui-colors.mjs`; never write hex values in components.

### Text, display, feedback and overlays (MAIR-608 lots 3–4)
Every visible string goes through `Text` or a preset of `src/components/Text.tsx` (never a bare `<p className="text-sm">`); the same preset convention (`undefined` overrides keep the default) applies to `Alert` presets and `StatusBadge` / `PriorityPill` (`statuses` / `priorities` maps in `StatusPill.tsx` are the single colour per business status). Empty, loading, unavailable and error areas use `DataState`; `Panel` and `DataTable` embed it. `Modal` and `Drawer` share `useDialogFocus` (`Modal.tsx`: focus trap, Escape, scroll lock, focus restored to the opener); `ConfirmModal` is `Modal` size xs with the button presets. Toasts: `ToastProvider` keeps its focus and timing rules; `useToast()` adds `error/success/warning/info` shortcuts, timed toasts show the countdown bar (`progress` + `progressDuration` props of `Toast`, frozen while paused). The shimmer and countdown live in `municipal-theme.css` under `prefers-reduced-motion: no-preference`. Removed in this ticket: `Badge`, `Title`, `Paragraph`, `EmptyState`, `PageTitleBar` (fronts migrate on the major release).

### Shared-only inventory (MAIR-607)
`src/components/` is flat and holds **only components shared by several fronts**: primitives (`Button`, `Alert`, `Select`, …), the shell (`AppShell`, `AccessibleShell`, `Header`, `Sidebar`, `DesktopNavigation`, `Footer`, `NotificationCenter`, `PageTitleBar`, `CurrentDate`) and shared business components (`SessionList`, used by Administrator and Settings). The rule: pure display goes to the lib; a business component enters the lib when at least two fronts use it, and may be born in a front first. The former feature modules (`Administration*`, `Calendar*`, `Dashboard*`, `Elearning*`, `Email*`, `Files*`, `Messaging*`, `Project*`, `Settings*`) were removed in MAIR-607 and now live in the front that uses them. `src/components/shared/` holds helpers (`joinClasses`). Public entries are `primitives` and `shell` (plus the kit entries `react`, `shared`, `theme`, `next`, `guard`, `browser`); `scripts/ui-entrypoints.mjs` is the single source of that membership and `scripts/check-ui-package.mjs` probes the packed package against it.

The Figma library (see above) mirrors this inventory: one `Base/*` set per component plus named presets; a component added here must exist in Figma first.

### Language and a11y
User-facing strings, demo data and story names are in **French**, and Jest tests query by that French text and by ARIA roles/labels (`getByRole`, `getByLabelText`, `aria-pressed`, `data-testid`). Changing a label usually means updating tests. Accessibility is enforced via the Lighthouse check on Storybook docs pages.

### Client-only components
Components that use hooks start with `'use client'` (the tsup banner also marks every bundle as a client module); consumers (Next.js App Router) render them from Client Components. Server-safe helpers live in the kit entries (`shared`, `theme`), never in component files.

### Styling and build
- `src/app/globals.css` is the single stylesheet entry (Tailwind + DaisyUI, with DaisyUI's `select` component excluded for Next.js 15.3/Turbopack CSS parsing). It is compiled to `dist/styles.css` and imported by Storybook's `preview.ts`. Components mostly use Tailwind utility classes with arbitrary hex values.
- `src/app/layout.tsx` and `next.config.ts` are Next.js scaffolding; `npm run dev` is not the development workflow — use Storybook.
- `tsup` bundles `src/index.tsx` to ESM + CJS with `.d.ts`; PNGs are inlined as data URLs; React/React DOM are peer deps and external. Keep framework packages (next, storybook, etc.) in `devDependencies`, not runtime `dependencies`.

### Tests and stories
- Jest (`jest.config.cjs`, `ts-jest`, jsdom, `tsconfig.jest.json`) runs `src/__tests__/*.test.tsx`; CSS maps to `identity-obj-proxy`, images to `src/__mocks__/fileMock.ts`; `@/` aliases `src/`.
- Stories live in `src/stories/`, titled `Components/<Feature>/<Name>` with `tags: ['autodocs']`, and use `fn()` from `storybook/test` for callback args. Module stories typically render inside `Sidebar` + `Header` + `Footer` for a full-page layout. `scripts/generate-lhci-urls.js` derives Lighthouse URLs from each story's `title`, so every story file needs a literal `title:`.
- `vitest.config.ts` is only the Storybook Vitest addon (browser tests of stories via Playwright), separate from `npm test`.

## Pull request reviewers

Every PR requests a review from the whole team, minus its author: `CarolinHugo`, `LAURETbenjamin`, `MathTek` and `Quentintnrl` (`gh pr create … --reviewer CarolinHugo,LAURETbenjamin,MathTek`). `.github/CODEOWNERS` makes GitHub request them automatically as well.
